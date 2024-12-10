import crypto from 'crypto';
import dbClient from '../utils/db';  // Import the DB client
import { ObjectId } from 'mongodb';
import redisClient from '../utils/redis.js';

/**
 * Handles the logic for user-related routes.
 */
const postNew = async (req, res) => {
  const { email, password } = req.body;

  // Validate that email and password are provided
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  try {
    // Check if the email already exists in the 'users' collection
    const existingUser = await dbClient.client.db().collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password using  1
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

    // Create a new user object
    const newUser = { email, password: hashedPassword };

    // Insert the new user into the 'users' collection
    const result = await dbClient.client.db().collection('users').insertOne(newUser);

    // Return the newly created user with only the email and id
    res.status(201).json({
      id: result.insertedId,
      email: result.ops[0].email
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMe = async(req, res) => {
    const token = req.headers['x-token'];
    console.log("Received token:", token);
    const key = `auth_${token}`;

    const userId = await redisClient.get(key);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.getDatabase().collection('users').findOne({ 
      _id: ObjectId(userId) 
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({
      id: user._id,
      email: user.email
    });
}

export { postNew, getMe };
