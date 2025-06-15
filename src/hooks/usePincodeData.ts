import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export type LocationInfo = {
  pincode: string;
  name: string; // e.g., Taluk or Office Name
  district: string;
  state: string;
  x: number; // longitude
  y: number; // latitude
};


export const usePincodeData = () => {
  const [locationMap, setLocationMap] = useState<Map<string, LocationInfo>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Papa.parse('/pincode.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const map = new Map<string, LocationInfo>();
        // CSV Headers: pincode,taluk,district,state,x,y
        results.data.forEach((row: any) => {
          if (row.pincode && row.x != null && row.y != null && row.taluk && row.district && row.state) {
            const pincodeStr = String(row.pincode);
             // We only store the first location found for each pincode to keep it simple.
            if (!map.has(pincodeStr)) {
              map.set(pincodeStr, {
                pincode: pincodeStr,
                name: row.taluk,
                district: row.district,
                state: row.state,
                x: row.x,
                y: row.y,
              });
            }
          }
        });
        setLocationMap(map);
        setIsLoading(false);
      },
      error: (error) => {
        console.error("Error parsing pincode CSV:", error);
        setIsLoading(false);
      }
    });
  }, []);

  return { locationMap, isLoading };
};
