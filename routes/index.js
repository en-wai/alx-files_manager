// routes/index.js
const express = require('express');
const router = express.Router();
const AppController = require('../controllers/AppController');

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Add the new endpoint for creating a new user
router.post('/users', UsersController.postNew);

module.exports = router;
