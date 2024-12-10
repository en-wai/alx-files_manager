// utils/db.js
import mongodb from 'mongodb';

/**
 * DBClient class is responsible for managing the MongoDB database connection
 * and providing methods to interact with the database collections.
 * It handles connection setup, querying, and ensures the database client is alive.
 */
class DBClient {
  /**
   * Initializes a new DBClient instance.
   * Establishes a connection to the MongoDB server using the provided or default environment variables.
   * 
   * @constructor
   * @param {string} [host='localhost'] - The hostname for the MongoDB server.
   * @param {number} [port=27017] - The port on which the MongoDB server is running.
   * @param {string} [database='files_manager'] - The name of the database to connect to.
   */
  constructor() {
    const host = process.env.DB_HOST || 'localhost';  // Default host is localhost if not provided
    const port = process.env.DB_PORT || 27017;  // Default port is 27017 if not provided
    const database = process.env.DB_DATABASE || 'files_manager';  // Default DB is 'files_manager'
    const dbURL = `mongodb://${host}:${port}/${database}`;
    
    // Create a new MongoClient instance with the connection string
    this.client = new mongodb.MongoClient(dbURL, { useUnifiedTopology: true });
    // Establish the connection to the MongoDB server
    this.client.connect();
    this.dbName = database; // Save the database name for later use
    
  }

  /**
   * Checks if the MongoDB client is currently connected.
   * 
   * This method can be used to ensure the database connection is still active.
   * 
   * @returns {boolean} Returns true if the client is connected to the database, false otherwise.
   */
  isAlive() {
    return this.client.isConnected();  // Returns true if the client is connected to the DB
  }

  /**
   * Retrieves the number of documents in the 'users' collection.
   * 
   * This method counts the number of documents present in the 'users' collection,
   * providing a way to assess the amount of user data stored in the database.
   * 
   * @async
   * @returns {Promise<number>} A promise that resolves to the number of documents in the 'users' collection.
   */
  async nbUsers() {
    // Get the 'users' collection from the current database
    const collection = this.client.db().collection('users');
    
    // Return the count of documents in the 'users' collection
    return collection.countDocuments();
  }

  /**
   * Retrieves the number of documents in the 'files' collection.
   * 
   * This method counts the number of documents in the 'files' collection, which
   * could represent the number of files being managed in the system.
   * 
   * @async
   * @returns {Promise<number>} A promise that resolves to the number of documents in the 'files' collection.
   */
  async nbFiles() {
    // Get the 'files' collection from the current database
    const collection = this.client.db().collection('files');
    
    // Return the count of documents in the 'files' collection
    return collection.countDocuments();
  }

  // Getter to expose the database instance
  getDatabase() {
    return this.client.db(this.dbName);
  }
}

// Create an instance of DBClient to manage database operations
const dbClient = new DBClient();

/**
 * The default export is an instance of DBClient, which provides methods to interact with the MongoDB database.
 * This instance is used throughout the application to manage database operations like counting documents.
 * 
 * @type {DBClient}
 */
export default dbClient;
