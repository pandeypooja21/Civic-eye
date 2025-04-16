
import React, { useState, useEffect } from 'react';
import { Issue, IssueStatus } from '@/types';
import { MapPin } from 'lucide-react';
import MapboxMap from './MapboxMap';

interface MapProps {
  issues?: Issue[];
  onSelectIssue?: (issue: Issue) => void;
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  selectLocation?: boolean;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
}

const Map: React.FC<MapProps> = ({
  issues = [],
  onSelectIssue,
  center = [77.2090, 28.6139], // Delhi, India by default
  zoom = 12,
  interactive = true,
  selectLocation = false,
  onLocationSelect,
}) => {
  const [useMapbox, setUseMapbox] = useState<boolean>(false);

  // Check if Mapbox API key is available
  useEffect(() => {
    const mapboxApiKey = import.meta.env.VITE_MAPBOX_API_KEY;
    setUseMapbox(!!mapboxApiKey && mapboxApiKey !== 'your_mapbox_api_key_here');
  }, []);

  // If Mapbox API key is available, use MapboxMap component
  if (useMapbox) {
    return (
      <MapboxMap
        issues={issues}
        onSelectIssue={onSelectIssue}
        center={center}
        zoom={zoom}
        interactive={interactive}
        selectLocation={selectLocation}
        onLocationSelect={onLocationSelect}
      />
    );
  }

  // Fallback to placeholder map if no Mapbox API key

  const getIssueMarkerColor = (status: IssueStatus) => {
    switch (status) {
      case 'open':
        return '#F97316';
      case 'in-progress':
        return '#F59E0B';
      case 'resolved':
        return '#10B981';
      default:
        return '#9b87f5';
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectLocation || !onLocationSelect) return;

    // Generate random coordinates near the center for demonstration
    const randomLat = center[1] + (Math.random() - 0.5) * 0.05;
    const randomLng = center[0] + (Math.random() - 0.5) * 0.05;
    const address = `Selected location at ${randomLat.toFixed(5)}, ${randomLng.toFixed(5)}`;

    onLocationSelect(randomLat, randomLng, address);
  };

  return (
    <div
      className="w-full h-full rounded-lg overflow-hidden shadow-md relative bg-blue-50"
      onClick={handleMapClick}
    >
      {/* Simplified map visualization */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 p-4 text-center">
        <div className="bg-civic-purple text-white p-2 rounded-full mb-4">
          <MapPin size={24} />
        </div>
        <p className="text-lg font-semibold mb-2">Map Visualization</p>
        <p className="text-sm text-gray-600 mb-4">
          {selectLocation
            ? "Click anywhere to select a location"
            : issues.length > 0
              ? `Showing ${issues.length} issues on the map`
              : "Interactive map would display here"}
        </p>

        {issues.length > 0 && (
          <div className="w-full max-w-xs">
            <h3 className="text-sm font-medium mb-2">Issue Legend:</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['open', 'in-progress', 'resolved'].map((status) => (
                <div key={status} className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-1"
                    style={{ backgroundColor: getIssueMarkerColor(status as IssueStatus) }}
                  />
                  <span className="text-xs capitalize">{status}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {issues.slice(0, 4).map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center bg-white p-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectIssue) onSelectIssue(issue);
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: getIssueMarkerColor(issue.status) }}
                  />
                  <span className="text-xs truncate">{issue.type}</span>
                </div>
              ))}
            </div>

            {issues.length > 4 && (
              <p className="text-xs text-gray-500 mt-2">
                + {issues.length - 4} more issues...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
