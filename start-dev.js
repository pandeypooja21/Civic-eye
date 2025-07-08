const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if server directory exists
if (!fs.existsSync(path.join(__dirname, 'server'))) {
  console.error('Server directory not found. Make sure you are in the project root.');
  process.exit(1);
}

// Start the backend server
const serverProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  shell: true,
  stdio: 'pipe',
});

// Start the frontend server
const clientProcess = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  shell: true,
  stdio: 'pipe',
});

// Handle server output
serverProcess.stdout.on('data', (data) => {
  console.log(`[SERVER] ${data.toString().trim()}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`[SERVER ERROR] ${data.toString().trim()}`);
});

// Handle client output
clientProcess.stdout.on('data', (data) => {
  console.log(`[CLIENT] ${data.toString().trim()}`);
});

clientProcess.stderr.on('data', (data) => {
  console.error(`[CLIENT ERROR] ${data.toString().trim()}`);
});

// Handle process exit
process.on('SIGINT', () => {
  console.log('Shutting down...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit(0);
});

// Handle child process exit
serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  clientProcess.kill();
  process.exit(code);
});

clientProcess.on('close', (code) => {
  console.log(`Client process exited with code ${code}`);
  serverProcess.kill();
  process.exit(code);
});

console.log('Development servers started!');
console.log('- Frontend: http://localhost:8080');
console.log('- Backend: http://localhost:5000');
console.log('Press Ctrl+C to stop both servers.');
