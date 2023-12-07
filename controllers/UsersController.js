// controllers/UsersController.js
const { response } = require('express');
const dbClient = require('../utils/db');
const sha1 = require('sha1');

const UsersController = {
  postNew: async (req, res) => {
    try {
      // Extract email and password from request body
      const { email, password } = req.body;

      // Check for missing email or password
      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      // Check if the email already exists in the database
      const existingUser = await dbClient.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password using SHA1
      const hashedPassword = sha1(password);

      // Save the new user in the users collection
      const newUser = await dbClient.createUser(email, hashedPassword);

      // Return the new user's id and email with a status code of 201
      return res.status(201).json({ id: newUser.insertedId, email: newUser.ops[0].email });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = UsersController;
