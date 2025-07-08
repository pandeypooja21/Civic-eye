import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { LayoutGrid, MapPin, AlertTriangle, CheckCircle, ArrowLeftRight, Loader2, User } from 'lucide-react';

const PublicFeed: React.FC = () => {
  const { issues, getFilteredIssues, loading, error } = useIssues();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    status?: IssueStatus;
    type?: IssueType;
    timeframe: 'day' | 'week' | 'month' | 'all'
  }>({
    timeframe: 'all'
  });
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch issues based on filters
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        await getFilteredIssues(filters);
      } catch (error) {
        console.error('Error fetching issues:', error);
        toast.error('Failed to load issues');
      }
    };

    fetchIssues();
  }, [filters, getFilteredIssues]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsDialogOpen(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if there are clusters of issues (for demo purposes)
  const checkForClusters = () => {
    if (!issues || issues.length < 3) return false;
    
    // For demo, just return true if there are more than 3 open issues
    const openIssues = issues.filter(issue => issue.status === 'open');
    return openIssues.length >= 3;
  };

  const hasAlerts = checkForClusters();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-civic-purple"></div>
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
                <MapPin className="text-civic-purple mr-2" size={24} />
                <h1 className="text-2xl font-bold text-gray-900">Public Feed</h1>
              </div>
              <div className="ml-6 flex space-x-2">
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
                    view === 'list'
                      ? 'bg-civic-purple text-white'
                      : 'text-gray-600 hover:text-civic-purple'
                  }`}
                >
                  <LayoutGrid size={16} className="mr-1.5" />
                  List
                </button>
                <button
                  onClick={() => setView('map')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
                    view === 'map'
                      ? 'bg-civic-purple text-white'
                      : 'text-gray-600 hover:text-civic-purple'
                  }`}
                >
                  <MapPin size={16} className="mr-1.5" />
                  Map
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-civic-purple px-3 py-2 rounded-md text-sm font-medium">
                Report Issue
              </Link>
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          showStatusFilter={true}
          showAdminControls={false}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {view === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {issues.length > 0 ? (
              issues.map(issue => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onClick={() => handleIssueClick(issue)}
                  showControls={false}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No issues found</h3>
                <p className="mt-1 text-gray-500">
                  Try adjusting your filters or check back later.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden h-[70vh]">
            <Map
              issues={issues}
              onIssueClick={handleIssueClick}
              showControls={false}
            />
          </div>
        )}
      </main>

      {/* Issue Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedIssue && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center">
                  Issue Details
                  <StatusBadge status={selectedIssue.status} className="ml-2" />
                </DialogTitle>
                <DialogDescription>
                  Reported on {formatDate(selectedIssue.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Issue Type</h4>
                      <p className="text-gray-900 capitalize">{selectedIssue.type.replace('-', ' ')}</p>
                    </div>

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

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Status Timeline</h4>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center text-sm">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <AlertTriangle size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Reported</p>
                            <p className="text-gray-500">{formatDate(selectedIssue.createdAt)}</p>
                          </div>
                        </div>

                        {selectedIssue.status !== 'open' && (
                          <div className="flex items-center text-sm">
                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                              <ArrowLeftRight size={16} className="text-yellow-600" />
                            </div>
                            <div>
                              <p className="font-medium">In Progress</p>
                              <p className="text-gray-500">{formatDate(selectedIssue.updatedAt)}</p>
                            </div>
                          </div>
                        )}

                        {selectedIssue.status === 'resolved' && (
                          <div className="flex items-center text-sm">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                              <CheckCircle size={16} className="text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Resolved</p>
                              <p className="text-gray-500">{formatDate(selectedIssue.updatedAt)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-gray-100 rounded-lg overflow-hidden h-64 mb-4">
                    <Map
                      issues={[selectedIssue]}
                      center={selectedIssue.location}
                      zoom={15}
                      showControls={false}
                    />
                  </div>

                  {selectedIssue.imageUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Image</h4>
                      <img
                        src={selectedIssue.imageUrl}
                        alt={`Issue: ${selectedIssue.type}`}
                        className="rounded-lg w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicFeed;
