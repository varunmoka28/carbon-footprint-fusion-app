
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Route, Leaf } from 'lucide-react';

// Emission factors in kg CO2e/km
const EMISSION_FACTORS = {
  'LGV': 0.34, // Light Goods Vehicle
  'MGV': 0.42, // Medium Goods Vehicle
  'HGV': 1.26, // Heavy Goods Vehicle
};

type VehicleType = keyof typeof EMISSION_FACTORS;

const ResultDisplay = ({ distance, emissions }: { distance: number; emissions: number }) => (
  <div className="mt-6 p-6 bg-slate-100 rounded-lg animate-fade-in space-y-4">
    <div className="text-center">
      <p className="font-poppins text-3xl font-bold text-eco-green-dark">{emissions.toFixed(2)} kg CO₂e</p>
      <p className="text-sm text-muted-foreground">Total Emissions</p>
    </div>
    <div className="flex justify-around items-center pt-4 border-t">
      <div>
        <p className="font-bold text-lg">{distance.toFixed(0)} km</p>
        <p className="text-sm text-muted-foreground">Estimated Distance</p>
      </div>
      <div className="text-center">
        <div className="w-24 h-16 bg-slate-200 rounded-md flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Map</p>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Route Visualization</p>
      </div>
    </div>
  </div>
);

const SimpleTripCalculator = () => {
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [result, setResult] = useState<{ distance: number; emissions: number } | null>(null);

  // Simulate an API call to get distance
  const getSimulatedDistance = () => Math.floor(Math.random() * (1000 - 50)) + 50;

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleType) {
      // In a real app, you'd show a toast notification here.
      console.error("Please select a vehicle type.");
      return;
    }
    const distance = getSimulatedDistance();
    const emissions = distance * EMISSION_FACTORS[vehicleType];
    setResult({ distance, emissions });
  };

  return (
    <div className="flex justify-center items-center py-12 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="font-poppins text-2xl text-center flex items-center justify-center gap-2">
            <Leaf className="text-eco-green" /> Simple Trip Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Origin Location" className="pl-10" required />
            </div>
            <div className="relative">
              <Route className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Destination Location" className="pl-10" required />
            </div>
            <div>
              <Select onValueChange={(value: VehicleType) => setVehicleType(value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Vehicle Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LGV">Light Goods Vehicle (LGV)</SelectItem>
                  <SelectItem value="MGV">Medium Goods Vehicle (MGV)</SelectItem>
                  <SelectItem value="HGV">Heavy Goods Vehicle (HGV)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-eco-green hover:bg-eco-green-dark text-white font-bold py-3 text-base">
              Calculate Emissions
            </Button>
          </form>
          {result && <ResultDisplay distance={result.distance} emissions={result.emissions} />}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleTripCalculator;
