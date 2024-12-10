import express from 'express';
import routes from './routes/index';
import cors from 'cors';


const app = express();
const PORT = process.env.PORT || 5000;

// Use CORS to allow cross-origin requests if needed
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());  // This line is critical for parsing JSON request bodies.


// Load routes
app.use('/', routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
