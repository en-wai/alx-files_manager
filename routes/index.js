// routes.js
const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController')
const FilesController = require('../controllers/FilesController')

const router = express.Router();

// Define routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);


router.post('/files', FilesController.postUpload);
// Define the route for getting a file by its ID
router.get('/files/:id', FilesController.getShow);
// Define the route for listing all files with pagination and parentId filter
router.get('/files', FilesController.getIndex);
// Route to publish a file
router.put('/files/:id/publish', FilesController.putPublish);
// Route to unpublish a file
router.put('/files/:id/unpublish', FilesController.putUnpublish);
// New endpoint for fetching file data
router.get('/files/:id/data', FilesController.getFile);

module.exports = router;


