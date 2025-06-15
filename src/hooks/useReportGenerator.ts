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
  const [vehiclesToClassify, setVehiclesToClassify] = useState<string[]>([]);
  const [pendingReportData, setPendingReportData] = useState<{
    consolidatedTrips: any[];
    vehicleMap: Map<string, string>;
    vehicleClassKey: string | null;
  } | null>(null);

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
      const vehicleClassKeys = ['vehicleclass', 'category', 'type', 'vehiclemodel', 'details.rc_vch_catg'];
      
      const vehicleIdKey = findKey(vehiclesData[0], vehicleIdKeys);
      const vehicleClassKey = findKey(vehiclesData[0], vehicleClassKeys);

      if (!vehicleIdKey) {
        const availableColumns = Object.keys(vehiclesData[0] || {}).join(', ');
        throw new Error(`Vehicles CSV Error: Could not find a vehicle identifier column. Found columns: [${availableColumns}]. Expected a column header like 'Vehicle Number', 'Reg No', etc.`);
      }
      
      if (!vehicleClassKey) {
        throw new Error("Error: Could not find the 'Vehicle Class' column in your Vehicles CSV file. Please ensure the column is present and named appropriately.");
      }
      
      vehiclesData.forEach((v: any) => {
          if(v[vehicleIdKey]) {
              vehicleMap.set(String(v[vehicleIdKey]), v[vehicleClassKey])
          }
      });

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

      const extractPincode = (location: string): string => {
        if (!location) return 'UNKNOWN';
        const pincodeMatch = location.match(/\b\d{6}\b/);
        return pincodeMatch ? pincodeMatch[0] : location;
      };

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

        const sourceIdentifier = extractPincode(source);
        const destinationIdentifier = extractPincode(destination);
        const compositeKey = `${vehicleId}-${sourceIdentifier}-${destinationIdentifier}-${tripDate}`;

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

      // --- Stage 2: Calculation (Strict) ---
      const getVehicleCategory = (rawClass: string | undefined): VehicleType => {
        if (!rawClass) return 'UNKNOWN';
        const lowerClass = String(rawClass).toLowerCase();

        const upperClass = String(rawClass).toUpperCase();
        if (Object.keys(EMISSION_FACTORS).includes(upperClass)) {
          return upperClass as VehicleType;
        }

        if (lowerClass.includes('heavy') || lowerClass.includes('hgv')) return 'HGV';
        if (lowerClass.includes('medium') || lowerClass.includes('mgv')) return 'MGV';
        if (lowerClass.includes('light') || lowerClass.includes('lgv')) return 'LGV';

        return 'UNKNOWN';
      };

      const processedData: ReportRow[] = consolidatedTrips.map((trip, index) => {
        const vehicleId = trip.vehicle_no;

        if (!vehicleMap.has(vehicleId)) {
          throw new Error(`Error: Vehicle ${vehicleId} from your trips file was not found in the vehicle information file.`);
        }

        const rawClassFromFile = vehicleMap.get(vehicleId);
        if (!rawClassFromFile) {
            throw new Error(`Error: Vehicle Class is missing for vehicle ${vehicleId} in your vehicles file.`);
        }

        const vehicle_class = getVehicleCategory(rawClassFromFile);

        if (vehicle_class === 'UNKNOWN') {
          throw new Error(`Error: Unrecognized vehicle class '${rawClassFromFile}' for vehicle ${vehicleId}.`);
        }
        
        const emission_factor = EMISSION_FACTORS[vehicle_class];

        return {
          'Physical Trip ID': `TRIP-${index + 1}`,
          'Assignment UID(s) Included': Array.from(trip.assignment_uids).join(', '),
          'Consignment Note UID(s)': Array.from(trip.consignment_note_uids).join(', '),
          'Vehicle No.': vehicleId,
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
