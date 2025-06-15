
import React from 'react';

// A dictionary mapping location names to approximate SVG coordinates.
// NOTE: These are approximations for visualization purposes only.
const locations: Record<string, { x: number; y: number }> = {
  // North
  'DELHI': { x: 280, y: 200 },
  'GURUGRAM': { x: 275, y: 210 },
  'HARYANA': { x: 260, y: 180 },
  'PUNJAB': { x: 240, y: 150 },
  'RAJASTHAN': { x: 190, y: 280 },
  'UTTAR PRADESH': { x: 350, y: 270 },
  // West
  'GUJARAT': { x: 140, y: 380 },
  'MAHARASHTRA': { x: 230, y: 480 },
  'MUMBAI': { x: 180, y: 490 },
  // East
  'WEST BENGAL': { x: 500, y: 350 },
  'KOLKATA': { x: 520, y: 380 },
  'BIHAR': { x: 460, y: 290 },
  // South
  'KARNATAKA': { x: 260, y: 600 },
  'BENGALURU': { x: 300, y: 640 },
  'BANGALORE': { x: 300, y: 640 },
  'TAMIL NADU': { x: 310, y: 700 },
  'CHENNAI': { x: 360, y: 650 },
  'ANDHRA PRADESH': { x: 350, y: 580 },
  'TELANGANA': { x: 320, y: 530 },
  // Central
  'MADHYA PRADESH': { x: 320, y: 400 },
};

// Simple logic to find coordinates for a given location string.
const findCoords = (place: string) => {
  if (!place) return null;
  const upperPlace = place.toUpperCase();
  // Find a location key that is included in the place string.
  const foundKey = Object.keys(locations).find(key => upperPlace.includes(key));
  return foundKey ? locations[foundKey] : null;
};

interface IndiaMapProps {
  origin?: string;
  destination?: string;
}

const IndiaMap = ({ origin = '', destination = '' }: IndiaMapProps) => {
  const originCoords = findCoords(origin);
  const destCoords = findCoords(destination);

  // A simplified, but complete, SVG path for India's outline.
  const indiaPath = "M282.4,74.5c-2.4,1.2-4.8,2.8-6.9,4.9l-51.9,51.9c-2.1,2.1-3.7,4.5-4.9,7.3l-20.7,47.4c-1.2,2.8-1.9,5.9-1.9,9.1v23.5l-23.5,23.5c-3.7,3.7-6.5,8.1-8.2,13.1l-24.6,71.5c-1.7,5-2.6,10.4-2.6,15.9v108.3c0,11.2,3.9,21.8,10.8,30.2l56.5,69.5c8.4,10.3,20.5,16.5,33.9,16.5h111.4c13.4,0,25.5-6.2,33.9-16.5l56.5-69.5c6.9-8.4,10.8-19,10.8-30.2V323.3c0-5.5-0.9-10.9-2.6-15.9l-24.6-71.5c-1.7-5-4.5-9.4-8.2-13.1l-23.5-23.5V176c0-3.2-0.7-6.3-1.9-9.1l-20.7-47.4c-1.2-2.8-2.8-5.2-4.9-7.3l-51.9-51.9C287.2,77.3,284.8,75.7,282.4,74.5z";

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg p-2">
      <svg viewBox="0 0 600 750" className="w-full h-full">
        <path
          d={indiaPath}
          fill="#E5E7EB"
          stroke="#6B7280"
          strokeWidth="1"
        />
        
        {/* Route Line */}
        {originCoords && destCoords && (
          <line
            x1={originCoords.x}
            y1={originCoords.y}
            x2={destCoords.x}
            y2={destCoords.y}
            stroke="#10B981"
            strokeWidth="3"
            strokeDasharray="5 5"
            markerEnd="url(#arrowhead)"
          />
        )}
        
        {/* Origin Point */}
        {originCoords && (
          <g>
            <circle cx={originCoords.x} cy={originCoords.y} r="8" fill="rgba(59, 130, 246, 0.3)" />
            <circle cx={originCoords.x} cy={originCoords.y} r="4" fill="#3B82F6" />
          </g>
        )}

        {/* Destination Point */}
        {destCoords && (
          <g>
            <circle cx={destCoords.x} cy={destCoords.y} r="8" fill="rgba(239, 68, 68, 0.3)" />
            <circle cx={destCoords.x} cy={destCoords.y} r="4" fill="#EF4444" />
          </g>
        )}
        
        {/* Arrowhead definition for the line */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="0"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
          </marker>
        </defs>
      </svg>
    </div>
  );
};

export default IndiaMap;
