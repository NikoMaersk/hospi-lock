import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { User } from '../models/User.js';
import LockController, { LOCKING } from '../services/lock-controller.js';
import LogService from '../services/database/log-service.js';
import AuthService, { Role } from '../services/auth-service.js';
import Lock from '../models/lock.js';
import UserService from '../services/database/user-service.js';
import LockService, { LockRequest } from '../services/database/lock-service.js';
import Admin, { AdminRequest } from '../models/admin.js';
import AdminService from '../services/database/admin-service.js';

const cookieParser = require("cookie-parser");

const routes = express();

routes.use(cookieParser());
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
routes.get('/users/:email', AuthService.verifyToken, async (req, res) => {
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
routes.get('/users', AuthService.verifyToken, AuthService.checkRole(Role.ADMIN), async (req, res) => {
  try {
    const userRecords = await UserService.getAllUsersAsync();

    return res.status(200).json(userRecords);
  } catch (error) {
    const errorMessage = 'Error fetching users';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


// Patch user password
routes.patch('/users/:email/password', AuthService.verifyToken, async (req, res) => {
  const { email } = req.params;
  const { password } = req.body;

  try {
    const patchRequest = await UserService.patchPasswordAsync(email, password);

    if (!patchRequest.success) {
      return res.status(patchRequest.statusCode).send(patchRequest.message);
    }

    return res.status(200).send('Password successfully changed');
  } catch (error) {
    const errorMessage = 'Internal server error'
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


// Sign in with user
routes.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const ipAddress: string = req.headers['x-forwarded-for']?.[0] || req.socket.remoteAddress || "unknown";

    const authResult = await AuthService.AuthenticationAsync(email, password, Role.USER);

    const logSuccess = await LogService.logMessageAsync(email, authResult.success, ipAddress);

    if (!authResult.success) {
      return res.status(authResult.statusCode).send(authResult.message);
    }

    const token = AuthService.generateToken(email, Role.USER);

    console.log(`log success: ${logSuccess.success}, message: ${logSuccess.message}`);

    return res
      .cookie('access_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: parseInt(process.env.JWT_EXPIRATION_TIME, 10) })
      .status(authResult.statusCode)
      .send({ message: authResult.message });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


// Register a user under a lock
routes.post('/locks/user', AuthService.verifyToken, async (req, res) => {
  let { email, id } = req.body;

  if (!email || !id) {
    return res.status(400).send('Missing required fields');
  }

  try {

    const lockRequest: LockRequest = await LockService.addLockForUserAsync(email, id);

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
routes.get('/locks/email/:email', AuthService.verifyToken, AuthService.checkRole(Role.ADMIN), async (req, res) => {
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
routes.get('/locks/id/:id', AuthService.verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const lockRequest: LockRequest = await LockService.getLockByIdAsync(id);

    if (!lockRequest.success) {
      return res.status(lockRequest.statusCode).send(lockRequest.message);
    }

    return res.status(200).send(lockRequest.lock);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


routes.get('/locks/status/:id', AuthService.verifyToken, AuthService.checkRole(Role.ADMIN), async (req, res) => {
  const { id } = req.params;

  try {
    const statusRequest = await LockService.getLockStatusAsync(id);

    if (!statusRequest.success) {
      return res.status(statusRequest.statusCode).send(statusRequest.message);
    }

    return res.status(200).json({ id: id, status: statusRequest.lockStatus });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


// Post a new lock
routes.post('/locks', AuthService.verifyToken, AuthService.checkRole(Role.ADMIN), async (req, res) => {
  const lockRequest: Lock = req.body;

  if (!lockRequest || !lockRequest.ip) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const addRequest: LockRequest = await LockService.addLockAsync(lockRequest);

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
routes.get('/locks', AuthService.verifyToken, AuthService.checkRole(Role.ADMIN), async (req, res) => {
  try {
    const lockRecords = await LockService.getAllLocksAsync();

    return res.status(200).json(lockRecords);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


routes.post('/locks/unlock/:email', AuthService.verifyToken, async (req, res) => {
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


routes.post('/locks/lock/:email', AuthService.verifyToken, async (req, res) => {
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


routes.post('/admin', AuthService.verifyToken, AuthService.checkRole(Role.ADMIN), async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Missing required fields');
  }

  try {

    const tempAdmin: Admin = {
      email: email,
      password: password
    }

    const request: AdminRequest = await AdminService.addAdminAsync(tempAdmin);

    if (!request.success) {
      return res.status(request.statusCode).send(request.message);
    }

    return res.status(201).json(email);

  } catch (error) {
    const errorMessage = 'Internal server error';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


routes.post('/admin/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const authResult = await AuthService.AuthenticationAsync(email, password, Role.ADMIN);

    console.log(`Admin signin: ${authResult.success}, message: ${authResult.message}`);

    if (!authResult.success) {
      return res.status(authResult.statusCode).send(authResult.message);
    }

    const token = AuthService.generateToken(email, Role.ADMIN);

    return res
      .cookie('access_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: parseInt(process.env.JWT_EXPIRATION_TIME, 10) })
      .status(authResult.statusCode)
      .send({ message: authResult.message });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


routes.post("/signout", AuthService.verifyToken, (req, res) => {
  return res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Successfully logged out" });
});


routes.get('/admin', AuthService.verifyToken, AuthService.checkRole(Role.ADMIN), async (req, res) => {
  try {
    const adminRecords = await AdminService.getAllAdmins();

    return res.status(200).json(adminRecords);
  } catch (error) {
    const errorMessage = 'Error fetching users';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


routes.get('/admin/:email', AuthService.verifyToken, AuthService.checkRole(Role.ADMIN), async (req, res) => {
  const { email } = req.params;

  const request: AdminRequest = await AdminService.getAdminByEmailAsync(email);

  if (!request.success) {
    return res.status(request.statusCode).send(request.message);
  }

  return res.status(200).json(request.user);
});


routes.get('/logs', AuthService.verifyToken, AuthService.checkRole(Role.ADMIN), async (req, res) => {
  try {
    const deserializedData = await LogService.getAllLogsAsync();
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