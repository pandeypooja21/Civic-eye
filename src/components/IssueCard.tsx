
import React from 'react';
import { Issue } from '@/types';
import StatusBadge from './StatusBadge';
import { MapPin, Clock, MessageSquare, User } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onClick }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case 'pothole':
        return '🕳️';
      case 'streetlight':
        return '💡';
      case 'graffiti':
        return '🖌️';
      case 'trash':
        return '🗑️';
      case 'sidewalk':
        return '🚶';
      case 'water':
        return '💧';
      case 'traffic-signal':
        return '🚦';
      default:
        return '⚠️';
    }
  };

  const capitalizeType = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label={issue.type}>{getIssueTypeIcon(issue.type)}</span>
            <h3 className="font-medium text-gray-900">{capitalizeType(issue.type)}</h3>
          </div>
          <StatusBadge status={issue.status} />
        </div>

        <p className="text-gray-700 line-clamp-2 mb-3">{issue.description}</p>

        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin size={14} className="mr-1" />
          <span className="truncate">{issue.location.address}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Clock size={14} className="mr-1" />
            <span>Reported {formatDate(issue.createdAt)}</span>
          </div>

          {issue.reportedBy && (
            <div className="flex items-center text-sm text-gray-500">
              <User size={14} className="mr-1" />
              <span className="truncate max-w-[120px]">{issue.reportedBy}</span>
            </div>
          )}
        </div>
      </div>

      {issue.imageUrl && (
        <div className="h-40 overflow-hidden">
          <img
            src={issue.imageUrl}
            alt={`Image for ${issue.type} issue`}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
    </div>
  );
};

export default IssueCard;
