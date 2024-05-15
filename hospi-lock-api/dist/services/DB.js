"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisClient = void 0;
const redis = require('redis');
// Create a client and connect to Redis server
const url = 'redis://localhost:6379';
const RedisClient = redis.createClient({
    url
});
exports.RedisClient = RedisClient;
RedisClient.connect().then(() => {
    RedisClient.ping().then(response => console.log(response));
});
//# sourceMappingURL=DB.js.map