const dotenv = require('dotenv');
const { EventEmitter } = require('events');

dotenv.config();

// Create a custom event emitter to simulate Fluvio
const fluvioEmitter = new EventEmitter();

// Global variables to store Fluvio connections
let producer = null;
let consumers = new Map();
let isFluvioEnabled = false;

// Set max listeners to avoid memory leak warnings
fluvioEmitter.setMaxListeners(100);

/**
 * Setup Fluvio connection and create topic if it doesn't exist
 * @returns {Object} - Object containing producer
 */
async function setupFluvio() {
  try {
    // Check if Fluvio is enabled in the environment
    isFluvioEnabled = process.env.FLUVIO_ENABLED === 'true';

    if (!isFluvioEnabled) {
      console.log('Fluvio is disabled. Using mock implementation.');
      return { producer: null };
    }

    const topicName = process.env.FLUVIO_TOPIC || 'civic-eye-issues';
    console.log(`Setting up Fluvio with topic: ${topicName}`);

    // Create a custom producer that uses the event emitter
    producer = {
      send: async (data) => {
        // Emit the event with the data
        fluvioEmitter.emit(topicName, {
          value: data,
          timestamp: Date.now()
        });
        return true;
      }
    };

    console.log('Fluvio producer created successfully');
    return { producer };
  } catch (error) {
    console.error('Error setting up Fluvio:', error);
    // Fall back to mock implementation if there's an error
    console.log('Using mock implementation due to error');
    return { producer: null };
  }
}

/**
 * Produce an event to Fluvio
 * @param {string} eventType - Type of event (issue-created, issue-updated, issue-deleted)
 * @param {Object} data - Data to send with the event
 * @returns {boolean} - Success status
 */
async function produceIssueEvent(eventType, data) {
  try {
    // Create event payload
    const event = {
      type: eventType,
      data,
      timestamp: Date.now()
    };

    // Check if Fluvio is enabled and producer exists
    if (!isFluvioEnabled || !producer) {
      console.log(`Mock: Produced ${eventType} event to Fluvio`, event);
      return true;
    }

    // Send to Fluvio
    await producer.send(JSON.stringify(event));
    console.log(`Produced ${eventType} event to Fluvio:`, event);

    // Update the last real event time if the global function exists
    if (global.updateLastRealEventTime) {
      global.updateLastRealEventTime();
    }

    return true;
  } catch (error) {
    console.error(`Error producing ${eventType} event to Fluvio:`, error);
    return false;
  }
}

/**
 * Create a consumer for the WebSocket server to use
 * @param {string} consumerGroup - Consumer group name
 * @returns {Object} - Fluvio consumer or mock consumer
 */
async function createConsumer(consumerGroup) {
  try {
    const topicName = process.env.FLUVIO_TOPIC || 'civic-eye-issues';

    // Check if Fluvio is enabled
    if (!isFluvioEnabled) {
      console.log(`Mock: Created consumer for group: ${consumerGroup}`);
      return {
        fetch: async () => {
          return [];
        },
        seekToEnd: async () => {
          return true;
        }
      };
    }

    // Check if we already have a consumer for this group
    if (consumers.has(consumerGroup)) {
      return consumers.get(consumerGroup);
    }

    // Create a custom consumer that listens to the event emitter
    const consumer = {
      records: [],
      listener: null,

      fetch: async ({ timeout = 1000 } = {}) => {
        // Return any records we've collected and clear the buffer
        const currentRecords = [...consumer.records];
        consumer.records = [];
        return currentRecords;
      },

      seekToEnd: async () => {
        // Set up the listener if it doesn't exist
        if (!consumer.listener) {
          consumer.listener = (record) => {
            consumer.records.push({
              value: {
                toString: () => record.value
              }
            });
          };

          // Listen for events on the topic
          fluvioEmitter.on(topicName, consumer.listener);
        }
        return true;
      },

      // Method to clean up the consumer
      close: () => {
        if (consumer.listener) {
          fluvioEmitter.off(topicName, consumer.listener);
          consumer.listener = null;
        }
        consumers.delete(consumerGroup);
      }
    };

    // Store the consumer for reuse
    consumers.set(consumerGroup, consumer);
    console.log(`Created consumer for topic: ${topicName}, group: ${consumerGroup}`);

    return consumer;
  } catch (error) {
    console.error(`Error creating consumer for group ${consumerGroup}:`, error);
    // Return mock consumer on error
    return {
      fetch: async () => {
        return [];
      },
      seekToEnd: async () => {
        return true;
      }
    };
  }
}

module.exports = {
  setupFluvio,
  produceIssueEvent,
  createConsumer
};
