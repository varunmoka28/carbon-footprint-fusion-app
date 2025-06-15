
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tractor } from 'lucide-react';

export interface VehicleData {
  vehicleNo: string;
  totalEmissions: number;
  tripCount: number;
  totalDistance: number;
  efficiency: number;
}

interface VehiclesDashboardProps {
  data: VehicleData[];
}

const VehiclesDashboard = ({ data }: VehiclesDashboardProps) => {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Vehicles Dashboard</CardTitle>
        <Tractor className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="h-[350px] w-full overflow-auto">
        {data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle No.</TableHead>
                <TableHead className="text-right">Total Trips</TableHead>
                <TableHead className="text-right">Total Distance (km)</TableHead>
                <TableHead className="text-right">Total Emissions (kg CO₂e)</TableHead>
                <TableHead className="text-right">Efficiency (kg CO₂e/km)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((vehicle) => (
                <TableRow key={vehicle.vehicleNo}>
                  <TableCell className="font-medium">{vehicle.vehicleNo}</TableCell>
                  <TableCell className="text-right">{vehicle.tripCount}</TableCell>
                  <TableCell className="text-right">{vehicle.totalDistance.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{vehicle.totalEmissions.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{vehicle.efficiency.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Awaiting data to generate vehicle stats...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VehiclesDashboard;
