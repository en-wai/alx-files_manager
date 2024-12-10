// utils/redis.js

// Import the Redis client library
import redis from 'redis';
import { createClient } from 'redis';

/**
 * RedisClient class provides an abstraction layer for interacting with Redis.
 * This includes utility methods for checking the connection status, 
 * and performing common operations like GET, SET, and DEL.
 */
class RedisClient {
  constructor() {
    // Initialize the Redis client
    this.client = redis.createClient();

    // Handle connection errors
    this.client.on('error', (error) => {
      console.error(`Redis client error: ${error}`);
    });
  }

  /**
   * Checks if the Redis client is connected.
   * @returns {boolean} - True if the Redis client is connected, false otherwise.
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Fetches a value from Redis by its key.
   * @param {string} key - The key to look up in Redis.
   * @returns {Promise<string | null>} - The value associated with the key, or null if not found.
   */
  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }

  /**
   * Sets a key-value pair in Redis with an expiration time.
   * @param {string} key - The key to set in Redis.
   * @param {string} value - The value to associate with the key.
   * @param {number} duration - Expiration time in seconds.
   * @returns {Promise<void>} - Resolves when the operation is complete.
   */
  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Deletes a key-value pair from Redis.
   * @param {string} key - The key to delete.
   * @returns {Promise<void>} - Resolves when the operation is complete.
   */
  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

// Export a singleton instance of RedisClient for use throughout the project.
// Using a singleton ensures there is only one Redis client instance managing the connection pool.
const redisClient = new RedisClient();
export default redisClient;
