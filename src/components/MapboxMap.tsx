import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Issue, IssueStatus } from '@/types';
import { toast } from '@/components/ui/sonner';

// Set your Mapbox token here
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY || '';

interface MapboxMapProps {
  issues?: Issue[];
  onSelectIssue?: (issue: Issue) => void;
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  selectLocation?: boolean;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  issues = [],
  onSelectIssue,
  center = [77.2090, 28.6139], // Default to Delhi, India
  zoom = 12,
  interactive = true,
  selectLocation = false,
  onLocationSelect,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapboxgl.accessToken) {
      setError('Mapbox API key is missing. Please add it to your environment variables.');
      return;
    }

    if (map.current) return; // Initialize map only once

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: zoom,
        interactive: interactive,
      });

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      // Add navigation control
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add click handler for location selection
      if (selectLocation && onLocationSelect) {
        map.current.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          
          // Reverse geocode to get address (in a real app)
          // For now, we'll just use coordinates
          const address = `Selected location at ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          
          // Create a temporary marker
          new mapboxgl.Marker({ color: '#9b87f5' })
            .setLngLat([lng, lat])
            .addTo(map.current!);
          
          onLocationSelect(lat, lng, address);
        });
      }
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map. Please check your internet connection and try again.');
    }

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom, interactive, selectLocation, onLocationSelect]);

  // Update map center and zoom when props change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    map.current.setCenter(center);
    map.current.setZoom(zoom);
  }, [center, zoom, mapLoaded]);

  // Add markers for issues
  useEffect(() => {
    if (!map.current || !mapLoaded || issues.length === 0) return;

    // Clear existing markers
    const markers = document.getElementsByClassName('mapboxgl-marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Add markers for each issue
    issues.forEach((issue) => {
      const markerColor = getIssueMarkerColor(issue.status);
      
      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'issue-marker';
      markerEl.style.width = '24px';
      markerEl.style.height = '24px';
      markerEl.style.borderRadius = '50%';
      markerEl.style.backgroundColor = markerColor;
      markerEl.style.border = '2px solid white';
      markerEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      markerEl.style.cursor = 'pointer';
      
      // Create marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([issue.location.lng, issue.location.lat])
        .addTo(map.current);
      
      // Add popup with issue info
      if (onSelectIssue) {
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${getIssueTypeLabel(issue.type)}</div>
              <div style="font-size: 12px; color: #666;">${issue.location.address || 'No address'}</div>
            </div>
          `);
        
        marker.setPopup(popup);
        
        // Add click handler
        markerEl.addEventListener('click', () => {
          onSelectIssue(issue);
        });
      }
    });
  }, [issues, mapLoaded, onSelectIssue]);

  // Helper function to get marker color based on issue status
  const getIssueMarkerColor = (status: IssueStatus): string => {
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

  // Helper function to format issue type for display
  const getIssueTypeLabel = (type: string): string => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // If there's an error, show error message
  if (error) {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden shadow-md flex items-center justify-center bg-red-50 p-4 text-center">
        <div>
          <p className="text-red-500 font-medium mb-2">Map Error</p>
          <p className="text-sm text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  // If Mapbox token is missing, show placeholder
  if (!mapboxgl.accessToken) {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden shadow-md flex items-center justify-center bg-blue-50 p-4 text-center">
        <div>
          <p className="text-lg font-semibold mb-2">Map Visualization</p>
          <p className="text-sm text-gray-600 mb-4">
            Mapbox API key is required to display the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden shadow-md" />
  );
};

export default MapboxMap;
