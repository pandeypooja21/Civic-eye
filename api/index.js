// This is a serverless function for Vercel
// It will handle all API requests

// Import required modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/api', (req, res) => {
  res.json({
    message: 'Civic Eye API is running',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Export the Express API
module.exports = app;
