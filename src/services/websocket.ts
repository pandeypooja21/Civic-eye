import { Issue } from '@/types';

type WebSocketEventType = 'issue-created' | 'issue-updated' | 'issue-deleted' | 'connection';

interface WebSocketEvent {
  type: WebSocketEventType;
  data: any;
  timestamp: number;
}

type EventCallback = (event: WebSocketEvent) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private eventListeners: Map<WebSocketEventType, EventCallback[]> = new Map();
  private isConnecting: boolean = false;

  constructor() {
    this.eventListeners = new Map();
  }

  // Connect to the WebSocket server
  connect(): void {
    if (this.socket || this.isConnecting) return;

    this.isConnecting = true;
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

    // Check if we're in production (Vercel) or development
    const isProduction = import.meta.env.PROD;

    // Always use mock WebSocket in production (Vercel) since it doesn't support WebSockets well
    if (isProduction) {
      console.log('Running in production environment, using mock WebSocket');
      this.useMockWebSocket();
      return;
    }

    try {
      // Create a real WebSocket connection for development
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const wsEvent: WebSocketEvent = JSON.parse(event.data);
          this.handleEvent(wsEvent);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.socket = null;
        this.isConnecting = false;
        this.scheduleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.socket?.close();
        this.useMockWebSocket();
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.isConnecting = false;
      this.useMockWebSocket();
    }
  }

  // Use a mock WebSocket when real connection fails
  private useMockWebSocket(): void {
    console.log('Falling back to mock WebSocket connection');

    // Simulate successful connection
    setTimeout(() => {
      this.isConnecting = false;
      console.log('Mock WebSocket connected');

      // Send a welcome message
      const welcomeEvent: WebSocketEvent = {
        type: 'connection',
        data: { message: 'Connected to Mock WebSocket Server' },
        timestamp: Date.now()
      };

      this.handleEvent(welcomeEvent);

      // Set up periodic mock events
      this.setupMockEvents();
    }, 500);
  }

  // Set up periodic mock events for testing
  private setupMockEvents(): void {
    // Check for real issues in localStorage
    const checkForRealIssues = () => {
      try {
        // Try to get real issues from localStorage
        const storedIssues = localStorage.getItem('mockIssues');
        if (storedIssues) {
          const parsedIssues = JSON.parse(storedIssues);
          if (parsedIssues && parsedIssues.length > 0) {
            // Use the most recent issue for a mock event
            const latestIssue = parsedIssues[0];

            const mockEvent: WebSocketEvent = {
              type: 'issue-created',
              data: latestIssue,
              timestamp: Date.now()
            };

            this.handleEvent(mockEvent);
            console.log('Generated mock event from real localStorage issue');
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('Error checking localStorage for issues:', error);
        return false;
      }
    };

    // Try to use real issues first
    const hasRealIssues = checkForRealIssues();

    // If no real issues, generate random ones
    if (!hasRealIssues) {
      // Generate a mock event every 10 seconds
      setInterval(() => {
        const eventTypes: WebSocketEventType[] = ['issue-created', 'issue-updated'];
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

        const mockEvent: WebSocketEvent = {
          type: randomType,
          data: this.generateMockIssue(randomType === 'issue-updated' ? 'in-progress' : 'open'),
          timestamp: Date.now()
        };

        this.handleEvent(mockEvent);
        console.log(`Generated mock ${randomType} event for real-time updates`);
      }, 10000);

      // Also generate an immediate event to show real-time functionality
      setTimeout(() => {
        const mockEvent: WebSocketEvent = {
          type: 'issue-created',
          data: this.generateMockIssue('open'),
          timestamp: Date.now()
        };

        this.handleEvent(mockEvent);
        console.log('Generated immediate mock event for real-time updates');
      }, 2000);
    }

    // Check for new issues in localStorage every 5 seconds
    setInterval(() => {
      checkForRealIssues();
    }, 5000);
  }

  // Generate a mock issue for testing
  private generateMockIssue(status: 'open' | 'in-progress' | 'resolved'): Issue {
    const issueTypes = ['pothole', 'streetlight', 'graffiti', 'trash', 'sidewalk', 'water', 'traffic-signal', 'other'];
    const randomType = issueTypes[Math.floor(Math.random() * issueTypes.length)] as any;

    return {
      id: `mock-${Date.now()}`,
      type: randomType,
      description: `This is a mock ${randomType} issue for testing real-time updates.`,
      location: {
        lat: 20.5937 + (Math.random() * 0.1 - 0.05),
        lng: 78.9629 + (Math.random() * 0.1 - 0.05),
        address: 'Mock Location, Test City, India'
      },
      status: status,
      reportedBy: 'test@example.com',
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)),
      updatedAt: new Date()
    };
  }

  // Disconnect from the WebSocket server
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // Schedule a reconnection attempt
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  // Add an event listener
  addEventListener(type: WebSocketEventType, callback: EventCallback): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }

    this.eventListeners.get(type)?.push(callback);
  }

  // Remove an event listener
  removeEventListener(type: WebSocketEventType, callback: EventCallback): void {
    const listeners = this.eventListeners.get(type);

    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Handle incoming events
  private handleEvent(event: WebSocketEvent): void {
    // Call all registered listeners for this event type
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(callback => callback(event));

    // Also call listeners registered for all events
    const allListeners = this.eventListeners.get('connection') || [];
    allListeners.forEach(callback => callback(event));
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
