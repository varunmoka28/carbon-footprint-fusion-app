
import { useState } from 'react';
import { ProcessedTrip } from '@/components/TripDataTable';
import { EMISSION_FACTORS, VehicleType } from '@/lib/constants';
import { parseCsv, findKey } from '@/lib/csvUtils';

export interface ReportGeneratorInput {
  tripsFile: File | null;
  vehiclesFile: File | null;
}

export const useReportGenerator = () => {
  const [report, setReport] = useState<ProcessedTrip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assumptionNotes, setAssumptionNotes] = useState<string[]>([]);

  const generateReport = async ({ tripsFile, vehiclesFile }: ReportGeneratorInput) => {
    if (!tripsFile || !vehiclesFile) {
      setError("Please upload both trips and vehicles CSV files.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setReport([]);
    setAssumptionNotes([]);

    try {
      const tripsData = await parseCsv(tripsFile);
      const vehiclesData = await parseCsv(vehiclesFile);

      if (!vehiclesData || vehiclesData.length === 0) {
        throw new Error("The vehicles CSV file appears to be empty or is not a valid CSV.");
      }
      if (!tripsData || tripsData.length === 0) {
        throw new Error("The trips CSV file appears to be empty or is not a valid CSV.");
      }

      const vehicleMap = new Map();
      const vehicleIdKeys = ['vehiclenumber', 'vehicle no', 'reg no', 'vehicleid', 'registration', 'current vehicle no'];
      const vehicleClassKeys = ['class', 'vehicle_class', 'type', 'vehicle_type'];
      
      const vehicleIdKey = findKey(vehiclesData[0], vehicleIdKeys);
      const vehicleClassKey = findKey(vehiclesData[0], vehicleClassKeys);

      if (!vehicleIdKey) {
        const availableColumns = Object.keys(vehiclesData[0] || {}).join(', ');
        throw new Error(`Vehicles CSV Error: Could not find a vehicle identifier column. Found columns: [${availableColumns}]. Expected a column header like 'Vehicle Number', 'Reg No', etc.`);
      }
      
      if (!vehicleClassKey) {
        setAssumptionNotes(prev => [...prev, "The 'vehicle class' column was not found in your vehicles file. All vehicles have been assumed to be 'HGV' for a conservative emission estimate."]);
      } else {
        vehiclesData.forEach((v: any) => vehicleMap.set(String(v[vehicleIdKey]), v[vehicleClassKey]));
      }
      
      const tripVehicleIdKeys = ['vehiclenumber', 'vehicle no', 'reg no', 'vehicleid', 'registration', 'current vehicle no'];
      const distanceKeys = ['distance', 'distance_km', 'km'];
      const tripIdKeys = ['trip_id', 'tripid'];

      const tripVehicleIdKey = findKey(tripsData[0], tripVehicleIdKeys);
      const distanceKey = findKey(tripsData[0], distanceKeys);
      const tripIdKey = findKey(tripsData[0], tripIdKeys);

      if (!tripVehicleIdKey) {
        const availableColumns = Object.keys(tripsData[0] || {}).join(', ');
        throw new Error(`Trips CSV Error: Could not find a vehicle identifier column. Found columns: [${availableColumns}]. Expected a column header like 'Vehicle Number', 'Reg No', etc.`);
      }
      if (!distanceKey) {
        const availableColumns = Object.keys(tripsData[0] || {}).join(', ');
        throw new Error(`Trips CSV Error: Missing distance column. Found columns: [${availableColumns}]. Expected a column like: ${distanceKeys.join(', ')}.`);
      }
      if (!tripIdKey) {
        const availableColumns = Object.keys(tripsData[0] || {}).join(', ');
        throw new Error(`Trips CSV Error: Missing trip identifier. Found columns: [${availableColumns}]. Expected a column like: ${tripIdKeys.join(', ')}.`);
      }

      const processedData: ProcessedTrip[] = tripsData.map((trip: any) => {
        const vehicle_id = String(trip[tripVehicleIdKey]);
        const distance_km = parseFloat(trip[distanceKey]);
        const vehicle_class_raw = vehicleClassKey ? (vehicleMap.get(vehicle_id) || 'UNKNOWN') : 'HGV';
        const vehicle_class = (Object.keys(EMISSION_FACTORS).includes(vehicle_class_raw.toUpperCase()) ? vehicle_class_raw.toUpperCase() : 'UNKNOWN') as VehicleType;

        return {
          trip_id: String(trip[tripIdKey]),
          vehicle_id,
          distance_km,
          vehicle_class,
          emissions_kg_co2e: distance_km * EMISSION_FACTORS[vehicle_class],
        };
      }).filter((t: ProcessedTrip) => !isNaN(t.distance_km) && !isNaN(t.emissions_kg_co2e));
      
      setReport(processedData);

    } catch (e: any) {
      setError(e.message || "An error occurred during processing.");
      setReport([]);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setReport([]);
    setError(null);
    setAssumptionNotes([]);
  };

  return { report, isLoading, error, assumptionNotes, generateReport, reset };
};
