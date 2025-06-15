import { useState } from 'react';
import { EMISSION_FACTORS, VehicleType } from '@/lib/constants';
import { parseCsv, findKey } from '@/lib/csvUtils';

export interface ReportGeneratorInput {
  tripsFile: File | null;
  vehiclesFile: File | null;
}

export interface ReportRow {
  'Physical Trip ID': string;
  'Assignment UID(s) Included': string;
  'Consignment Note UID(s)': string;
  'Vehicle No.': string;
  'Source': string;
  'Destination': string;
  'Running Distance (km)': number;
  'Representative Trip Completed At': string;
  'Vehicle Category': VehicleType | 'UNKNOWN';
  'Emission Factor (kg CO₂e/km)': number;
  'Calculated Carbon Emissions (kg CO₂e)': number;
}

export const useReportGenerator = () => {
  const [report, setReport] = useState<ReportRow[]>([]);
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
      const distanceKeys = ['runningdistance', 'totaldistance'];
      const sourceKeys = ['source'];
      const destinationKeys = ['destination'];
      const tripStartKeys = ['tripstartedat'];
      const assignmentUidKeys = ['assignmentuid'];
      const consignmentNoteUidKeys = ['consignmentnoteuid'];
      const tripCompletedKeys = ['tripcompletedat'];

      const tripsSampleRow = tripsData[0] || {};
      const tripVehicleIdKey = findKey(tripsSampleRow, tripVehicleIdKeys);
      const distanceKey = findKey(tripsSampleRow, distanceKeys);
      const sourceKey = findKey(tripsSampleRow, sourceKeys);
      const destinationKey = findKey(tripsSampleRow, destinationKeys);
      const tripStartKey = findKey(tripsSampleRow, tripStartKeys);
      const assignmentUidKey = findKey(tripsSampleRow, assignmentUidKeys);
      const consignmentNoteUidKey = findKey(tripsSampleRow, consignmentNoteUidKeys);
      const tripCompletedKey = findKey(tripsSampleRow, tripCompletedKeys);
      
      const availableColumns = Object.keys(tripsSampleRow).join(', ');
      if (!tripVehicleIdKey) throw new Error(`Trips CSV Error: Could not find a vehicle identifier column. Available columns: [${availableColumns}]. Expected: ${tripVehicleIdKeys.join(', ')}.`);
      if (!distanceKey) throw new Error(`Trips CSV Error: Could not find a distance column. Available columns: [${availableColumns}]. Expected: ${distanceKeys.join(', ')}.`);
      if (!sourceKey) throw new Error(`Trips CSV Error: Could not find a source column. Available columns: [${availableColumns}]. Expected: ${sourceKeys.join(', ')}.`);
      if (!destinationKey) throw new Error(`Trips CSV Error: Could not find a destination column. Available columns: [${availableColumns}]. Expected: ${destinationKeys.join(', ')}.`);
      if (!tripStartKey) throw new Error(`Trips CSV Error: Could not find a trip start time column. Available columns: [${availableColumns}]. Expected: ${tripStartKeys.join(', ')}.`);
      
      if (!assignmentUidKey) {
        setAssumptionNotes(prev => [...prev, "Could not find 'Assignment UID' column. This will be left blank."]);
      }
      if (!consignmentNoteUidKey) {
        setAssumptionNotes(prev => [...prev, "Could not find 'Consignment Note UID' column. This will be left blank."]);
      }
      if (!tripCompletedKey) {
        setAssumptionNotes(prev => [...prev, "Could not find 'Trip Completed At' column. This will be left blank."]);
      }

      // --- Stage 1: Consolidation ---
      const consolidatedTripsMap = new Map();
      let invalidDateRows = 0;

      for (const rawTrip of tripsData) {
        const vehicleId = String(rawTrip[tripVehicleIdKey]);
        const source = String(rawTrip[sourceKey]);
        const destination = String(rawTrip[destinationKey]);
        const tripStartStr = rawTrip[tripStartKey];
        const distance = parseFloat(rawTrip[distanceKey]);
        const assignmentUid = assignmentUidKey ? rawTrip[assignmentUidKey] : null;
        const consignmentNoteUid = consignmentNoteUidKey ? rawTrip[consignmentNoteUidKey] : null;
        const tripCompletedAt = tripCompletedKey ? rawTrip[tripCompletedKey] : null;

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
          if (tripCompletedAt && (!existingTrip.representative_trip_completed_at || new Date(tripCompletedAt) > new Date(existingTrip.representative_trip_completed_at))) {
            existingTrip.representative_trip_completed_at = tripCompletedAt;
          }
          if (assignmentUid) existingTrip.assignment_uids.add(assignmentUid);
          if (consignmentNoteUid) existingTrip.consignment_note_uids.add(consignmentNoteUid);
        } else {
          consolidatedTripsMap.set(compositeKey, {
            physical_trip_id: compositeKey,
            vehicle_no: vehicleId,
            source: source,
            destination: destination,
            distance_km: distance,
            representative_trip_completed_at: tripCompletedAt,
            assignment_uids: assignmentUid ? new Set([assignmentUid]) : new Set(),
            consignment_note_uids: consignmentNoteUid ? new Set([consignmentNoteUid]) : new Set(),
          });
        }
      }

      if (invalidDateRows > 0) {
        setAssumptionNotes(prev => [...prev, `${invalidDateRows} rows were skipped from the trips file due to an unreadable date format in the '${tripStartKey}' column.`]);
      }

      const consolidatedTrips = Array.from(consolidatedTripsMap.values());

      // --- Stage 2: Calculation ---
      const processedData: ReportRow[] = consolidatedTrips.map((trip, index) => {
        const vehicle_class_raw = vehicleClassKey ? (vehicleMap.get(trip.vehicle_no) || 'UNKNOWN') : 'HGV';
        const vehicle_class = (Object.keys(EMISSION_FACTORS).includes(vehicle_class_raw.toUpperCase()) ? vehicle_class_raw.toUpperCase() : 'UNKNOWN') as VehicleType;
        const emission_factor = EMISSION_FACTORS[vehicle_class];

        return {
          'Physical Trip ID': `TRIP-${index + 1}`,
          'Assignment UID(s) Included': Array.from(trip.assignment_uids).join(', '),
          'Consignment Note UID(s)': Array.from(trip.consignment_note_uids).join(', '),
          'Vehicle No.': trip.vehicle_no,
          'Source': trip.source,
          'Destination': trip.destination,
          'Running Distance (km)': trip.distance_km,
          'Representative Trip Completed At': trip.representative_trip_completed_at || 'N/A',
          'Vehicle Category': vehicle_class,
          'Emission Factor (kg CO₂e/km)': emission_factor,
          'Calculated Carbon Emissions (kg CO₂e)': trip.distance_km * emission_factor,
        };
      }).filter((t) => !isNaN(t['Running Distance (km)']) && !isNaN(t['Calculated Carbon Emissions (kg CO₂e)']));
      
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
