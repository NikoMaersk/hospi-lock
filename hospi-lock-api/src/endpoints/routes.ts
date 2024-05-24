import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { RedisClient } from '../services/database-service.js';
import { User } from '../models/User.js';
import LockController, { LOCKING } from '../services/lock-controller.js';
import LogService from '../services/database/log-service.js';
import AuthService from '../services/auth-service.js';
import Lock from '../models/lock.js';
import UserService from '../services/database/user-service.js';
import LockService, { LockRequest } from '../services/database/lock-service.js';

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

  try {
    const ipAddress: string = req.headers['x-forwarded-for']?.[0] || req.socket.remoteAddress || "unknown";

    const authResult = await AuthService.Authentication(email, password);

    const logSuccess = await LogService.logMessage(email, authResult.success, ipAddress);

    console.log(`log success: ${logSuccess.success}, message: ${logSuccess.message}`);

    return res.status(authResult.statusCode).send(authResult.message);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});



// Register a user under a lock
routes.post('/locks/user', async (req, res) => {
  let { email, id } = req.body;

  if (!email || !id) {
    return res.status(400).send('Missing required fields');
  }

  try {

    const lockRequest: LockRequest = await LockService.addLockForUser(email, id);

    if (!lockRequest.success) {
      return res.status(lockRequest.statusCode).send(lockRequest.message);
    }

    return res.status(201).json({ email: email, id: id });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


// Get a specific lock with a registered email
routes.get('/locks/email/:email', async (req, res) => {
  let { email } = req.params;

  try {
    const lockRequest: LockRequest = await LockService.getLockByEmail(email);

    if (!lockRequest.success) {
      return res.status(lockRequest.statusCode).send(lockRequest.message);
    }

    return res.status(200).json(lockRequest.lock);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


// Get a specific lock with a id
routes.get('/locks/id/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const lockRequest: LockRequest = await LockService.getLockById(id);

    if (!lockRequest.success) {
      return res.status(lockRequest.statusCode).send(lockRequest.message);
    }

    return res.status(200).send(lockRequest.lock);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


routes.get('/locks/status/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const lockStatus = await LockService.getLockStatus(id);

    if (!lockStatus.success) {
      return res.status(lockStatus.statusCode).send(lockStatus.message);
    }

    return res.status(200).json(lockStatus.lockStatus);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }

});


// Post a new lock
routes.post('/locks', async (req, res) => {
  const lockRequest: Lock = req.body;

  if (!lockRequest || !lockRequest.ip) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const addRequest: LockRequest = await LockService.addLock(lockRequest);

    if (!addRequest.success) {
      return res.status(addRequest.statusCode).send(addRequest.message);
    }

    return res.status(201).json(addRequest.lock);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


// Get all locks
routes.get('/locks', async (req, res) => {
  try {
    const lockRecords = await LockService.getAllLocks();

    return res.status(200).json(lockRecords);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


routes.post('/locks/unlock/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const isSuccess = await LockController.lockingAsync(email, LOCKING.UNLOCK);

    if (!isSuccess) {
      return res.status(400).send(isSuccess.message);
    }

    return res.status(200).send('OK');
  } catch (error) {
    const errorMessage = 'Internal server error';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


routes.post('/locks/lock/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const isSuccess = await LockController.lockingAsync(email, LOCKING.LOCK);

    if (!isSuccess) {
      return res.status(400).send(isSuccess.message);
    }

    return res.status(200).send('OK');
  } catch (error) {
    const errorMessage = 'Internal server error';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


routes.get('/logs', async (req, res) => {
  try {
    const deserializedData = await LogService.getAllLogs();
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


routes.get('*', (req, res) => {
  return res.status(404).send('no such route');
});


export { routes }