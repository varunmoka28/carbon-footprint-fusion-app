import React from 'react';

// A comprehensive dictionary mapping 6-digit pincodes to SVG coordinates and names.
const locations: Record<string, { x: number; y: number; name: string }> = {
  // North
  '190001': { x: 370, y: 70, name: 'Srinagar' },
  '171001': { x: 405, y: 145, name: 'Shimla' },
  '160017': { x: 390, y: 185, name: 'Chandigarh' },
  '143001': { x: 350, y: 160, name: 'Amritsar' },
  '248001': { x: 430, y: 200, name: 'Dehradun' },
  '122001': { x: 395, y: 265, name: 'Gurugram' },
  '110001': { x: 400, y: 260, name: 'Delhi' },
  '226001': { x: 470, y: 340, name: 'Lucknow' },
  '282001': { x: 420, y: 320, name: 'Agra' },
  '201301': { x: 410, y: 270, name: 'Noida' },

  // West
  '302001': { x: 360, y: 330, name: 'Jaipur' },
  '342001': { x: 300, y: 360, name: 'Jodhpur' },
  '313001': { x: 320, y: 410, name: 'Udaipur' },
  '312605': { x: 340, y: 420, name: 'Pratapgarh' },
  '380001': { x: 260, y: 490, name: 'Ahmedabad' },
  '395003': { x: 270, y: 550, name: 'Surat' },
  '400001': { x: 290, y: 630, name: 'Mumbai' },
  '411001': { x: 320, y: 650, name: 'Pune' },
  '440001': { x: 430, y: 560, name: 'Nagpur' },
  '403001': { x: 310, y: 730, name: 'Goa' },

  // East
  '800001': { x: 570, y: 360, name: 'Patna' },
  '834001': { x: 560, y: 450, name: 'Ranchi' },
  '751001': { x: 570, y: 560, name: 'Bhubaneswar' },
  '700001': { x: 650, y: 480, name: 'Kolkata' },
  '737101': { x: 650, y: 300, name: 'Sikkim' },
  '781001': { x: 700, y: 340, name: 'Guwahati' },

  // Central
  '462001': { x: 410, y: 480, name: 'Bhopal' },
  '452001': { x: 360, y: 500, name: 'Indore' },
  '492001': { x: 500, y: 540, name: 'Raipur' },

  // South
  '500001': { x: 420, y: 690, name: 'Hyderabad' },
  '530001': { x: 520, y: 680, name: 'Visakhapatnam' },
  '586101': { x: 360, y: 710, name: 'Bijapur' },
  '560001': { x: 410, y: 810, name: 'Bengaluru' },
  '575001': { x: 350, y: 810, name: 'Mangalore' },
  '600001': { x: 460, y: 820, name: 'Chennai' },
  '641001': { x: 400, y: 870, name: 'Coimbatore' },
  '625001': { x: 420, y: 910, name: 'Madurai' },
  '682001': { x: 380, y: 910, name: 'Kochi' },
  '695001': { x: 390, y: 950, name: 'Thiruvananthapuram' },
};

/**
 * Finds coordinates by extracting a 6-digit pincode from a location string.
 * @param place The string containing location information and a pincode.
 * @returns An object with pincode, name, and coordinates, or null if not found.
 */
const findCoords = (place: string): { key: string; name: string; coords: { x: number; y: number } } | null => {
  if (!place) return null;
  const pincodeMatch = place.match(/\b(\d{6})\b/);
  if (pincodeMatch) {
    const pincode = pincodeMatch[1];
    const locationData = locations[pincode];
    if (locationData) {
      return { key: pincode, ...locationData };
    }
  }
  return null;
};

interface IndiaMapProps {
  origin?: string;
  destination?: string;
}

const IndiaMap = ({ origin = '', destination = '' }: IndiaMapProps) => {
  const originInfo = findCoords(origin);
  const destInfo = findCoords(destination);

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
  const indiaPath = "M731.4,475.9c-0.1-0.1-0.2-0.1-0.3-0.2l-12.3-11.3c-1.4-1.3-3.3-2-5.2-2s-3.8,0.7-5.2,2l-11.4,10.5c-0.2,0.2-0.4,0.3-0.6,0.5l-2.6,2.4c-1.3,1.2-3.1,1.9-4.9,1.9s-3.6-0.7-4.9-1.9l-11.4-10.5c-1.4-1.3-3.3-2-5.2-2s-3.8,0.7-5.2,2l-12.3,11.3c-0.1,0.1-0.2,0.2-0.2,0.2l-16.7,15.4c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-16.7-15.4c-1.4-1.3-3.3-2-5.2-2s-3.8,0.7-5.2,2l-16.7,15.4c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-11.4-10.5c-1.3-1.2-3.1-1.9-4.9-1.9s-3.6,0.7-4.9,1.9l-2.6-2.4c-0.2-0.2-0.4-0.3-0.6-0.5l-11.4-10.5c-1.4-1.3-3.3-2-5.2-2s-3.8,0.7-5.2,2l-12.3,11.3c-0.1,0.1-0.2,0.1-0.3,0.2c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-12.3-11.3c-0.1-0.1-0.2-0.2-0.2-0.2l-11.4-10.5c-1.3-1.2-3.1-1.9-4.9-1.9s-3.6,0.7-4.9,1.9l-11.4,10.5c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-16.7-15.4c-1.4-1.3-3.3-2-5.2-2s-3.8,0.7-5.2,2l-16.7,15.4c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2,2L360,503.9l-26.6,24.5c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-11.4-10.5c-1.3-1.2-3.1-1.9-4.9-1.9s-3.6,0.7-4.9,1.9l-11.4,10.5c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-11.4-10.5c-1.3-1.2-3.1-1.9-4.9-1.9s-3.6,0.7-4.9,1.9l-12.3,11.3c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2L194,480.1c-1.4-1.3-3.3-2-5.2-2s-3.8,0.7-5.2,2l-21.7,20c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-16.7-15.4v-46.1c0-2-0.8-3.9-2.2-5.3l-21.9-22.6c-1.5-1.5-3.5-2.3-5.6-2.3H2.2c-1.2,0-2.2,1-2.2,2.2v29.3c0,1.2,1,2.2,2.2,2.2h93.1c1.7,0,3.3,0.7,4.5,1.9l26.4,27.2c1.2,1.3,1.9,3,1.9,4.8v41.3c0,2-0.8,3.9-2.2,5.3l-11.4,11.8c-1.5,1.5-3.5,2.3-5.6,2.3H2.2c-1.2,0-2.2,1-2.2,2.2v29.3c0,1.2,1,2.2,2.2,2.2h101.9c2,0,4-0.8,5.5-2.3l16.1-16.6c1.5-1.5,3.5-2.3,5.6-2.3h22.8c1.7,0,3.3,0.7,4.5,1.9l26.4,27.2L186.1,600c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-16.7-15.4c-1.4-1.3-3.3-2-5.2-2s-3.8,0.7-5.2,2l-21.7,20c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-11.4-10.5c-1.3-1.2-3.1-1.9-4.9-1.9s-3.6,0.7-4.9,1.9L22.9,640.8c-1.4,1.3-2.2,3.1-2.2,4.9v218c0,4.2,3.4,7.6,7.6,7.6h738.9c4.2,0,7.6-3.4,7.6-7.6V503.9c0-1.9-0.7-3.6-2-4.9L731.4,475.9z M450.5,83.8L426,134.3c-2,4.1-6,6.9-10.6,6.9h-42.9c-4.5,0-8.6-2.8-10.6-6.9L337.5,83.8c-2-4.1-6-6.9-10.6-6.9h-42.9c-4.5,0-8.6-2.8-10.6-6.9L249,25.4c-2-4.1-6-6.9-10.6-6.9h-42.9c-4.5,0-8.6-2.8-10.6-6.9L160.4,0H789.7L461.1,76.9c-4.5,0-8.6,2.8-10.6,6.9z";

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
        {originInfo && destInfo && (
          <line
            className="route-line"
            x1={originInfo.coords.x}
            y1={originInfo.coords.y}
            x2={destInfo.coords.x}
            y2={destInfo.coords.y}
            stroke="#10B981" 
            strokeWidth="3"
            markerEnd="url(#arrowhead)"
          />
        )}
        
        {/* Origin Point and Label */}
        {originInfo && (
          <g>
            <circle cx={originInfo.coords.x} cy={originInfo.coords.y} r="8" fill="rgba(59, 130, 246, 0.4)" />
            <circle cx={originInfo.coords.x} cy={originInfo.coords.y} r="4" fill="#3B82F6" />
            <text x={originInfo.coords.x + 12} y={originInfo.coords.y + 5} className="location-label" fill="#3B82F6">
              {originInfo.name}
            </text>
          </g>
        )}

        {/* Destination Point and Label */}
        {destInfo && (
          <g>
            <circle cx={destInfo.coords.x} cy={destInfo.coords.y} r="8" fill="rgba(239, 68, 68, 0.4)" />
            <circle cx={destInfo.coords.x} cy={destInfo.coords.y} r="4" fill="#EF4444" />
            <text x={destInfo.coords.x + 12} y={destInfo.coords.y + 5} className="location-label" fill="#EF4444">
              {destInfo.name}
            </text>
          </g>
        )}

        {!originInfo && !destInfo && origin && destination && (
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
