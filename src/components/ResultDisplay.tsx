
import React from 'react';
import IndiaMap from './IndiaMap';
import { PincodeDB } from '@/hooks/usePincodeData';

export type Result = {
  emissions: number;
  distance?: number;
  emissionsPerTonneKm?: number;
  calculationMode: 'distance' | 'fuel';
  origin?: string;
  destination?: string;
};

interface ResultDisplayProps extends Result {
    pincodeDb: PincodeDB | null;
}

const ResultDisplay = ({ emissions, distance, emissionsPerTonneKm, calculationMode, origin, destination, pincodeDb }: ResultDisplayProps) => (
  <div className="mt-6 p-6 bg-slate-100 rounded-lg animate-fade-in space-y-4">
    <div className="text-center">
      <p className="font-poppins text-3xl font-bold text-eco-green-dark">{emissions.toFixed(2)} kg CO₂e</p>
      <p className="text-sm text-muted-foreground">Total Emissions</p>
    </div>
    <div className="flex justify-between items-start pt-4 border-t text-center w-full gap-4">
      {calculationMode === 'distance' && typeof distance !== 'undefined' && (
        <div className="flex-1">
          <p className="font-bold text-lg">{distance.toFixed(0)} km</p>
          <p className="text-sm text-muted-foreground">Estimated Distance</p>
        </div>
      )}
      {typeof emissionsPerTonneKm !== 'undefined' && (
         <div className="flex-1">
          <p className="font-bold text-lg">{emissionsPerTonneKm.toFixed(4)}</p>
          <p className="text-sm text-muted-foreground">kg CO₂e/t-km</p>
        </div>
      )}
      {calculationMode === 'distance' && (
        <div className="flex-1">
          <div className="w-full h-24 bg-slate-200 rounded-md flex items-center justify-center mx-auto">
             <IndiaMap origin={origin} destination={destination} pincodeDb={pincodeDb} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">Route Visualization</p>
        </div>
      )}
    </div>
  </div>
);

export default ResultDisplay;
