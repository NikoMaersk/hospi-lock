const redis = require('redis');

// Create a client and connect to Redis server
const IP = process.env.DB_IP || "redis";
const PORT = process.env.DB_PORT || "6379";

const url = `redis://${IP}:${PORT}`;

const RedisClient = redis.createClient({
    url
});

RedisClient.connect().then(() => {
    RedisClient.ping().then(response => console.log(response));
});

export { RedisClient };