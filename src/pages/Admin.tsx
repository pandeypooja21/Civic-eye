
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Issue, IssueStatus, IssueType } from '@/types';
import { useIssues } from '@/context/IssueContext';
import { useAuth } from '@/context/AuthContext';
import IssueCard from '@/components/IssueCard';
import FilterBar from '@/components/FilterBar';
import Map from '@/components/Map';
import StatusBadge from '@/components/StatusBadge';
import UserProfile from '@/components/auth/UserProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { LayoutGrid, MapPin, AlertTriangle, CheckCircle, ArrowLeftRight, Loader2, Shield, User } from 'lucide-react';

const Admin: React.FC = () => {
  const { issues, getFilteredIssues, updateIssueStatus, loading, error } = useIssues();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    status?: IssueStatus;
    type?: IssueType;
    timeframe: 'day' | 'week' | 'month' | 'all'
  }>({
    status: undefined,
    type: undefined,
    timeframe: 'all'
  });
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  // Fetch filtered issues when filters change
  useEffect(() => {
    const fetchFilteredIssues = async () => {
      setIsFiltering(true);
      try {
        const filtered = await getFilteredIssues(filters);
        setFilteredIssues(filtered);
      } catch (err) {
        console.error('Error fetching filtered issues:', err);
      } finally {
        setIsFiltering(false);
      }
    };

    fetchFilteredIssues();
  }, [filters, getFilteredIssues]);

  const handleFilterChange = (newFilters: {
    status?: IssueStatus;
    type?: IssueType;
    timeframe?: 'day' | 'week' | 'month' | 'all'
  }) => {
    setFilters({
      ...filters,
      ...newFilters,
      // Ensure timeframe is never undefined
      timeframe: newFilters.timeframe || filters.timeframe
    });
  };

  const handleStatusChange = async (id: string, newStatus: IssueStatus) => {
    try {
      await updateIssueStatus(id, newStatus);
      toast.success(`Issue status updated to ${newStatus}`);
      setSelectedIssue(null);
    } catch (err) {
      console.error('Error updating issue status:', err);
      toast.error('Failed to update issue status');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if we have any clusters (5+ issues in similar area within short time)
  const checkForClusters = () => {
    // In a real app, this would use geospatial calculations
    // For this demo, we'll simulate by checking if there are 5+ open issues
    const openIssues = issues.filter(issue => issue.status === 'open');
    return openIssues.length >= 5;
  };

  const hasAlerts = checkForClusters();

  console.log('Admin check:', { user, isAdmin });

  // If not logged in, redirect to admin login
  if (!user) {
    useEffect(() => {
      navigate('/admin/auth');
    }, [navigate]);

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-civic-purple"></div>
      </div>
    );
  }

  // If user is not an admin, show admin-only message
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Shield className="text-civic-purple h-16 w-16 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          You need administrator privileges to access this dashboard. Please contact your system administrator if you believe you should have access.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-civic-purple text-white rounded-md hover:bg-opacity-90 transition-colors"
          >
            Go to Home
          </button>
          <button
            onClick={() => navigate('/admin/auth')}
            className="px-4 py-2 border border-civic-purple text-civic-purple rounded-md hover:bg-gray-100 transition-colors"
          >
            Admin Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex items-center">
                <Shield className="text-civic-purple mr-2" size={24} />
                <h1 className="text-2xl font-bold text-gray-900">CivicWatch Admin</h1>
              </div>
              <div className="ml-6 flex space-x-2">
                <button
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    viewMode === 'list'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setViewMode('list')}
                >
                  <LayoutGrid size={16} className="inline mr-1" /> List View
                </button>
                <button
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    viewMode === 'map'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setViewMode('map')}
                >
                  <MapPin size={16} className="inline mr-1" /> Map View
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {hasAlerts && (
              <div className="bg-red-100 border-l-4 border-red-500 p-2 flex items-center">
                <AlertTriangle className="text-red-500 mr-2" size={20} />
                <div>
                  <p className="text-sm text-red-700 font-medium">Alert: Multiple reports in the same area</p>
                  <p className="text-xs text-red-600">5+ issues reported in a similar location</p>
                </div>
              </div>
            )}
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <FilterBar onFilterChange={handleFilterChange} />

        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            {loading || isFiltering ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin mr-2" size={18} />
                Loading issues...
              </span>
            ) : (
              <span>
                {filteredIssues.length} {filteredIssues.length === 1 ? 'Issue' : 'Issues'} Found
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="animate-spin h-12 w-12 mb-4 text-civic-purple" />
            <p>Loading issues...</p>
          </div>
        ) : error ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-red-500">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <p>{error}</p>
          </div>
        ) : viewMode === 'map' ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '70vh' }}>
            <Map
              issues={filteredIssues}
              onSelectIssue={setSelectedIssue}
              zoom={11}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isFiltering ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="animate-spin h-12 w-12 mb-4 text-civic-purple" />
                <p>Filtering issues...</p>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500">
                <svg className="h-12 w-12 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No issues found matching your filters</p>
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onClick={() => setSelectedIssue(issue)}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* Issue Detail Dialog */}
      <Dialog open={!!selectedIssue} onOpenChange={(open) => !open && setSelectedIssue(null)}>
        {selectedIssue && (
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl" role="img" aria-label={selectedIssue.type}>
                  {selectedIssue.type === 'pothole' ? '🕳️' :
                   selectedIssue.type === 'streetlight' ? '💡' :
                   selectedIssue.type === 'graffiti' ? '🖌️' :
                   selectedIssue.type === 'trash' ? '🗑️' :
                   selectedIssue.type === 'sidewalk' ? '🚶' :
                   selectedIssue.type === 'water' ? '💧' :
                   selectedIssue.type === 'traffic-signal' ? '🚦' : '⚠️'}
                </span>
                {selectedIssue.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Issue
              </DialogTitle>
              <DialogDescription>
                Reported {formatDate(selectedIssue.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2">
              <Tabs defaultValue="details">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="details">Issue Details</TabsTrigger>
                  <TabsTrigger value="status">Status Management</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                    <p className="text-gray-900">{selectedIssue.description}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                    <p className="text-gray-900 flex items-center">
                      <MapPin size={16} className="mr-1 text-gray-400" />
                      {selectedIssue.location.address}
                    </p>
                  </div>

                  {selectedIssue.reportedBy && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Reported By</h4>
                      <p className="text-gray-900 flex items-center">
                        <User size={16} className="mr-1 text-gray-400" />
                        {selectedIssue.reportedBy}
                      </p>
                    </div>
                  )}

                  {selectedIssue.imageUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Photo</h4>
                      <img
                        src={selectedIssue.imageUrl}
                        alt={`Image for ${selectedIssue.type} issue`}
                        className="w-full h-auto rounded-md max-h-60 object-cover"
                      />
                    </div>
                  )}

                  <div className="h-40 rounded-md overflow-hidden bg-gray-100">
                    <Map
                      issues={[selectedIssue]}
                      center={[selectedIssue.location.lng, selectedIssue.location.lat]}
                      zoom={15}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="status" className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Current Status</h4>
                    <StatusBadge status={selectedIssue.status} className="mt-1" />
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Update Status</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        className={`flex items-center p-3 rounded-md border ${
                          selectedIssue.status === 'open'
                            ? 'border-gray-300 bg-gray-50'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        disabled={selectedIssue.status === 'open'}
                        onClick={() => handleStatusChange(selectedIssue.id, 'open')}
                      >
                        <AlertTriangle className="text-status-open mr-3" size={20} />
                        <div className="text-left">
                          <p className="font-medium">Mark as Open</p>
                          <p className="text-sm text-gray-500">Issue has been identified but not addressed</p>
                        </div>
                      </button>

                      <button
                        className={`flex items-center p-3 rounded-md border ${
                          selectedIssue.status === 'in-progress'
                            ? 'border-gray-300 bg-gray-50'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        disabled={selectedIssue.status === 'in-progress'}
                        onClick={() => handleStatusChange(selectedIssue.id, 'in-progress')}
                      >
                        <ArrowLeftRight className="text-status-inProgress mr-3" size={20} />
                        <div className="text-left">
                          <p className="font-medium">Mark as In Progress</p>
                          <p className="text-sm text-gray-500">Maintenance team is working on this issue</p>
                        </div>
                      </button>

                      <button
                        className={`flex items-center p-3 rounded-md border ${
                          selectedIssue.status === 'resolved'
                            ? 'border-gray-300 bg-gray-50'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        disabled={selectedIssue.status === 'resolved'}
                        onClick={() => handleStatusChange(selectedIssue.id, 'resolved')}
                      >
                        <CheckCircle className="text-status-resolved mr-3" size={20} />
                        <div className="text-left">
                          <p className="font-medium">Mark as Resolved</p>
                          <p className="text-sm text-gray-500">Issue has been fixed or addressed</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Admin;
