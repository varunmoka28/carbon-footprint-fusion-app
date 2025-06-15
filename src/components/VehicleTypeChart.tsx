
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, Pie, PieChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, BarChart as RechartsBarChart } from 'recharts';

export interface VehicleTypeData {
  type: string;
  emissions: number;
}

interface VehicleTypeChartProps {
  data: VehicleTypeData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const VehicleTypeChart = ({ data }: VehicleTypeChartProps) => {
  if (data.length === 0) {
    return null;
  }

  const chartData = data.map(d => ({ name: d.type, emissions: parseFloat(d.emissions.toFixed(2)) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emissions by Vehicle Type</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="emissions"
                nameKey="name"
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                  if (percent * 100 < 5) return null;
                  return (
                    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(2)} kg CO₂e`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(tick) => `${tick > 1000 ? `${(tick/1000).toFixed(1)}k` : tick}`} label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => `${value.toFixed(2)} kg CO₂e`} />
              <Bar dataKey="emissions" fill="#8884d8">
                 {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleTypeChart;
