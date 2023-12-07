// utils/db.js
const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    // Get environment variables or use default values
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    // MongoDB connection string
    const url = `mongodb://${host}:${port}/${database}`;

    // Create a MongoDB client
    this.client = new MongoClient(url, { useUnifiedTopology: true });

    // Connect to MongoDB
    this.client.connect((err) => {
      if (err) {
        console.error(`Error connecting to MongoDB: ${err}`);
      } else {
        console.log('Connected to MongoDB');
      }
    });
  }

  // Check if the connection to MongoDB is alive
  isAlive() {
    return this.client.isConnected();
  }

  // Get the number of documents in the 'users' collection
  async nbUsers() {
    const usersCollection = this.client.db().collection('users');
    return usersCollection.countDocuments();
  }

  // Get the number of documents in the 'files' collection
  async nbFiles() {
    const filesCollection = this.client.db().collection('files');
    return filesCollection.countDocuments();
  }

  // Get a user by email
  async getUserByEmail(email) {
    const usersCollection = this.client.db().collection('users');
    return usersCollection.findOne({ email });
  }

  // Create a new user
  async createUser(email, password) {
    const usersCollection = this.client.db().collection('users');
    return usersCollection.insertOne({ email, password });
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
