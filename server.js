// This file is a simple entry point for Vercel deployment
// It just requires and runs the actual server from the server directory

// Import the server
const app = require('./server/index.js');

// Export the app for Vercel
module.exports = app;
