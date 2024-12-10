import crypto from 'crypto';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';
import { v4 as uuidv4 } from 'uuid';

class AuthController {
  // GET /connect
  static async getConnect(req, res) {
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).send({ error: 'Unauthorized' });
        }

        //console.log(req)

        // Decode the Basic auth header
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        console.log('Decoded credentials:', credentials);
        const [email, password] = credentials.split(':');

        if (!email || !password) {
            console.error('Invalid credentials format');
            return res.status(401).send({ error: 'Unauthorized' });
        }
        console.log('Email:', email.trim());
        console.log('Password:', password.trim());

        // Hash the password using SHA1
        const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
        console.log('Hashed Password:', hashedPassword);
    
        // Find the user in MongoDB

      
        const user = await dbClient.getDatabase().collection('users').findOne({ 
                email: email.trim(),
                password:hashedPassword
                });
        if (!user) {
            console.error('User not found with provided credentials');
            return res.status(401).send({ error: 'Unauthorized' });
        }
      
        // Generate token and store in Redis
        const token = uuidv4();
        const redisKey = `auth_${token}`;
        console.log('Generated token:', token);

        await redisClient.set(redisKey, user._id.toString(), 24 * 3600); // 24 hours
        console.log('Token stored in Redis with key:', redisKey);

        return res.status(200).json({ token });
    } catch(error){
        console.error("Error", error)
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    
      
  }

  // GET /disconnect
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const redisKey = `auth_${token}`;
    await redisClient.del(redisKey);

    return res.status(204).send();
  }
}

module.exports = AuthController;
