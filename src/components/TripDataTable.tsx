
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ProcessedTrip {
  trip_id: string;
  vehicle_id: string;
  distance_km: number;
  vehicle_class: string;
  emissions_kg_co2e: number;
}

const TripDataTable = ({ data }: { data: ProcessedTrip[] }) => {
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Processed Trip Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip ID</TableHead>
                <TableHead>Vehicle ID</TableHead>
                <TableHead>Vehicle Class</TableHead>
                <TableHead>Distance (km)</TableHead>
                <TableHead className="text-right">Emissions (kg CO₂e)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? data.map((trip) => (
                <TableRow key={trip.trip_id}>
                  <TableCell>{trip.trip_id}</TableCell>
                  <TableCell>{trip.vehicle_id}</TableCell>
                  <TableCell>{trip.vehicle_class}</TableCell>
                  <TableCell>{trip.distance_km}</TableCell>
                  <TableCell className="text-right">{trip.emissions_kg_co2e.toFixed(2)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">No data to display.</TableCell>
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
