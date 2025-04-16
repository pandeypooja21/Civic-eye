const WebSocket = require('ws');
const { createConsumer } = require('./fluvio');
const dotenv = require('dotenv');

dotenv.config();

let wss = null;
let fluvioConsumer = null;
let pollingInterval = null;
let mockInterval = null;

/**
 * Initialize WebSocket server
 * @param {Object} server - HTTP server instance
 * @returns {Object} - WebSocket server instance
 */
function initWebSocketServer(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    // Store client info for better tracking
    ws.isAlive = true;
    ws.clientId = Date.now();

    // Handle ping/pong to detect disconnected clients
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        console.log(`Received message from client ${ws.clientId}:`, parsedMessage);

        // Handle different message types if needed
        if (parsedMessage.type === 'subscribe') {
          ws.subscriptions = parsedMessage.topics || [];
          console.log(`Client ${ws.clientId} subscribed to:`, ws.subscriptions);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      console.log(`Client ${ws.clientId} disconnected from WebSocket`);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${ws.clientId}:`, error);
    });

    // Send a welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to Civic Eye WebSocket server',
      timestamp: Date.now(),
      clientId: ws.clientId
    }));
  });

  console.log('WebSocket server initialized');

  // Set up ping interval to detect disconnected clients
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        console.log(`Terminating inactive client ${ws.clientId}`);
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping(() => {});
    });
  }, 30000); // Check every 30 seconds

  // Clean up on server close
  wss.on('close', () => {
    clearInterval(pingInterval);
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    if (mockInterval) {
      clearInterval(mockInterval);
    }
    // Close the Fluvio consumer if it exists
    if (fluvioConsumer && typeof fluvioConsumer.close === 'function') {
      fluvioConsumer.close();
    }
  });

  // Start listening to Fluvio events
  startFluvioConsumer();

  // Also set up a mock event generator for testing
  // This will only generate events if no real events are coming in
  setupMockEventGenerator();

  return wss;
}

/**
 * Start consuming Fluvio events and broadcast to WebSocket clients
 */
async function startFluvioConsumer() {
  try {
    // Create a consumer with a unique group name
    const consumerGroup = `websocket-server-${Date.now()}`;
    fluvioConsumer = await createConsumer(consumerGroup);

    // Start from the latest offset
    await fluvioConsumer.seekToEnd();

    // Poll for new events
    pollFluvioEvents();

    console.log(`Fluvio consumer started with group: ${consumerGroup}`);
  } catch (error) {
    console.error('Failed to start Fluvio consumer:', error);
  }
}

/**
 * Poll for new events from Fluvio
 */
async function pollFluvioEvents() {
  if (!fluvioConsumer || !wss) {
    pollingInterval = setTimeout(pollFluvioEvents, 1000);
    return;
  }

  try {
    // Poll for new records with a timeout
    const records = await fluvioConsumer.fetch({ timeout: 1000 });

    let eventCount = 0;
    for (const record of records) {
      try {
        const event = JSON.parse(record.value.toString());

        // Broadcast to all connected clients
        broadcastToClients(event);
        eventCount++;
      } catch (parseError) {
        console.error('Error parsing Fluvio record:', parseError);
      }
    }

    if (eventCount > 0) {
      console.log(`Broadcasted ${eventCount} events to ${wss.clients.size} clients`);
    }
  } catch (error) {
    console.error('Error fetching from Fluvio:', error);
  }

  // Continue polling
  pollingInterval = setTimeout(pollFluvioEvents, 1000);
}

/**
 * Set up a mock event generator for testing
 */
function setupMockEventGenerator() {
  console.log('Setting up mock event generator');

  // Track the last time we sent a real event
  let lastRealEventTime = Date.now();

  // Generate a mock event every 15 seconds, but only if no real events have been sent recently
  mockInterval = setInterval(() => {
    // Only send mock events if there are clients and no real events in the last 15 seconds
    const now = Date.now();
    if (!wss || wss.clients.size === 0 || (now - lastRealEventTime) < 15000) return;

    const mockEvents = [
      { type: 'issue-created', data: generateMockIssue('open') },
      { type: 'issue-updated', data: generateMockIssue('in-progress') },
      { type: 'issue-updated', data: generateMockIssue('resolved') }
    ];

    const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
    randomEvent.timestamp = now;

    broadcastToClients(randomEvent);
    console.log(`Broadcasted mock ${randomEvent.type} event to ${wss.clients.size} clients`);
  }, 15000); // Every 15 seconds

  // Listen for real events to update the lastRealEventTime
  global.updateLastRealEventTime = () => {
    lastRealEventTime = Date.now();
  };
}

/**
 * Generate a mock issue for testing
 * @param {string} status - Status of the mock issue
 * @returns {Object} - Mock issue object
 */
function generateMockIssue(status = 'open') {
  const issueTypes = ['pothole', 'streetlight', 'graffiti', 'trash', 'sidewalk', 'water', 'traffic-signal', 'other'];
  const randomType = issueTypes[Math.floor(Math.random() * issueTypes.length)];

  return {
    _id: `mock-${Date.now()}`,
    type: randomType,
    description: `This is a mock ${randomType} issue for testing real-time updates.`,
    location: {
      lat: 20.5937 + (Math.random() * 0.1 - 0.05),
      lng: 78.9629 + (Math.random() * 0.1 - 0.05),
      address: 'Mock Location, Test City, India'
    },
    status: status,
    reportedBy: 'test@example.com',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Broadcast an event to all connected WebSocket clients
 * @param {Object} event - Event to broadcast
 */
function broadcastToClients(event) {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // Check if client has subscriptions and if the event matches
      if (!client.subscriptions ||
          client.subscriptions.length === 0 ||
          client.subscriptions.includes(event.type)) {
        client.send(JSON.stringify(event));
      }
    }
  });
}

module.exports = {
  initWebSocketServer
};
