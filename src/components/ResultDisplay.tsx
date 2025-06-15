
import React from 'react';
// The IndiaMap and PincodeDB imports are no longer needed.

export type Result = {
  emissions: number;
  distance?: number;
  emissionsPerTonneKm?: number;
  calculationMode: 'distance' | 'fuel';
  origin?: string;
  destination?: string;
};

// The pincodeDb prop is no longer needed.
interface ResultDisplayProps extends Result {}

const ResultDisplay = ({ emissions, distance, emissionsPerTonneKm, calculationMode }: ResultDisplayProps) => (
  <div className="mt-6 p-6 bg-slate-100 rounded-lg animate-fade-in space-y-4">
    <div className="text-center">
      <p className="font-poppins text-3xl font-bold text-eco-green-dark">{emissions.toFixed(2)} kg CO₂e</p>
      <p className="text-sm text-muted-foreground">Total Emissions</p>
    </div>
    <div className="flex justify-around items-start pt-4 border-t text-center w-full gap-4">
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
      {/* The route visualization component has been removed from here. */}
    </div>
  </div>
);

export default ResultDisplay;
