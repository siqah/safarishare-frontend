import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface RideMapProps {
  from: string;
  to: string;
  waypoints?: string[];
  className?: string;
}

const RideMap: React.FC<RideMapProps> = ({ from, to, waypoints = [], className = '' }) => {
  const handleOpenInMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(to)}&origin=${encodeURIComponent(from)}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          Route Overview
        </h3>
        <button
          onClick={handleOpenInMaps}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Open in Maps
        </button>
      </div>

      <div className="space-y-4">
        {/* Starting Point */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
          <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
          <div>
            <p className="text-sm text-gray-500">From</p>
            <p className="font-medium text-gray-800">{from}</p>
          </div>
        </div>

        {/* Waypoints */}
        {waypoints.map((waypoint, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm ml-6">
            <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
            <div>
              <p className="text-sm text-gray-500">Stop {index + 1}</p>
              <p className="font-medium text-gray-800">{waypoint}</p>
            </div>
          </div>
        ))}

        {/* Route Line Visual */}
        <div className="flex justify-center">
          <div className="w-0.5 h-8 bg-gradient-to-b from-green-500 via-blue-400 to-red-500 rounded-full"></div>
        </div>

        {/* Destination */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
          <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
          <div>
            <p className="text-sm text-gray-500">To</p>
            <p className="font-medium text-gray-800">{to}</p>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="mt-4 h-32 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Interactive map view</p>
          <p className="text-xs text-gray-400">Click "Open in Maps" for navigation</p>
        </div>
      </div>
    </div>
  );
};

export default RideMap;