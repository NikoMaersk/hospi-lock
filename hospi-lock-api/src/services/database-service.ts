const redis = require('redis');

// Create a client and connect to Redis server
const url = 'redis://redis:6379';
const RedisClient = redis.createClient({
    url
});

RedisClient.connect().then(() => {
    RedisClient.ping().then(response => console.log(response));
});

export { RedisClient };