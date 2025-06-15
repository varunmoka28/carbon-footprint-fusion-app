
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportRow } from '@/hooks/useReportGenerator';

const TripDataTable = ({ data }: { data: ReportRow[] }) => {
  const headers: (keyof ReportRow)[] = [
    'Physical Trip ID', 'Assignment UID(s) Included', 'Consignment Note UID(s)', 'Vehicle No.',
    'Source', 'Destination', 'Running Distance (km)', 'Representative Trip Completed At',
    'Vehicle Category', 'Emission Factor (kg CO₂e/km)', 'Calculated Carbon Emissions (kg CO₂e)'
  ];

  const renderCell = (trip: ReportRow, header: keyof ReportRow) => {
    const value = trip[header];
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processed Trip Data</CardTitle>
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
                <TableRow key={trip['Physical Trip ID'] || index}>
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
