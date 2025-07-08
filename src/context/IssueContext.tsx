import React, { createContext, useContext, useState, useEffect } from 'react';
import { Issue, IssueStatus, IssueType } from '@/types';
import { getAllIssues, getFilteredIssues as apiGetFilteredIssues, createIssue, updateIssue } from '@/services/api';
import websocketService from '@/services/websocket';
import { toast } from '@/components/ui/sonner';

interface IssueContextType {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Issue>;
  updateIssueStatus: (id: string, status: IssueStatus) => Promise<Issue>;
  getFilteredIssues: (filters: { status?: IssueStatus; type?: IssueType; timeframe?: 'day' | 'week' | 'month' | 'all' }) => Promise<Issue[]>;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

// Empty fallback for when API fails and no localStorage data exists
const generateEmptyIssues = (): Issue[] => {
  return [];
};

export const IssueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cachedFilteredIssues, setCachedFilteredIssues] = useState<{
    filters: { status?: IssueStatus; type?: IssueType; timeframe?: 'day' | 'week' | 'month' | 'all' };
    issues: Issue[];
  } | null>(null);

  // Fetch issues on component mount
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const data = await getAllIssues();
        setIssues(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch issues:', err);
        setError('Failed to load issues. Using empty data instead.');
        setIssues(generateEmptyIssues());
        toast.error('Failed to load issues. Using empty data instead.');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Handle issue created event
    const handleIssueCreated = (event) => {
      if (event.type === 'issue-created') {
        setIssues((prevIssues) => {
          // Check if this issue already exists
          const exists = prevIssues.some(issue => issue.id === event.data.id);
          if (exists) {
            return prevIssues;
          }
          return [event.data, ...prevIssues];
        });
        toast.success('New issue reported!');
      }
    };

    // Handle issue updated event
    const handleIssueUpdated = (event) => {
      if (event.type === 'issue-updated') {
        setIssues((prevIssues) =>
          prevIssues.map((issue) =>
            issue.id === event.data.id ? event.data : issue
          )
        );
        toast.info(`Issue ${event.data.id} updated`);
      }
    };

    // Listen for storage events from other tabs
    const handleStorageEvent = (event) => {
      if (event.key === 'lastIssueCreated') {
        try {
          const data = JSON.parse(event.newValue || '');
          if (data && data.issue) {
            setIssues((prevIssues) => {
              // Check if this issue already exists
              const exists = prevIssues.some(issue => issue.id === data.issue.id);
              if (exists) {
                return prevIssues;
              }
              return [data.issue, ...prevIssues];
            });
            toast.success('New issue reported from another tab!');
          }
        } catch (error) {
          console.error('Error handling storage event:', error);
        }
      }
    };

    // Check sessionStorage for any issues created in other tabs
    try {
      const lastIssueCreated = sessionStorage.getItem('lastIssueCreated');
      if (lastIssueCreated) {
        const data = JSON.parse(lastIssueCreated);
        if (data && data.issue && data.timestamp > Date.now() - 30000) { // Only consider issues from the last 30 seconds
          setIssues((prevIssues) => {
            // Check if this issue already exists
            const exists = prevIssues.some(issue => issue.id === data.issue.id);
            if (exists) {
              return prevIssues;
            }
            return [data.issue, ...prevIssues];
          });
          console.log('Found issue created in another tab');
        }
      }
    } catch (error) {
      console.error('Error checking sessionStorage:', error);
    }

    // Handle issue deleted event
    const handleIssueDeleted = (event) => {
      if (event.type === 'issue-deleted') {
        setIssues((prevIssues) =>
          prevIssues.filter((issue) => issue.id !== event.data.id)
        );
        toast.info(`Issue ${event.data.id} deleted`);
      }
    };

    // Register event listeners
    websocketService.addEventListener('issue-created', handleIssueCreated);
    websocketService.addEventListener('issue-updated', handleIssueUpdated);
    websocketService.addEventListener('issue-deleted', handleIssueDeleted);

    // Add storage event listener for cross-tab communication
    window.addEventListener('storage', handleStorageEvent);

    // Cleanup on unmount
    return () => {
      websocketService.removeEventListener('issue-created', handleIssueCreated);
      websocketService.removeEventListener('issue-updated', handleIssueUpdated);
      websocketService.removeEventListener('issue-deleted', handleIssueDeleted);
      window.removeEventListener('storage', handleStorageEvent);
      websocketService.disconnect();
    };
  }, []);

  const addIssue = async (newIssue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    try {
      const createdIssue = await createIssue(newIssue);
      setIssues((prevIssues) => [createdIssue, ...prevIssues]);
      return createdIssue;
    } catch (err) {
      console.error('Failed to create issue:', err);
      toast.error('Failed to create issue. Please try again.');
      throw err;
    }
  };

  const updateIssueStatus = async (id: string, status: IssueStatus) => {
    try {
      const updatedIssue = await updateIssue(id, { status });
      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue.id === id ? updatedIssue : issue
        )
      );
      return updatedIssue;
    } catch (err) {
      console.error('Failed to update issue status:', err);
      toast.error('Failed to update issue status. Please try again.');
      throw err;
    }
  };

  const getFilteredIssues = async (filters: { status?: IssueStatus; type?: IssueType; timeframe?: 'day' | 'week' | 'month' | 'all' }) => {
    // If we have a cached result for these exact filters, use it
    if (cachedFilteredIssues &&
        cachedFilteredIssues.filters.status === filters.status &&
        cachedFilteredIssues.filters.type === filters.type &&
        cachedFilteredIssues.filters.timeframe === filters.timeframe) {
      return cachedFilteredIssues.issues;
    }

    try {
      // If we're not filtering, just return all issues
      if (!filters.status && !filters.type && (!filters.timeframe || filters.timeframe === 'all')) {
        return issues;
      }

      // Otherwise, fetch filtered issues from API
      const filteredIssues = await apiGetFilteredIssues(filters);

      // Cache the result
      setCachedFilteredIssues({
        filters,
        issues: filteredIssues
      });

      return filteredIssues;
    } catch (err) {
      console.error('Failed to get filtered issues:', err);
      toast.error('Failed to filter issues. Showing all issues instead.');

      // Fallback to client-side filtering
      let filteredIssues = [...issues];

      if (filters.status) {
        filteredIssues = filteredIssues.filter((issue) => issue.status === filters.status);
      }

      if (filters.type) {
        filteredIssues = filteredIssues.filter((issue) => issue.type === filters.type);
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

        filteredIssues = filteredIssues.filter((issue) => issue.createdAt >= cutoffDate);
      }

      return filteredIssues;
    }
  };

  return (
    <IssueContext.Provider value={{
      issues,
      addIssue,
      updateIssueStatus,
      getFilteredIssues,
      loading,
      error
    }}>
      {children}
    </IssueContext.Provider>
  );
};

export const useIssues = () => {
  const context = useContext(IssueContext);
  if (context === undefined) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
};
