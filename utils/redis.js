// Step 3: Define the RedisClient class in redis.js
const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    // Create a Redis client
    this.client = redis.createClient();

    // Handle errors
    this.client.on('error', (err) => {
      console.error(`Error connecting to Redis: ${err}`);
    });
  }

  // Check if the connection to Redis is alive
  isAlive() {
    return this.client.connected;
  }

  // Get value from Redis
  async get(key) {
    const getAsync = promisify(this.client.get).bind(this.client);
    return getAsync(key);
  }

  // Set value in Redis with expiration
  async set(key, value, durationInSeconds) {
    return this.client.setex(key, durationInSeconds, value);
  }

  // Delete value from Redis
  async del(key) {
    return this.client.del(key);
  }
}

// Step 4: Create an instance of RedisClient
const redisClient = new RedisClient();

// Step 5: Export the redisClient instance
module.exports = redisClient;
