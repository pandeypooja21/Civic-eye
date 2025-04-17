import { Issue, IssueStatus, IssueType } from '@/types';

// Mock data generator for demo purposes
const generateMockIssues = (): Issue[] => {
  const issueTypes: IssueType[] = ['pothole', 'streetlight', 'graffiti', 'trash', 'sidewalk', 'water', 'traffic-signal', 'other'];
  const statuses: IssueStatus[] = ['open', 'in-progress', 'resolved'];

  // Major Indian cities with their coordinates
  const indianCities = [
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 }
  ];

  // Create an array of just 5 random issues
  return Array.from({ length: 5 }, (_, i) => {
    // Randomly select a city
    const city = indianCities[Math.floor(Math.random() * indianCities.length)];

    // Generate coordinates near the selected city
    const lat = city.lat + (Math.random() - 0.5) * 0.05;
    const lng = city.lng + (Math.random() - 0.5) * 0.05;

    // Random dates within the last month
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const updatedAt = new Date(createdAt.getTime() + Math.random() * (now.getTime() - createdAt.getTime()));

    return {
      id: `issue-${i + 1}`,
      type: issueTypes[Math.floor(Math.random() * issueTypes.length)],
      description: `This is a ${issueTypes[Math.floor(Math.random() * issueTypes.length)]} issue in ${city.name} that needs attention.`,
      location: {
        lat,
        lng,
        address: `${Math.floor(Math.random() * 1000) + 100} Example St, ${city.name}, India`
      },
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt,
      updatedAt,
      imageUrl: i % 3 === 0 ? `https://picsum.photos/id/${i + 10}/200/200` : undefined,
      reportedBy: `citizen${i + 1}@example.com`,
    };
  });
};

// Store mock data in localStorage to persist between refreshes
let mockIssues: Issue[] = [];

// Initialize mock data only once
const initMockData = () => {
  try {
    // Try to get existing data from localStorage
    const storedIssues = localStorage.getItem('mockIssues');

    if (storedIssues) {
      // Parse stored issues and convert dates back to Date objects
      const parsedIssues = JSON.parse(storedIssues);
      mockIssues = parsedIssues.map((issue: any) => ({
        ...issue,
        createdAt: new Date(issue.createdAt),
        updatedAt: new Date(issue.updatedAt)
      }));
      console.log('Loaded mock issues from localStorage:', mockIssues.length);
    } else {
      // Generate new mock data only if none exists
      mockIssues = generateMockIssues();
      // Save to localStorage
      localStorage.setItem('mockIssues', JSON.stringify(mockIssues));
      console.log('Generated new mock issues:', mockIssues.length);
    }
  } catch (error) {
    console.error('Error initializing mock data:', error);
    // Fallback to generating new mock data
    mockIssues = generateMockIssues();
  }
};

// Initialize mock data
initMockData();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || 'An unknown error occurred');
  }
  return response.json();
};

// Get all issues
export const getAllIssues = async (): Promise<Issue[]> => {
  try {
    const response = await fetch(`${API_URL}/issues`);
    const data = await handleResponse(response);
    const formattedIssues = data.map(formatIssue);

    // Update mock issues with the real data
    if (formattedIssues.length > 0) {
      mockIssues = formattedIssues;
      try {
        localStorage.setItem('mockIssues', JSON.stringify(mockIssues));
        console.log('Updated mock issues with server data');
      } catch (storageError) {
        console.error('Error saving to localStorage:', storageError);
      }
    }

    return formattedIssues;
  } catch (error) {
    console.error('Error fetching issues, using mock data:', error);

    // Try to get issues from localStorage first
    try {
      const storedIssues = localStorage.getItem('mockIssues');
      if (storedIssues) {
        const parsedIssues = JSON.parse(storedIssues);
        if (parsedIssues && Array.isArray(parsedIssues) && parsedIssues.length > 0) {
          console.log('Using issues from localStorage');
          return parsedIssues;
        }
      }
    } catch (storageError) {
      console.error('Error reading from localStorage:', storageError);
    }

    return mockIssues;
  }
};

// Get filtered issues
export const getFilteredIssues = async (
  filters: { status?: IssueStatus; type?: IssueType; timeframe?: 'day' | 'week' | 'month' | 'all' }
): Promise<Issue[]> => {
  try {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.timeframe) params.append('timeframe', filters.timeframe);

    const response = await fetch(`${API_URL}/issues/filter?${params.toString()}`);
    const data = await handleResponse(response);
    return data.map(formatIssue);
  } catch (error) {
    console.error('Error filtering issues, using mock data:', error);

    // Filter mock issues client-side
    let filteredIssues = [...mockIssues];

    if (filters.status) {
      filteredIssues = filteredIssues.filter(issue => issue.status === filters.status);
    }

    if (filters.type) {
      filteredIssues = filteredIssues.filter(issue => issue.type === filters.type);
    }

    if (filters.timeframe && filters.timeframe !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      switch (filters.timeframe) {
        case 'day':
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }

      filteredIssues = filteredIssues.filter(issue => issue.createdAt >= cutoffDate);
    }

    return filteredIssues;
  }
};

// Get a specific issue
export const getIssue = async (id: string): Promise<Issue> => {
  try {
    const response = await fetch(`${API_URL}/issues/${id}`);
    const data = await handleResponse(response);
    return formatIssue(data);
  } catch (error) {
    console.error('Error fetching issue, using mock data:', error);

    // Find in mock issues
    const issue = mockIssues.find(issue => issue.id === id);

    if (!issue) {
      throw new Error(`Issue with ID ${id} not found`);
    }

    return issue;
  }
};

// Create a new issue
export const createIssue = async (
  issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<Issue> => {
  try {
    const response = await fetch(`${API_URL}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issue),
    });

    const data = await handleResponse(response);
    return formatIssue(data);
  } catch (error) {
    console.error('Error creating issue, using mock data:', error);

    // Create a new mock issue
    const now = new Date();
    const newIssue: Issue = {
      id: `issue-${mockIssues.length + 1}-${now.getTime()}`,
      ...issue,
      status: 'open',
      createdAt: now,
      updatedAt: now
    };

    // Add to mock issues
    mockIssues = [newIssue, ...mockIssues];

    // Save updated mock issues to localStorage
    try {
      localStorage.setItem('mockIssues', JSON.stringify(mockIssues));
      console.log('Saved new issue to localStorage');

      // Also save to sessionStorage for cross-tab communication
      sessionStorage.setItem('lastIssueCreated', JSON.stringify({
        issue: newIssue,
        timestamp: Date.now()
      }));

      // Dispatch a storage event to notify other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'lastIssueCreated',
        newValue: JSON.stringify({
          issue: newIssue,
          timestamp: Date.now()
        })
      }));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }

    return newIssue;
  }
};

// Update an issue
export const updateIssue = async (
  id: string,
  updates: Partial<Issue>
): Promise<Issue> => {
  try {
    const response = await fetch(`${API_URL}/issues/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const data = await handleResponse(response);
    return formatIssue(data);
  } catch (error) {
    console.error('Error updating issue, using mock data:', error);

    // Update the mock issue
    const issueIndex = mockIssues.findIndex(issue => issue.id === id);

    if (issueIndex === -1) {
      throw new Error(`Issue with ID ${id} not found`);
    }

    const updatedIssue = {
      ...mockIssues[issueIndex],
      ...updates,
      updatedAt: new Date()
    };

    mockIssues[issueIndex] = updatedIssue;

    // Save updated mock issues to localStorage
    try {
      localStorage.setItem('mockIssues', JSON.stringify(mockIssues));
      console.log('Saved updated issue to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }

    return updatedIssue;
  }
};

// Delete an issue
export const deleteIssue = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/issues/${id}`, {
      method: 'DELETE',
    });

    await handleResponse(response);
  } catch (error) {
    console.error('Error deleting issue, using mock data:', error);

    // Delete from mock issues
    mockIssues = mockIssues.filter(issue => issue.id !== id);

    // Save updated mock issues to localStorage
    try {
      localStorage.setItem('mockIssues', JSON.stringify(mockIssues));
      console.log('Saved deletion to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
};

// Helper function to format issue dates
const formatIssue = (issue: any): Issue => {
  return {
    ...issue,
    createdAt: new Date(issue.createdAt),
    updatedAt: new Date(issue.updatedAt),
  };
};
