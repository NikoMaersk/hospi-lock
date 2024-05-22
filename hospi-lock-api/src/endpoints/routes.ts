import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { RedisClient } from '../services/database-service.js';
import { User } from '../models/User.js';
import LockController from '../services/lock-controller.js';
import LogService from '../services/log-service.js';
import AuthService from '../services/auth-service.js';
import RegisterLock from '../models/registerLock.js';
import UserService from '../services/database/user-service.js';

const routes = express();

routes.use(cors());
routes.use(express.static("public"));
routes.use(bodyParser.urlencoded({ extended: false }));
routes.use(bodyParser.json());


// Create new user
routes.post('/users', async (req, res) => {
  const user: User = req.body;
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const addRequest = await UserService.addUserAsync(user);

    if (!addRequest.success) {
      return res.status(addRequest.statusCode).send(addRequest.message);
    }

    const { password, ...userWithoutPassword } = user;

    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    const errorMessage = 'Internal server error'
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


// Get specific user with email as parameter
routes.get('/users/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const dataRequest = await UserService.getUserByEmailAsync(email);

    if (!dataRequest.success) {
      return res.status(dataRequest.statusCode).send(dataRequest.message);
    }

    return res.status(200).json(dataRequest.user);
  } catch (error) {
    const errorMessage = 'Internal server error'
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


// Get all users
routes.get('/users', async (req, res) => {
  try {
    const userRecords = await UserService.getAllUsersAsync();

    return res.status(200).json(userRecords);
  } catch (error) {
    const errorMessage = 'Error fetching users';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


// Sign in with user
routes.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  const ipAddress: string = req.headers['x-forwarded-for']?.[0] || req.socket.remoteAddress || "unknown";

  const authResult = await AuthService.Authentication(email, password);

  const logSuccess = await LogService.logMessage(email, authResult.success, ipAddress);

  console.log(`log success: ${logSuccess.success}, message: ${logSuccess.message || logSuccess.error}`);

  return res.status(authResult.statusCode).send(authResult.message);
});



// Register a user under a lock
routes.post('/locks/user', async (req, res) => {
  let { email, lockId } = req.body;
  email = email.toLowerCase();

  if (!email || !lockId) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const authResult = await AuthService.CheckUserExistence(email);

    if (!authResult.success) {
      return res.status(authResult.statusCode).send(authResult.message);
    }

    const lock = await RedisClient.hGetAll(`lock:${parseInt(lockId, 10)}`);

    if (Object.keys(lock).length === 0) {
      return res.status(400).send('No registered lock with that id');
    }

    await RedisClient.hSet(`lock:${lockId}`, {
      user_email: email,
    });

    await RedisClient.hSet(`user:${email}`, {
      lock_id: lockId,
    });

    return res.status(201).json({ email: email, lockID: lockId });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


// Get a specific lock with a registered email
routes.get('/locks/email/:email', async (req, res) => {
  let { email } = req.params;

  try {
    const authResult = await AuthService.CheckUserExistence(email);
    const user = authResult.user;

    if (!authResult.success) {
      return res.status(authResult.statusCode).send(authResult.message);
    }

    const lock = await RedisClient.hGetAll(`lock:${parseInt(user.lock_id, 10)}`);

    if (Object.keys(lock).length === 0) {
      return res.status(400).send('No lock registeret with that email');
    }

    return res.status(200).json(lock);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


// Get a specific lock with a id
routes.get('/locks/id/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const lock = await RedisClient.hGetAll(`lock:${parseInt(id, 10)}`);

    if (Object.keys(lock).length === 0) {
      return res.status(400).send('No lock with that id');
    }

    return res.status(200).send(lock);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


// Post a new lock
routes.post('/locks', async (req, res) => {
  const lockRequest: RegisterLock = req.body;

  if (!lockRequest || !lockRequest.ip) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const newId = await RedisClient.incr('lock_id_counter');
    lockRequest.id = newId.toString();

    if (lockRequest.email) {
      const authResult = await AuthService.CheckUserExistence(lockRequest.email);

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
});


// Get all locks
routes.get('/locks', async (req, res) => {
  try {
    const keys = await RedisClient.keys('lock:*')
    const allHashes: Record<string, RegisterLock> = {};

    for (const key of keys) {
      const hashValues = await RedisClient.hGetAll(key);
      allHashes[key] = hashValues;
    }

    return res.status(200).json(allHashes);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


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