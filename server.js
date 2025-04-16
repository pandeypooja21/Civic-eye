// This file is a simple entry point for Vercel deployment
// It just imports and runs the actual server from the server directory

// Import the server
import('./server/index.js').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
