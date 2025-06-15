
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartData {
  name: string;
  emissions: number;
}

const EmissionsChart = ({ data }: { data: ChartData[] }) => {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Emissions by Vehicle Type</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px] w-full">
        <ResponsiveContainer>
          {data.length > 0 ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="emissions" fill="#2ECC71" name="Emissions (kg CO₂e)" />
            </BarChart>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Awaiting data to generate chart...
            </div>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EmissionsChart;
