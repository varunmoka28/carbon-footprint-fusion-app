
import React from 'react';

// A comprehensive dictionary mapping location names to SVG coordinates.
const locations: Record<string, { x: number; y: number }> = {
  // North
  'JAMMU AND KASHMIR': { x: 380, y: 50 },
  'SRINAGAR': { x: 370, y: 70 },
  'LEH': { x: 420, y: 60 },
  'HIMACHAL PRADESH': { x: 400, y: 130 },
  'SHIMLA': { x: 405, y: 145 },
  'PUNJAB': { x: 360, y: 180 },
  'CHANDIGARH': { x: 390, y: 185 },
  'AMRITSAR': { x: 350, y: 160 },
  'UTTARAKHAND': { x: 440, y: 190 },
  'DEHRADUN': { x: 430, y: 200 },
  'HARYANA': { x: 380, y: 230 },
  'GURUGRAM': { x: 395, y: 265 },
  'GURGAON': { x: 395, y: 265 },
  'DELHI': { x: 400, y: 260 },
  'UTTAR PRADESH': { x: 480, y: 320 },
  'LUCKNOW': { x: 470, y: 340 },
  'AGRA': { x: 420, y: 320 },
  'NOIDA': { x: 410, y: 270 },

  // West
  'RAJASTHAN': { x: 280, y: 330 },
  'JAIPUR': { x: 360, y: 330 },
  'JODHPUR': { x: 300, y: 360 },
  'UDAIPUR': { x: 320, y: 410 },
  'GUJARAT': { x: 220, y: 480 },
  'AHMEDABAD': { x: 260, y: 490 },
  'SURAT': { x: 270, y: 550 },
  'MAHARASHTRA': { x: 340, y: 600 },
  'MUMBAI': { x: 290, y: 630 },
  'PUNE': { x: 320, y: 650 },
  'NAGPUR': { x: 430, y: 560 },
  'GOA': { x: 310, y: 730 },

  // East
  'BIHAR': { x: 580, y: 350 },
  'PATNA': { x: 570, y: 360 },
  'JHARKHAND': { x: 570, y: 440 },
  'RANCHI': { x: 560, y: 450 },
  'ODISHA': { x: 550, y: 550 },
  'BHUBANESWAR': { x: 570, y: 560 },
  'WEST BENGAL': { x: 630, y: 450 },
  'KOLKATA': { x: 650, y: 480 },
  'SIKKIM': { x: 650, y: 300 },
  'ARUNACHAL PRADESH': { x: 750, y: 250 },
  'NAGALAND': { x: 760, y: 340 },
  'MANIPUR': { x: 750, y: 380 },
  'MIZORAM': { x: 730, y: 430 },
  'TRIPURA': { x: 700, y: 420 },
  'MEGHALAYA': { x: 690, y: 350 },
  'ASSAM': { x: 720, y: 330 },
  'GUWAHATI': { x: 700, y: 340 },
  
  // Central
  'MADHYA PRADESH': { x: 430, y: 450 },
  'BHOPAL': { x: 410, y: 480 },
  'INDORE': { x: 360, y: 500 },
  'CHHATTISGARH': { x: 510, y: 520 },
  'RAIPUR': { x: 500, y: 540 },

  // South
  'TELANGANA': { x: 430, y: 670 },
  'HYDERABAD': { x: 420, y: 690 },
  'ANDHRA PRADESH': { x: 450, y: 750 },
  'VISAKHAPATNAM': { x: 520, y: 680 },
  'KARNATAKA': { x: 380, y: 780 },
  'BENGALURU': { x: 410, y: 810 },
  'BANGALORE': { x: 410, y: 810 },
  'MANGALORE': { x: 350, y: 810 },
  'TAMIL NADU': { x: 420, y: 880 },
  'CHENNAI': { x: 460, y: 820 },
  'COIMBATORE': { x: 400, y: 870 },
  'MADURAI': { x: 420, y: 910 },
  'KERALA': { x: 380, y: 900 },
  'KOCHI': { x: 380, y: 910 },
  'THIRUVANANTHAPURAM': { x: 390, y: 950 },
};

// Sort keys by length descending to match more specific names first (e.g., "UTTAR PRADESH" before "PRADESH")
const sortedLocationKeys = Object.keys(locations).sort((a, b) => b.length - a.length);

const findCoords = (place: string): { key: string; coords: { x: number; y: number } } | null => {
  if (!place) return null;
  const upperPlace = place.toUpperCase();
  const foundKey = sortedLocationKeys.find(key => upperPlace.includes(key));
  return foundKey ? { key: foundKey, coords: locations[foundKey] } : null;
};

interface IndiaMapProps {
  origin?: string;
  destination?: string;
}

const IndiaMap = ({ origin = '', destination = '' }: IndiaMapProps) => {
  const originInfo = findCoords(origin);
  const destInfo = findCoords(destination);

  // A more detailed, high-quality SVG path for India's outline.
  const indiaPath = "M731.4,475.9c-0.1-0.1-0.2-0.1-0.3-0.2l-12.3-11.3c-1.4-1.3-3.3-2-5.2-2s-3.8,0.7-5.2,2l-11.4,10.5c-0.2,0.2-0.4,0.3-0.6,0.5l-2.6,2.4c-1.3,1.2-3.1,1.9-4.9,1.9s-3.6-0.7-4.9-1.9l-11.4-10.5c-1.4-1.3-3.3-2-5.2-2s-3.8,0.7-5.2,2l-12.3,11.3c-0.1,0.1-0.2,0.2-0.2,0.2l-16.7,15.4c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-16.7-15.4c-1.4-1.3-3.3-2-5.2-2s-3.8,0.7-5.2,2l-16.7,15.4c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-11.4-10.5c-1.3-1.2-3.1-1.9-4.9-1.9s-3.6,0.7-4.9,1.9l-2.6-2.4c-0.2-0.2-0.4-0.3-0.6-0.5l-11.4-10.5c-1.4-1.3-3.3-2-5.2-2s-3.8,0.7-5.2,2l-12.3,11.3c-0.1,0.1-0.2,0.1-0.3,0.2c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-12.3-11.3c-0.1-0.1-0.2-0.2-0.2-0.2l-11.4-10.5c-1.3-1.2-3.1-1.9-4.9-1.9s-3.6,0.7-4.9,1.9l-11.4,10.5c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-16.7-15.4c-1.4-1.3-3.3-2-5.2-2s-3.8,0.7-5.2,2l-16.7,15.4c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2,2L360,503.9l-26.6,24.5c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-11.4-10.5c-1.3-1.2-3.1-1.9-4.9-1.9s-3.6,0.7-4.9,1.9l-11.4,10.5c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-11.4-10.5c-1.3-1.2-3.1-1.9-4.9-1.9s-3.6,0.7-4.9,1.9l-12.3,11.3c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2L194,480.1c-1.4-1.3-3.3-2-5.2-2s-3.8,0.7-5.2,2l-21.7,20c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-16.7-15.4v-46.1c0-2-0.8-3.9-2.2-5.3l-21.9-22.6c-1.5-1.5-3.5-2.3-5.6-2.3H2.2c-1.2,0-2.2,1-2.2,2.2v29.3c0,1.2,1,2.2,2.2,2.2h93.1c1.7,0,3.3,0.7,4.5,1.9l26.4,27.2c1.2,1.3,1.9,3,1.9,4.8v41.3c0,2-0.8,3.9-2.2,5.3l-11.4,11.8c-1.5,1.5-3.5,2.3-5.6,2.3H2.2c-1.2,0-2.2,1-2.2,2.2v29.3c0,1.2,1,2.2,2.2,2.2h101.9c2,0,4-0.8,5.5-2.3l16.1-16.6c1.5-1.5,3.5-2.3,5.6-2.3h22.8c1.7,0,3.3,0.7,4.5,1.9l26.4,27.2L186.1,600c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-16.7-15.4c-1.4-1.3-3.3-2-5.2-2s-3.8,0.7-5.2,2l-21.7,20c-1.4,1.3-3.3,2-5.2,2s-3.8-0.7-5.2-2l-11.4-10.5c-1.3-1.2-3.1-1.9-4.9-1.9s-3.6,0.7-4.9,1.9L22.9,640.8c-1.4,1.3-2.2,3.1-2.2,4.9v218c0,4.2,3.4,7.6,7.6,7.6h738.9c4.2,0,7.6-3.4,7.6-7.6V503.9c0-1.9-0.7-3.6-2-4.9L731.4,475.9z M450.5,83.8L426,134.3c-2,4.1-6,6.9-10.6,6.9h-42.9c-4.5,0-8.6-2.8-10.6-6.9L337.5,83.8c-2-4.1-6-6.9-10.6-6.9h-42.9c-4.5,0-8.6-2.8-10.6-6.9L249,25.4c-2-4.1-6-6.9-10.6-6.9h-42.9c-4.5,0-8.6-2.8-10.6-6.9L160.4,0H789.7L461.1,76.9c-4.5,0-8.6,2.8-10.6,6.9z";

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg p-2">
      <svg viewBox="100 0 700 900" className="w-full h-full">
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
              {originInfo.key}
            </text>
          </g>
        )}

        {/* Destination Point and Label */}
        {destInfo && (
          <g>
            <circle cx={destInfo.coords.x} cy={destInfo.coords.y} r="8" fill="rgba(239, 68, 68, 0.4)" />
            <circle cx={destInfo.coords.x} cy={destInfo.coords.y} r="4" fill="#EF4444" />
            <text x={destInfo.coords.x + 12} y={destInfo.coords.y + 5} className="location-label" fill="#EF4444">
              {destInfo.key}
            </text>
          </g>
        )}

        {!(originInfo && destInfo) && (
            <text x="50%" y="50%" textAnchor="middle" fill="#6B7280" fontSize="16px" fontFamily="Poppins, sans-serif">
                { !originInfo && !destInfo ? "Route data unavailable." :
                  !originInfo ? "Origin not mapped." : "Destination not mapped." }
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
    </div>
  );
};

export default IndiaMap;
