import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { RedisClient } from '../services/DB.js';
import { User } from '../models/User.js';

const routes = express();

routes.use(cors());
routes.use(express.static("public"));
routes.use(bodyParser.urlencoded({ extended: false }));
routes.use(bodyParser.json());


routes.post('/users', async (req, res) => {
  const user: User = req.body;
  const { email, password } = req.body;

  if (!email || !password) {
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
      reg_date: now.toISOString(),
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('A server error occurred');
  }
});


routes.get('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  try {

  } catch (error) {
    const errorMessage = 'Error fetching user id'
    console.error(errorMessage + ': ', error);
    res.status(500).send(errorMessage);
  }
});


routes.get('/health', (req, res) => {
  res.status(200).send('OK');
});


routes.get('*', (req, res) => {
  return res.status(404).send('no such route');
});


export { routes }