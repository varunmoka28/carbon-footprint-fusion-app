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

export const exportToCsv = (data: any[], headers: string[], filename: string) => {
  if (document.hidden) {
    console.warn("Download was attempted in a hidden tab. It might be blocked by the browser. Please make the tab visible and try again.");
    // Optionally, alert the user or queue the download
    return;
  }
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      let cell = row[header] === null || row[header] === undefined ? '' : row[header];
      
      if (typeof cell === 'number') {
        cell = cell.toFixed(2);
      }
      
      cell = String(cell);
      // Escape double quotes by doubling them
      cell = cell.replace(/"/g, '""');
      // If the cell contains a comma, double quotes, or a newline, enclose it in double quotes
      if (cell.search(/("|,|\n)/g) >= 0) {
        cell = `"${cell}"`;
      }
      return cell;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
