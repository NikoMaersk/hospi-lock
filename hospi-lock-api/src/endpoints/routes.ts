import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { User } from '../models/user.js';
import LockController, { Locking } from '../services/lock-controller.js';
import AuthService, { Role } from '../services/auth-service.js';
import { Lock, LockRequest } from '../models/lock.js';
import UserService from '../services/database/user-service.js';
import LockService from '../services/database/lock-service.js';
import LogService from '../services/database/log-service.js';
import { Admin, AdminRequest } from '../models/admin.js';
import AdminService from '../services/database/admin-service.js';
import { Log, LogRequest } from '../models/log.js';
import { ServiceFactory } from '../services/service-factory.js';

const cookieParser = require("cookie-parser");

const routes = express();

routes.use(cookieParser());

let corsOptions = {
  origin: [`http://${process.env.WEB_IP}:${process.env.WEB_PORT}`, 'http://localhost:3000'],
  credentials: true
}

routes.use(cors(corsOptions));
routes.use(express.static("public"));
routes.use(bodyParser.urlencoded({ extended: false }));
routes.use(bodyParser.json());

const serviceFactory: ServiceFactory = ServiceFactory.getInstance();

const userService: UserService = serviceFactory.getUserService();
const adminService: AdminService = serviceFactory.getAdminService();
const lockService: LockService = serviceFactory.getLockService();
const logService: LogService = serviceFactory.getLogInstance();
const authService: AuthService = serviceFactory.getAuthService();
const lockController: LockController = serviceFactory.getLockController();


// Create new user
routes.post('/users', async (req, res) => {
  const user: User = req.body;
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const addRequest = await userService.addUserAsync(user);

    if (!addRequest.success) {
      return res.status(addRequest.statusCode).send(addRequest.message);
    }

    const { password, ...userWithoutPassword } = user;
    console.log(`New user created: ${email}`)
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    const errorMessage = 'Internal server error'
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


// Get specific user with email as parameter
routes.get('/users/:email', authService.verifyToken, async (req, res) => {
  const { email } = req.params;
  try {
    const dataRequest = await userService.getUserByEmailAsync(email);
    console.log(`GET user request: ${dataRequest.success}`)

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
routes.get('/users', authService.verifyToken, authService.checkRole(Role.ADMIN), async (req, res) => {
  try {
    const userRecords = await userService.getAllUsersAsync();

    return res.status(200).json(userRecords);
  } catch (error) {
    const errorMessage = 'Error fetching users';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


// Patch user password
routes.patch('/users/:email/password', async (req, res) => {
  const { email } = req.params;
  const { password } = req.body;

  try {
    const patchRequest = await userService.patchPasswordAsync(email, password);

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

    const authResult = await authService.authenticationAsync(email, password, Role.USER);

    const logSuccess = await logService.logSigninMessageAsync(email, authResult.success, ipAddress);

    if (!authResult.success) {
      return res.status(authResult.statusCode).send(authResult.message);
    }

    const token = authService.generateToken(email, Role.USER);

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
routes.post('/locks/user', authService.verifyToken, async (req, res) => {
  let { email, id } = req.body;

  if (!email || !id) {
    return res.status(400).send('Missing required fields');
  }

  try {

    const lockRequest: LockRequest = await lockService.addLockForUserAsync(email, id);

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
routes.get('/locks/email/:email', authService.verifyToken, async (req, res) => {
  let { email } = req.params;

  try {
    const lockRequest: LockRequest = await lockService.getLockByEmail(email);

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
routes.get('/locks/id/:id', authService.verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const lockRequest: LockRequest = await lockService.getLockByIdAsync(id);

    if (!lockRequest.success) {
      return res.status(lockRequest.statusCode).send(lockRequest.message);
    }

    return res.status(200).send(lockRequest.lock);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


// Returns the status of a specific lock
routes.get('/locks/status/:id', authService.verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const statusRequest = await lockService.getLockStatusAsync(id);

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
routes.post('/locks', authService.verifyToken, authService.checkRole(Role.ADMIN), async (req, res) => {
  const lockRequest: Lock = req.body;

  if (!lockRequest || !lockRequest.ip) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const addRequest: LockRequest = await lockService.addLockAsync(lockRequest);

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
routes.get('/locks', authService.verifyToken, authService.checkRole(Role.ADMIN), async (req, res) => {
  try {
    const lockRecords = await lockService.getAllLocksAsync();

    return res.status(200).json(lockRecords);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


// Attempts to unlock a lock registered to a specific user
routes.post('/locks/unlock/:email', authService.verifyToken, async (req, res) => {
  const { email } = req.params;

  try {
    const isSuccess = await lockController.lockingAsync(email, Locking.UNLOCK);

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


// Attempts to lock a lock registered to a specific user
routes.post('/locks/lock/:email', authService.verifyToken, async (req, res) => {
  const { email } = req.params;

  try {
    const isSuccess = await lockController.lockingAsync(email, Locking.LOCK);

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


// Registers a new admin in the system
routes.post('/admin', authService.verifyToken, authService.checkRole(Role.ADMIN), async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Missing required fields');
  }

  try {

    const tempAdmin: Admin = {
      email: email,
      password: password
    }

    const request: AdminRequest = await adminService.addAdminAsync(tempAdmin);

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


// Authenticates admin sign in and returns a cookie if successful
routes.post('/admin/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const authResult = await authService.authenticationAsync(email, password, Role.ADMIN);

    console.log(`Admin signin: ${authResult.success}, message: ${authResult.message}`);

    if (!authResult.success) {
      return res.status(400).send(authResult.message);
    }

    const token = authService.generateToken(email, Role.ADMIN);

    return res
      .cookie('access_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: parseInt(process.env.JWT_EXPIRATION_TIME, 10) })
      .status(200)
      .send({ message: authResult.message });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


// Clears the cookie if one is authenticated
routes.post("/signout", authService.verifyToken, (req, res) => {
  return res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Successfully logged out" });
});


// Returns all registered admins
routes.get('/admin', authService.verifyToken, authService.checkRole(Role.ADMIN), async (req, res) => {
  try {
    const adminRecords = await adminService.getAllAdmins();

    return res.status(200).json(adminRecords);
  } catch (error) {
    const errorMessage = 'Error fetching users';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


// Returns a specific admin based on email
routes.get('/admin/:email', authService.verifyToken, authService.checkRole(Role.ADMIN), async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const request: AdminRequest = await adminService.getAdminByEmailAsync(email);

    if (!request.success) {
      return res.status(request.statusCode).send(request.message);
    }

    return res.status(200).json(request.admin);
  } catch (error) {
    const errorMessage = 'Internal server error';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


// Returns either all logs related to the locks, if no offset and limit is given or a number of logs as specified by the offset and limit
routes.get('/logs/lock', authService.verifyToken, authService.checkRole(Role.ADMIN), async (req, res) => {
  const offset: number = parseInt(req.query.offset as string);
  const limit: number = parseInt(req.query.limit as string);

  try {
    let logRequest: Log[] = null;

    if (offset || limit) {
      logRequest = await logService.getPartialLockingLogsAsync(offset, limit);
    } else {
      logRequest = await logService.getAllLockingLogsAsync();
    }

    return res.status(200).json(logRequest);
  } catch (error) {
    const errorMessage = 'Internal server error';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


// Returns either all logs related to the user signin, if no offset and limit is given or a number of logs as specified by the offset and limit
routes.get('/logs/signin', authService.verifyToken, authService.checkRole(Role.ADMIN), async (req, res) => {
  const offset: number = parseInt(req.query.offset as string);
  const limit: number = parseInt(req.query.limit as string);

  try {

    let logRequest: Log[] = null;

    if (offset || limit) {
      logRequest = await logService.getPartialSigninLogsAsync(offset, limit);
    } else {
      logRequest = await logService.getAllSigninLogsAsync();
    }

    return res.status(200).json(logRequest);
  } catch (error) {
    const errorMessage = 'Internal server error';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


// Posts a new log. These are expected to be generated by the locks themselves
routes.post('/logs', async (req, res) => {
  const { timestamp, ip, status } = req.body;

  if (!timestamp || !ip) {
    return res.status(400).send('Missing required fields');
  }

  if (timestamp.length !== 13) {
    return res.status(400).send('Timestamp must be epoch in milliseconds');
  }

  try {

    const logRequest: LogRequest = await logService.logLockingMessageAsync(timestamp, ip, status);

    if (!logRequest.success) {
      return res.status(500).send(logRequest.message)
    }

    return res.status(201).json({ timestamp: timestamp, ip: ip, status: status });
  } catch (error) {
    const errorMessage = 'Internal server error';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


// Validates a cookie and responds with the admin info, the cookie is generated for if succesful
routes.post('/admin/auth', authService.verifyToken, authService.checkRole(Role.ADMIN), async (req, res) => {
  const email = req.email;

  const adminRequest: AdminRequest = await adminService.getAdminByEmailAsync(email);

  if (!adminRequest.success) {
    console.log('Admin authentication denied');
    return res.status(adminRequest.statusCode).send(adminRequest.message);
  }

  const { password, ...adminWithoutPassword } = adminRequest.admin;

  console.log(`Admin authenticated: ${adminWithoutPassword.email}`);

  return res.status(200).json(adminWithoutPassword);
});


routes.get('/health', async (req, res) => {
  res.status(200).send('OK');
});


routes.get('*', (req, res) => {
  return res.status(404).send('no such route');
});


export { routes }