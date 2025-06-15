
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

      // --- Vehicle Data Mapping ---
      const vehicleMap = new Map();
      const vehicleIdKeys = ['vehiclenumber', 'vehicle no', 'reg no', 'vehicleid', 'registration', 'current vehicle no', 'currentvehicleno'];
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
      
      // --- Trip Data Header Mapping ---
      const tripVehicleIdKeys = ['vehiclenumber', 'vehicleno', 'regno', 'currentvehicleno'];
      const distanceKeys = ['runningdistance', 'totaldistance', 'distance', 'distance_km'];
      const sourceKeys = ['source'];
      const destinationKeys = ['destination'];
      const tripStartKeys = ['tripstartedat', 'trip started at'];

      const tripsSampleRow = tripsData[0] || {};
      const tripVehicleIdKey = findKey(tripsSampleRow, tripVehicleIdKeys);
      const distanceKey = findKey(tripsSampleRow, distanceKeys);
      const sourceKey = findKey(tripsSampleRow, sourceKeys);
      const destinationKey = findKey(tripsSampleRow, destinationKeys);
      const tripStartKey = findKey(tripsSampleRow, tripStartKeys);
      
      const availableColumns = Object.keys(tripsSampleRow).join(', ');
      if (!tripVehicleIdKey) throw new Error(`Trips CSV Error: Could not find a vehicle identifier column. Available columns: [${availableColumns}]. Expected: ${tripVehicleIdKeys.join(', ')}.`);
      if (!distanceKey) throw new Error(`Trips CSV Error: Could not find a distance column. Available columns: [${availableColumns}]. Expected: ${distanceKeys.join(', ')}.`);
      if (!sourceKey) throw new Error(`Trips CSV Error: Could not find a source column. Available columns: [${availableColumns}]. Expected: ${sourceKeys.join(', ')}.`);
      if (!destinationKey) throw new Error(`Trips CSV Error: Could not find a destination column. Available columns: [${availableColumns}]. Expected: ${destinationKeys.join(', ')}.`);
      if (!tripStartKey) throw new Error(`Trips CSV Error: Could not find a trip start time column. Available columns: [${availableColumns}]. Expected: ${tripStartKeys.join(', ')}.`);
      

      // --- Stage 1: Consolidation ---
      const consolidatedTripsMap = new Map();
      let invalidDateRows = 0;

      for (const rawTrip of tripsData) {
        const vehicleId = String(rawTrip[tripVehicleIdKey]);
        const source = String(rawTrip[sourceKey]);
        const destination = String(rawTrip[destinationKey]);
        const tripStartStr = rawTrip[tripStartKey];
        const distance = parseFloat(rawTrip[distanceKey]);

        if (!vehicleId || !source || !destination || !tripStartStr || isNaN(distance)) {
          continue; // Skip rows with incomplete essential data
        }

        let tripDate;
        try {
          const dateObj = new Date(tripStartStr);
          if (isNaN(dateObj.getTime())) throw new Error('Invalid date');
          tripDate = dateObj.toISOString().split('T')[0];
        } catch (e) {
          invalidDateRows++;
          continue;
        }

        const compositeKey = `${vehicleId}-${source}-${destination}-${tripDate}`;

        const existingTrip = consolidatedTripsMap.get(compositeKey);
        if (existingTrip) {
          if (distance > existingTrip.distance_km) {
            existingTrip.distance_km = distance;
          }
        } else {
          consolidatedTripsMap.set(compositeKey, {
            trip_id: compositeKey,
            vehicle_id: vehicleId,
            distance_km: distance,
          });
        }
      }

      if (invalidDateRows > 0) {
        setAssumptionNotes(prev => [...prev, `${invalidDateRows} rows were skipped from the trips file due to an unreadable date format in the '${tripStartKey}' column.`]);
      }

      const consolidatedTrips = Array.from(consolidatedTripsMap.values());

      // --- Stage 2: Calculation ---
      const processedData: ProcessedTrip[] = consolidatedTrips.map((trip) => {
        const vehicle_class_raw = vehicleClassKey ? (vehicleMap.get(trip.vehicle_id) || 'UNKNOWN') : 'HGV';
        const vehicle_class = (Object.keys(EMISSION_FACTORS).includes(vehicle_class_raw.toUpperCase()) ? vehicle_class_raw.toUpperCase() : 'UNKNOWN') as VehicleType;

        return {
          trip_id: trip.trip_id,
          vehicle_id: trip.vehicle_id,
          distance_km: trip.distance_km,
          vehicle_class,
          emissions_kg_co2e: trip.distance_km * EMISSION_FACTORS[vehicle_class],
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
