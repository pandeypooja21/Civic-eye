const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const issueRoutes = require('./routes/issues');
const { setupFluvio } = require('./fluvio');
const { initWebSocketServer } = require('./websocket');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.warn('Using in-memory mock data instead');
    return false;
  }
};

// Attempt to connect to MongoDB
connectToMongoDB();

// Routes
app.use('/api/issues', issueRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = initWebSocketServer(server);

// Initialize Fluvio if configured
if (process.env.FLUVIO_ENABLED === 'true') {
  setupFluvio().then(() => {
    console.log('Fluvio initialized successfully');
  }).catch(error => {
    console.error('Failed to initialize Fluvio:', error);
  });
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express API for Vercel
module.exports = app;
