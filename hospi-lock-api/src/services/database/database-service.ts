const redis = require('redis');

// Create a client and connect to Redis server
const IP = process.env.DB_IP || "redis";
const PORT = process.env.DB_PORT;

const url = `redis://${IP}:${PORT}`;

// Creates a redis client instance pointing to database0
const RedisClientDb0 = redis.createClient({
    url
});

// Creates a redis client instance pointing to database1
const RedisClientDb1 = redis.createClient({
    url,
    database: 1
});

Promise.all([
    RedisClientDb0.connect(),
    RedisClientDb1.connect()
]).then(() => {
    console.log("Connected to Redis databases");
    return Promise.all([
        RedisClientDb0.ping(),
        RedisClientDb1.ping()
    ]);
}).then(responses => {
    console.log(`DB 0 Ping response: ${responses[0]}`);
    console.log(`DB 1 Ping response: ${responses[1]}`);
}).catch(err => {
    console.error("Error connecting to Redis:", err);
});


export { RedisClientDb0, RedisClientDb1 };