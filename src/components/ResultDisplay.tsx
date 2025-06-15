import React from 'react';
import { Info, Car, Route, Zap, Fuel as FuelIcon } from 'lucide-react';

export type EmissionFactorDetails = {
  factor: number;
  source: string;
  sourceUrl: string;
  unit: string;
};

export type Result = {
  emissions: number;
  distance?: number;
  emissionsPerTonneKm?: number;
  calculationMode: 'distance' | 'fuel';
  origin?: string;
  destination?: string;
  emissionFactorDetails?: EmissionFactorDetails;
  fuelEfficiency?: number; // km/L
  emissionIntensity?: number; // kg CO2e/km
  vehicleCategory?: string;
};

// The pincodeDb prop is no longer needed.
interface ResultDisplayProps extends Result {}

const ResultDisplay = ({ emissions, distance, emissionsPerTonneKm, calculationMode, emissionFactorDetails, fuelEfficiency, emissionIntensity, vehicleCategory }: ResultDisplayProps) => (
  <div className="mt-6 p-6 bg-slate-100 rounded-lg animate-fade-in space-y-4">
    <div className="text-center">
      <p className="font-poppins text-3xl font-bold text-eco-green-dark">{emissions.toFixed(2)} kg CO₂e</p>
      <p className="text-sm text-muted-foreground">Total Emissions</p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t text-center">
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
      
      {calculationMode === 'fuel' && (
        <>
          {typeof distance !== 'undefined' && (
            <div>
              <p className="font-bold text-lg">{distance.toFixed(0)} km</p>
              <p className="text-sm text-muted-foreground">Est. Distance</p>
            </div>
          )}
          {typeof fuelEfficiency !== 'undefined' && (
            <div>
              <p className="font-bold text-lg">{fuelEfficiency.toFixed(1)} km/L</p>
              <p className="text-sm text-muted-foreground">Fuel Efficiency</p>
            </div>
          )}
           {typeof emissionIntensity !== 'undefined' && (
            <div>
              <p className="font-bold text-lg">{emissionIntensity.toFixed(4)}</p>
              <p className="text-sm text-muted-foreground">kg CO₂e/km</p>
            </div>
          )}
          {vehicleCategory && (
            <div className="col-span-2 md:col-span-3">
              <p className="font-bold text-lg">{vehicleCategory}</p>
              <p className="text-sm text-muted-foreground">Vehicle Category</p>
            </div>
          )}
        </>
      )}
    </div>

    {emissionFactorDetails && (
      <div className="pt-4 border-t">
        <div className="flex items-start text-xs text-muted-foreground">
           <Info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
           <span>
             Calculated using an emission factor of <strong>{emissionFactorDetails.factor} kg CO₂e/{emissionFactorDetails.unit}</strong>.
             Source: <a href={emissionFactorDetails.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-eco-green">{emissionFactorDetails.source}</a>.
           </span>
        </div>
      </div>
    )}
  </div>
);

export default ResultDisplay;
