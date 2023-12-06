# alx-files_manager
A simple file upload and viewing platform 

# Task 0 Redis utils
Inside the folder utils, create a file redis.js that contains the class RedisClient.

RedisClient should have:

- the constructor that creates a client to Redis:
- any error of the redis client must be displayed in the console (you should use on('error') of the redis client)
- a function isAlive that returns true when the connection to Redis is a success otherwise, false
- an asynchronous function get that takes a string key as argument and returns the Redis value stored for this key
- an asynchronous function set that takes a string key, a value and a duration
  in seconds as arguments to store it in Redis (with an expiration set by the
  duration argument)
- an asynchronous function del that takes a string key as argument and remove the value in Redis for this key
After the class definition, create and export an instance of RedisClient
called redisClient.

# Algorithm to solve Task 0 Redis utils

1. Create a folder in parent directory called utils.
2. Inside the utils folder, create a file named redis.js.
3. In redis.js, define the RedisClient class.
- Constructor:
    1. Create a constructor that initializes a Redis client.
    2. Use the on('error') event to log any errors to the console.
- isAlive function:
    1. Implement a function named isAlive that returns true if the connection to Redis is successful and false otherwise.
- get function:
    1.  Implement an asynchronous function named get that takes a string key as an argument and returns the Redis value stored for that key.
- set function:
    1. Implement an asynchronous function named set that takes a string key, a value, and a duration in seconds as arguments.
    2. Use the set method of the Redis client to store the value with an expiration set by the duration argument.
- del function:
    1. Implement an asynchronous function named del that takes a string key as an argument and removes the value in Redis for that key.
- Create an instance of RedisClient called redisClient.
- Export the redisClient instance.



