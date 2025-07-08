
import React, { useState } from 'react';
import { IssueStatus, IssueType } from '@/types';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
  onFilterChange: (filters: {
    status?: IssueStatus;
    type?: IssueType;
    timeframe?: 'day' | 'week' | 'month' | 'all';
  }) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange }) => {
  const [status, setStatus] = useState<IssueStatus | undefined>(undefined);
  const [type, setType] = useState<IssueType | undefined>(undefined);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'all'>('all');

  const handleFilterChange = (
    filterType: 'status' | 'type' | 'timeframe',
    value: IssueStatus | IssueType | 'day' | 'week' | 'month' | 'all' | undefined
  ) => {
    switch (filterType) {
      case 'status':
        setStatus(value as IssueStatus | undefined);
        break;
      case 'type':
        setType(value as IssueType | undefined);
        break;
      case 'timeframe':
        setTimeframe(value as 'day' | 'week' | 'month' | 'all');
        break;
    }

    onFilterChange({
      status: filterType === 'status' ? (value as IssueStatus | undefined) : status,
      type: filterType === 'type' ? (value as IssueType | undefined) : type,
      timeframe: filterType === 'timeframe' ? (value as 'day' | 'week' | 'month' | 'all') : timeframe,
    });
  };

  const clearFilters = () => {
    setStatus(undefined);
    setType(undefined);
    setTimeframe('all');
    onFilterChange({ status: undefined, type: undefined, timeframe: 'all' });
  };

  const issueTypes: IssueType[] = [
    'pothole',
    'streetlight',
    'graffiti',
    'trash',
    'sidewalk',
    'water',
    'traffic-signal',
    'other',
  ];

  const statuses: IssueStatus[] = ['open', 'in-progress', 'resolved'];
  const timeframes = [
    { value: 'day', label: 'Last 24 hours' },
    { value: 'week', label: 'Last week' },
    { value: 'month', label: 'Last month' },
    { value: 'all', label: 'All time' },
  ];

  const anyFilterActive = status !== undefined || type !== undefined || timeframe !== 'all';

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter size={18} className="text-gray-500 mr-2" />
          <h3 className="text-lg font-medium">Filters</h3>
        </div>
        {anyFilterActive && (
          <button
            onClick={clearFilters}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <X size={14} className="mr-1" />
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            value={status || ''}
            onChange={(e) =>
              handleFilterChange(
                'status',
                e.target.value ? (e.target.value as IssueStatus) : undefined
              )
            }
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === 'open' ? 'Open' : s === 'in-progress' ? 'In Progress' : 'Resolved'}
              </option>
            ))}
          </select>
        </div>

        {/* Issue Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            value={type || ''}
            onChange={(e) =>
              handleFilterChange(
                'type',
                e.target.value ? (e.target.value as IssueType) : undefined
              )
            }
          >
            <option value="">All Types</option>
            {issueTypes.map((t) => (
              <option key={t} value={t}>
                {t.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Timeframe Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            value={timeframe}
            onChange={(e) =>
              handleFilterChange(
                'timeframe',
                e.target.value as 'day' | 'week' | 'month' | 'all'
              )
            }
          >
            {timeframes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
