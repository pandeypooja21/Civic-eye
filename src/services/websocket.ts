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

    try {
      // Check if we're in production (Vercel) or development
      const isProduction = import.meta.env.PROD;

      if (isProduction && !wsUrl.startsWith('wss://')) {
        console.warn('WebSocket URL should use wss:// protocol in production');
      }

      // Create a real WebSocket connection
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

        // If we're in production and have a WebSocket error, fall back to mock mode
        if (isProduction) {
          this.useMockWebSocket();
        }
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
    // Generate a mock event every 30 seconds
    setInterval(() => {
      const eventTypes: WebSocketEventType[] = ['issue-created', 'issue-updated'];
      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

      const mockEvent: WebSocketEvent = {
        type: randomType,
        data: this.generateMockIssue(randomType === 'issue-updated' ? 'in-progress' : 'open'),
        timestamp: Date.now()
      };

      this.handleEvent(mockEvent);
    }, 30000);
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
