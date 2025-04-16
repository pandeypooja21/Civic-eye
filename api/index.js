// This is a serverless function for Vercel
// It will handle all API requests

// Import the Express app from the server directory
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

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
export default app;
