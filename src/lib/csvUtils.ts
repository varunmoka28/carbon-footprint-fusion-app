
import Papa from 'papaparse';

export const parseCsv = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error: any) => reject(error),
    });
  });
};

// A more robust semantic matcher
export const findKey = (obj: any, potentialKeys: string[]) => {
  if (!obj) return null;
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const headerKeys = Object.keys(obj);
  const normalizedHeaderKeys = headerKeys.map(normalize);

  for (const pKey of potentialKeys) {
    const normalizedPKey = normalize(pKey);
    const index = normalizedHeaderKeys.indexOf(normalizedPKey);
    if (index !== -1) {
      return headerKeys[index]; // Return the original header key
    }
  }
  return null;
}
