
import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export type PincodeData = {
  name: string;
  x: number; // longitude
  y: number; // latitude
};

export type PincodeDB = Record<string, PincodeData>;

export const usePincodeData = () => {
  const [pincodeDb, setPincodeDb] = useState<PincodeDB | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Papa.parse('/pincode.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const db: PincodeDB = {};
        // CSV Headers: pincode,taluk,district,state,x,y
        results.data.forEach((row: any) => {
          if (row.pincode && row.x && row.y) {
            db[String(row.pincode)] = {
              name: row.taluk || row.district || 'Unknown',
              x: row.x,
              y: row.y,
            };
          }
        });
        setPincodeDb(db);
        setIsLoading(false);
      },
      error: (error) => {
        console.error("Error parsing pincode CSV:", error);
        setIsLoading(false);
      }
    });
  }, []);

  return { pincodeDb, isLoading };
};
