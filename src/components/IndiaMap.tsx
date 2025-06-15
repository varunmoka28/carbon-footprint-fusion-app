
import React from 'react';

/**
 * Projects geographical coordinates (longitude, latitude) onto SVG coordinates.
 * @param lon Longitude
 * @param lat Latitude
 * @returns An object with {x, y} coordinates for the SVG viewBox.
 */
const projectCoords = (lon: number, lat: number) => {
  // Bounding box for India in degrees
  const minLon = 68;
  const maxLon = 98;
  const minLat = 8;
  const maxLat = 37;

  // SVG viewBox dimensions
  const svgX = 100;
  const svgY = 0;
  const svgWidth = 700;
  const svgHeight = 900;

  // Map longitude to x and latitude to y
  const x = svgX + ((lon - minLon) / (maxLon - minLon)) * svgWidth;
  // Invert y-axis because SVG y-coordinates increase downwards
  const y = svgY + ((maxLat - lat) / (maxLat - minLat)) * svgHeight;

  return { x, y };
};


/**
 * Finds coordinates by extracting a 6-digit pincode from a location string.
 * @param place The string containing location information and a pincode.
 * @param locations The pincode database (a dictionary).
 * @returns An object with pincode, name, and geo-coordinates, or null if not found.
 */
const findCoords = (
  place: string,
  locations: Record<string, { name: string; x: number; y: number }> | null
): { key: string; name: string; coords: { lon: number; lat: number } } | null => {
  if (!place || !locations) return null;
  const pincodeMatch = place.match(/\b(\d{6})\b/);
  if (pincodeMatch) {
    const pincode = pincodeMatch[1];
    const locationData = locations[pincode];
    if (locationData && !isNaN(locationData.x) && !isNaN(locationData.y)) {
      return {
        key: pincode,
        name: locationData.name,
        coords: { lon: locationData.x, lat: locationData.y },
      };
    }
  }
  return null;
};

interface IndiaMapProps {
  origin?: string;
  destination?: string;
  pincodeDb: Record<string, { name: string; x: number; y: number }> | null;
}

const IndiaMap = ({ origin = '', destination = '', pincodeDb }: IndiaMapProps) => {
  if (!pincodeDb) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg p-2">
        <div className="text-center text-muted-foreground flex flex-col items-center">
          <svg className="animate-spin h-5 w-5 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading map data...
        </div>
      </div>
    );
  }

  const originInfo = findCoords(origin, pincodeDb);
  const destInfo = findCoords(destination, pincodeDb);

  const projectedOrigin = originInfo ? projectCoords(originInfo.coords.lon, originInfo.coords.lat) : null;
  const projectedDest = destInfo ? projectCoords(destInfo.coords.lon, destInfo.coords.lat) : null;

  const unmappedPincodes: string[] = [];
  const originPincode = origin.match(/\b(\d{6})\b/)?.[1];
  const destPincode = destination.match(/\b(\d{6})\b/)?.[1];

  if (origin && originPincode && !originInfo) {
    unmappedPincodes.push(originPincode);
  }
  if (destination && destPincode && !destInfo) {
    unmappedPincodes.push(destPincode);
  }

  // A more detailed, high-quality SVG path for India's outline.
  const indiaPath = "M731.4,475.9c-0.1-0.1-0.2-0.1-0.3-0.2l-12.3-11.3c-1.4-1.3-3.3-2-5.2-2s-3.8,0.7-5.2,2l-11.4,10.5c-0.2,0.2-0.4,0.3-0.6,0.5l-2.6,2.4c-1.3,1.2-3.1,1.9-4.9,1.9s-3.6,0.7-4.9,1.9l-11.4-10.5c-1.3-1.2-3.1-1.9-4.9-1.9s-3.6,0.7-4.9,1.9l-12.3,11.3c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2L360,503.9l-26.6,24.5c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-11.4-10.5c-1.3-1.2-3.1-1.9-4.9-1.9s-3.6,0.7-4.9,1.9l-11.4,10.5c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-11.4-10.5c-1.3-1.2-3.1-1.9-4.9-1.9s-3.6,0.7-4.9,1.9l-12.3,11.3c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2L194,480.1c-1.4-1.3-3.3-2-5.2-2s-3.8,0.7-5.2,2l-21.7,20c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-16.7-15.4v-46.1c0-2-0.8-3.9-2.2-5.3l-21.9-22.6c-1.5-1.5-3.5-2.3-5.6-2.3H2.2c-1.2,0-2.2,1-2.2,2.2v29.3c0,1.2,1,2.2,2.2,2.2h93.1c1.7,0,3.3,0.7,4.5,1.9l26.4,27.2c1.2,1.3,1.9,3,1.9,4.8v41.3c0,2-0.8,3.9-2.2,5.3l-11.4,11.8c-1.5,1.5-3.5,2.3-5.6,2.3H2.2c-1.2,0-2.2,1-2.2,2.2v29.3c0,1.2,1,2.2,2.2,2.2h101.9c2,0,4-0.8,5.5-2.3l16.1-16.6c1.5-1.5,3.5-2.3,5.6-2.3h22.8c1.7,0,3.3,0.7,4.5,1.9l26.4,27.2L186.1,600c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-16.7-15.4c-1.4-1.3-3.3-2-5.2-2s-3.8-0.7-5.2,2l-21.7,20c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-11.4-10.5c-1.3-1.2-3.1-1.9-4.9-1.9s-3.6,0.7-4.9,1.9L22.9,640.8c-1.4,1.3-2.2,3.1-2.2,4.9v218c0,4.2,3.4,7.6,7.6,7.6h738.9c4.2,0,7.6-3.4,7.6-7.6V503.9c0-1.9-0.7-3.6-2-4.9L731.4,475.9z M450.5,83.8L426,134.3c-2,4.1-6,6.9-10.6,6.9h-42.9c-4.5,0-8.6-2.8-10.6-6.9L337.5,83.8c-2-4.1-6-6.9-10.6-6.9h-42.9c-4.5,0-8.6-2.8-10.6-6.9L249,25.4c-2-4.1-6-6.9-10.6-6.9h-42.9c-4.5,0-8.6-2.8-10.6-6.9L160.4,0H789.7L461.1,76.9c-4.5,0-8.6,2.8-10.6,6.9z";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg p-2">
      <svg viewBox="100 0 700 900" className="w-full h-full flex-1">
        <style>
          {`
            .route-line {
              stroke-dasharray: 1000;
              stroke-dashoffset: 1000;
              animation: draw-line 2s ease-out forwards;
            }
            @keyframes draw-line {
              to {
                stroke-dashoffset: 0;
              }
            }
            .location-label {
              font-family: 'Poppins', sans-serif;
              font-size: 14px;
              paint-order: stroke;
              stroke: white;
              stroke-width: 3px;
              stroke-linecap: butt;
              stroke-linejoin: miter;
              font-weight: 600;
            }
          `}
        </style>
        <path
          d={indiaPath}
          fill="#E5E7EB"
          stroke="#9CA3AF"
          strokeWidth="0.5"
        />

        {/* Route Line */}
        {projectedOrigin && projectedDest && (
          <line
            className="route-line"
            x1={projectedOrigin.x}
            y1={projectedOrigin.y}
            x2={projectedDest.x}
            y2={projectedDest.y}
            stroke="#10B981" 
            strokeWidth="3"
            markerEnd="url(#arrowhead)"
          />
        )}
        
        {/* Origin Point and Label */}
        {originInfo && projectedOrigin && (
          <g>
            <circle cx={projectedOrigin.x} cy={projectedOrigin.y} r="8" fill="rgba(59, 130, 246, 0.4)" />
            <circle cx={projectedOrigin.x} cy={projectedOrigin.y} r="4" fill="#3B82F6" />
            <text x={projectedOrigin.x + 12} y={projectedOrigin.y + 5} className="location-label" fill="#3B82F6">
              {originInfo.name}
            </text>
          </g>
        )}

        {/* Destination Point and Label */}
        {destInfo && projectedDest && (
          <g>
            <circle cx={projectedDest.x} cy={projectedDest.y} r="8" fill="rgba(239, 68, 68, 0.4)" />
            <circle cx={projectedDest.x} cy={projectedDest.y} r="4" fill="#EF4444" />
            <text x={projectedDest.x + 12} y={projectedDest.y + 5} className="location-label" fill="#EF4444">
              {destInfo.name}
            </text>
          </g>
        )}

        {!projectedOrigin && !projectedDest && origin && destination && (
          <text x="50%" y="50%" textAnchor="middle" fill="#6B7280" fontSize="16px" fontFamily="Poppins, sans-serif">
            Route data unavailable.
          </text>
        )}
        
        {/* Arrowhead definition for the line */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
          </marker>
        </defs>
      </svg>
      {unmappedPincodes.length > 0 && (
        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-2 mt-2 w-full text-left">
          <p className="font-semibold">Note:</p>
          <ul className="list-disc list-inside pl-2">
            {unmappedPincodes.map((pincode, index) => (
              <li key={index}>The location with pincode "{pincode}" could not be mapped.</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default IndiaMap;
