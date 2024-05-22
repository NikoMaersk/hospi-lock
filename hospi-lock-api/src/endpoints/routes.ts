import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { RedisClient } from '../services/database-service.js';
import { User } from '../models/user.js';
import LockController from '../services/lock-controller.js';
import LogService from '../services/log-service.js';
import AuthService from '../services/authService.js';
import RegisterLock from '../models/registerLock.js';

const routes = express();

routes.use(cors());
routes.use(express.static("public"));
routes.use(bodyParser.urlencoded({ extended: false }));
routes.use(bodyParser.json());


routes.post('/users', async (req, res) => {
  const user: User = req.body;
  const email: string = user.email.toLowerCase();
  const { password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const tempUser = await RedisClient.hGetAll(`user:${email}`);
    const userAlreadyExists = tempUser && Object.keys(tempUser).length > 0;

    if (userAlreadyExists) {
      return res.status(400).send('User already exists');
    }

    let now = new Date();

    await RedisClient.hSet(`user:${email}`, {
      password: password,
      first_name: firstName,
      last_name: lastName,
      reg_date: now.toISOString(),
      lock: user.lock || "",
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


routes.get('/users/:email', async (req, res) => {
  const { email } = req.params;
  const lowerCaseEmail = email.toLowerCase();
  try {
    const tempUser = await RedisClient.hGetAll(`user:${lowerCaseEmail}`);

    if (Object.keys(tempUser).length === 0) {
      return res.status(400).send('No registered user with that email');
    }

    const user: User = {
      email: lowerCaseEmail,
      password: tempUser.password,
      firstName: tempUser.first_name,
      lastName: tempUser.last_name,
      date: tempUser.reg_date
    }

    return res.status(200).json(user);
  } catch (error) {
    const errorMessage = 'Error fetching email'
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


routes.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  const ipAddress: string = req.headers['x-forwarded-for']?.[0] || req.socket.remoteAddress || "unknown";

  const authResult = await AuthService.Authentication(email, password);

  const logSuccess = await LogService.logMessage(email, authResult.success, ipAddress);

  console.log(`log success: ${logSuccess.success}, message: ${logSuccess.message || logSuccess.error}`);

  return res.status(authResult.statusCode).send(authResult.message);
});


routes.get('/users/', async (req, res) => {
  try {
    const keys = await RedisClient.keys("*");
    const allHashes: Record<string, User> = {};

    for (const key of keys) {
      const hashValues = await RedisClient.hGetAll(`user:${key}`);
      allHashes[key] = hashValues;
    }

    return res.status(200).json(allHashes);
  } catch (error) {
    const errorMessage = 'Error fetching users';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


routes.post('/locks/user', async (req, res) => {
  const { email, lockID: lockId } = req.body;

  if (!email || !lockId) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const authResult = await AuthService.VerifyExistence(email);

    if (!authResult.success) {
      return res.status(authResult.statusCode).send(authResult.message);
    }

    const lock = await RedisClient.hGetAll(`lock:${lockId}`);

    if (Object.keys(lock).length === 0) {
      return res.status(400).send('No registered lock with that id');
    }

    await RedisClient.hSet(`lock:${lockId}`, {
      user_email: email,
    })

    return res.status(201).json({ email: email, lockID: lockId });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


routes.get('/locks/:email', async (req, res) => {
  const email = req.params;

  try {
    const user: User = await RedisClient.hGetAll(`user:${email}`);
    const lock: RegisterLock = await RedisClient.hGetAll(`lock:${user.lock}`);

    if (!lock) {
      return res.status(400).send('No lock registeret with that email');
    }

    return res.status(200).json(lock);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }

});


routes.get('/locks/:id', async (req, res) => {
  const id = req.params;

  return res.status(418).send('OK');

});


routes.post('/locks', async (req, res) => {
  const lockRequest: RegisterLock = req.body;

  if (!lockRequest || !lockRequest.id || !lockRequest.ip) {
    return res.status(400).send('Missing required fields');
  }

  try {

    if (lockRequest.email) {
      const authResult = await AuthService.VerifyExistence(lockRequest.email);

      if (!authResult.success) {
        return res.status(authResult.statusCode).send(authResult.message);
      }
    }

    await RedisClient.hSet(`lock:${lockRequest.id}`, lockRequest);

    return res.status(201).send(lockRequest);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
})


routes.post('/unlock/:email', async (req, res) => {
  const email = req.params;

  try {
    const isSuccess = await LockController.unlockAsync();

    if (!isSuccess) {
      return res.status(400).send(isSuccess.message);
    }

    return res.status(418).send('OK');
  } catch (error) {
    const errorMessage = 'Internal server error';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


routes.post('/lock/:email', async (req, res) => {
  const email = req.params;

  try {
    const isSuccess = await LockController.lockAsync();

    if (!isSuccess) {
      return res.status(400).send(isSuccess.message);
    }

    return res.status(418).send('OK');
  } catch (error) {
    const errorMessage = 'Internal server error';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


routes.get('/logs', async (req, res) => {
  try {
    await RedisClient.sendCommand(['SELECT', '1']);
    const data = await RedisClient.zRange('logs', 0, -1);
    const deserializedData = JSON.parse(data);
    await RedisClient.sendCommand(['SELECT', '0']);
    return res.status(200).json(deserializedData);
  } catch (error) {
    const errorMessage = 'Internal server error';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


routes.post('/auth', async (req, res) => {
  res.redirect(302, '/signin');
});


routes.get('/health', async (req, res) => {
  res.status(200).send('OK');
});


routes.post('/test', async (req, res) => {
  const response = await LockController.unlockAsync();
  return res.status(200).json(response);
})


routes.get('*', (req, res) => {
  return res.status(404).send('no such route');
});


export { routes }