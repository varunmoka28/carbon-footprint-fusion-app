
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportRow } from '@/hooks/useReportGenerator';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCsv } from '@/lib/csvUtils';

interface TripDataTableProps {
  data: ReportRow[];
  onRowClick: (trip: ReportRow) => void;
}

const TripDataTable = ({ data, onRowClick }: TripDataTableProps) => {
  const headers: (keyof ReportRow)[] = [
    'Physical Trip ID', 'Assignment UID(s) Included', 'Consignment Note UID(s)', 'Vehicle No.',
    'Source', 'Destination', 'Running Distance (km)', 'Representative Trip Completed At',
    'Vehicle Category', 'Emission Factor (kg CO₂e/km)', 'Calculated Carbon Emissions (kg CO₂e)'
  ];

  const handleDownload = () => {
    if (data.length > 0) {
      const timestamp = new Date().toISOString().split('T')[0];
      exportToCsv(data, headers, `processed-trip-data-${timestamp}.csv`);
    }
  };

  const renderCell = (trip: ReportRow, header: keyof ReportRow) => {
    const value = trip[header];
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Processed Trip Data</CardTitle>
        <Button onClick={handleDownload} disabled={data.length === 0} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => <TableHead key={header}>{header}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? data.map((trip, index) => (
                <TableRow 
                  key={trip['Physical Trip ID'] || index} 
                  onClick={() => onRowClick(trip)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  {headers.map(header => (
                    <TableCell key={header} className={typeof trip[header] === 'number' ? 'text-right' : ''}>
                      {renderCell(trip, header)}
                    </TableCell>
                  ))}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={headers.length} className="text-center h-24">No data to display. Please generate a report.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripDataTable;
