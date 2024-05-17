import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { RedisClient } from '../services/database-service.js';
import { User } from '../models/user.js';
import LogService from '../services/log_service.js';

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
    const tempUser = await RedisClient.hGetAll(email);
    const userAlreadyExists = tempUser && Object.keys(tempUser).length > 0;

    if (userAlreadyExists) {
      return res.status(400).send('User already exists');
    }

    let now = new Date();

    await RedisClient.hSet(email, {
      password: password,
      first_name: firstName,
      last_name: lastName,
      reg_date: now.toISOString(),
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


routes.get('/users/:email', async (req, res) => {
  const { email } = req.params;
  const lowerCaseEmail = email.toLowerCase();
  try {
    const tempUser = await RedisClient.hGetAll(lowerCaseEmail);

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


routes.post('/auth', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const tempUser = await RedisClient.hGetAll(email.toLowerCase());
    const userExists = tempUser && Object.keys(tempUser).length > 0;

    if (!userExists) {
      return res.status(400).send('No registered user with that email');
    }

    if (password !== tempUser.password) {
      return res.status(401).send('Invalid password')
    }

    return res.status(200).send('OK');

  } catch (error) {
    const errorMessage = 'Internal server error';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


routes.get('/users/', async (req, res) => {
  try {
    const keys = await RedisClient.keys("*");
    const allHashes: Record<string, User> = {};

    for (const key of keys) {
      const hashValues = await RedisClient.hGetAll(key);
      allHashes[key] = hashValues;
    }

    return res.status(200).json(allHashes);
  } catch (error) {
    const errorMessage = 'Error fetching users';
    console.error(`${errorMessage} : `, error);
    return res.status(500).send(errorMessage);
  }
});


routes.get('/health', async (req, res) => {
  try {
    const response = await LogService.logMessage('user@example.com', true);
    if (response.success) {
      console.log(response.message);
    } else {
      console.error(response.error);
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling health check:', error);
    res.status(500).send('Internal Server Error');
  }
});


routes.get('*', (req, res) => {
  return res.status(404).send('no such route');
});


export { routes }