// controllers/AppController.js
const { response } = require('express');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const AppController = {
  getStatus: async (req, res) => {
    const dbIsAlive = dbClient.isAlive();
    const redisIsAlive = redisClient.isAlive();

    if (dbIsAlive && redisIsAlive) {
      res.status(200).json({ redis: true, db: true });
    } else {
      res.status(500).json({ redis: false, db: false });
    }
  },

  getStats: async (req, res) => {
    try {
      const usersCount = await dbClient.nbUsers();
      const filesCount = await dbClient.nbFiles();
      res.status(200).json({ users: usersCount, files: filesCount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = AppController;
