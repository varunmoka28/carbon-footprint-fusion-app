
import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import FileUpload from './FileUpload';
import KPICard from './KPICard';
import EmissionsChart from './EmissionsChart';
import TripDataTable, { ProcessedTrip } from './TripDataTable';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, BarChart, Route, Tractor } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Emission factors in kg CO2e/km
const EMISSION_FACTORS = {
  'LGV': 0.34, // Light Goods Vehicle
  'MGV': 0.42, // Medium Goods Vehicle
  'HGV': 1.26, // Heavy Goods Vehicle
  'UNKNOWN': 0.5, // A default fallback
};

type VehicleType = keyof typeof EMISSION_FACTORS;

const CarbonIQDashboard = () => {
  const [files, setFiles] = useState<{ trips: File | null; vehicles: File | null }>({ trips: null, vehicles: null });
  const [report, setReport] = useState<ProcessedTrip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (file: File, type: 'trips' | 'vehicles') => {
    setFiles(prev => ({ ...prev, [type]: file }));
    setReport([]);
    setError(null);
  };
  
  // A simplified semantic matcher
  const findKey = (obj: any, potentialKeys: string[]) => {
    const lowerCaseKeys = Object.keys(obj).map(k => k.toLowerCase());
    for (const pKey of potentialKeys) {
      const foundKey = Object.keys(obj)[lowerCaseKeys.indexOf(pKey.toLowerCase())];
      if (foundKey) return foundKey;
    }
    return null;
  }

  const handleGenerateReport = async () => {
    if (!files.trips || !files.vehicles) {
      setError("Please upload both trips and vehicles CSV files.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const tripsData = await parseCsv(files.trips);
      const vehiclesData = await parseCsv(files.vehicles);

      const vehicleMap = new Map();
      const vehicleIdKey = findKey(vehiclesData[0], ['vehicle_id', 'vehicleid', 'id', 'truck_id']);
      const vehicleClassKey = findKey(vehiclesData[0], ['class', 'vehicle_class', 'type', 'vehicle_type']);

      if (!vehicleIdKey || !vehicleClassKey) throw new Error("Could not find required columns in vehicles CSV.");

      vehiclesData.forEach((v: any) => vehicleMap.set(String(v[vehicleIdKey]), v[vehicleClassKey]));
      
      const tripVehicleIdKey = findKey(tripsData[0], ['vehicle_id', 'vehicleid', 'id', 'truck_id']);
      const distanceKey = findKey(tripsData[0], ['distance', 'distance_km', 'km']);
      const tripIdKey = findKey(tripsData[0], ['trip_id', 'tripid']);

      if (!tripVehicleIdKey || !distanceKey || !tripIdKey) throw new Error("Could not find required columns in trips CSV.");

      const processedData: ProcessedTrip[] = tripsData.map((trip: any) => {
        const vehicle_id = String(trip[tripVehicleIdKey]);
        const distance_km = parseFloat(trip[distanceKey]);
        const vehicle_class_raw = vehicleMap.get(vehicle_id) || 'UNKNOWN';
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

  const parseCsv = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (error: any) => reject(error),
      });
    });
  };

  const kpiData = useMemo(() => {
    if (report.length === 0) return { totalEmissions: 0, totalDistance: 0, totalTrips: 0 };
    const totalEmissions = report.reduce((sum, trip) => sum + trip.emissions_kg_co2e, 0);
    const totalDistance = report.reduce((sum, trip) => sum + trip.distance_km, 0);
    return { totalEmissions, totalDistance, totalTrips: report.length };
  }, [report]);

  const chartData = useMemo(() => {
    if (report.length === 0) return [];
    const emissionsByClass = report.reduce((acc, trip) => {
      acc[trip.vehicle_class] = (acc[trip.vehicle_class] || 0) + trip.emissions_kg_co2e;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(emissionsByClass).map(([name, emissions]) => ({ name, emissions: parseFloat(emissions.toFixed(2)) }));
  }, [report]);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <FileUpload fileType="trips" title="1. Upload Trips CSV" onFileUpload={handleFileUpload} fileName={files.trips?.name || null} />
        <FileUpload fileType="vehicles" title="2. Upload Vehicles CSV" onFileUpload={handleFileUpload} fileName={files.vehicles?.name || null} />
        <div className="md:col-span-2 lg:col-span-2 flex flex-col justify-end">
          <Button onClick={handleGenerateReport} disabled={isLoading || !files.trips || !files.vehicles} className="w-full bg-eco-green hover:bg-eco-green-dark text-white font-bold py-6 text-lg">
            {isLoading ? 'Processing...' : 'Generate Eco-Analytics Report'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KPICard title="Total Emissions" value={kpiData.totalEmissions.toFixed(0)} unit="kg CO₂e" icon={BarChart} />
        <KPICard title="Total Distance" value={kpiData.totalDistance.toFixed(0)} unit="km" icon={Route} />
        <KPICard title="Total Trips" value={String(kpiData.totalTrips)} unit="Trips Analyzed" icon={Tractor} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <EmissionsChart data={chartData} />
        <TripDataTable data={report} />
      </div>
    </div>
  );
};

export default CarbonIQDashboard;
