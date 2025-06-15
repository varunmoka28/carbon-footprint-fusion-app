
import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export type LocationInfo = {
  pincode: string;
  name: string; // e.g., Taluk or Office Name
  district: string;
  state: string;
  x: number; // longitude
  y: number; // latitude
  searchableString: string;
};


export const usePincodeData = () => {
  const [locationList, setLocationList] = useState<LocationInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Papa.parse('/pincode.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const list: LocationInfo[] = [];
        const seenKeys = new Set();
        // CSV Headers: pincode,taluk,district,state,x,y
        results.data.forEach((row: any) => {
          if (row.pincode && row.x != null && row.y != null && row.taluk && row.district && row.state) {
            const key = `${row.pincode}-${row.taluk}`;
            if (seenKeys.has(key)) return; // Avoid duplicates
            seenKeys.add(key);
            
            const pincodeStr = String(row.pincode);
            list.push({
              pincode: pincodeStr,
              name: row.taluk,
              district: row.district,
              state: row.state,
              x: row.x,
              y: row.y,
              searchableString: `${row.taluk}, ${row.district}, ${row.state} ${pincodeStr}`.toLowerCase()
            });
          }
        });
        setLocationList(list);
        setIsLoading(false);
      },
      error: (error) => {
        console.error("Error parsing pincode CSV:", error);
        setIsLoading(false);
      }
    });
  }, []);

  return { locationList, isLoading };
};
