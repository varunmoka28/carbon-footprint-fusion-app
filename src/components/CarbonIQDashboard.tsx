import React, { useState, useMemo, useEffect } from 'react';
import Papa from 'papaparse';
import FileUpload from './FileUpload';
import KPICard from './KPICard';
import VehiclesDashboard, { VehicleData } from './VehiclesDashboard';
import TripDataTable from './TripDataTable';
import TripDetailModal from './TripDetailModal';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, BarChart, Info, Route, Tractor } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useReportGenerator, ReportRow } from '@/hooks/useReportGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleType } from '@/lib/constants';
import VehicleTypeChart, { VehicleTypeData } from './VehicleTypeChart';

const CarbonIQDashboard = () => {
  const [files, setFiles] = useState<{ trips: File | null; vehicles: File | null }>({ trips: null, vehicles: null });
  const [selectedTrip, setSelectedTrip] = useState<ReportRow | null>(null);
  const { report, isLoading, error, assumptionNotes, generateReport, reset } = useReportGenerator();
  const [pincodeDb, setPincodeDb] = useState<Record<string, { name: string; x: number; y: number }> | null>(null);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPincodeData = async () => {
      try {
        const response = await fetch('/pincode.csv');
        if (!response.ok) {
          throw new Error(`Failed to fetch pincode data. Status: ${response.status}`);
        }
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length) {
              console.error('Parsing errors:', results.errors);
              setPincodeError('Failed to parse pincode data.');
              return;
            }
            const pincodeMap = (results.data as any[]).reduce((acc: Record<string, { name: string; x: number; y: number }>, row: any) => {
              // Fix: Use correct column names from the CSV file (Pincode, OfficeName, Longitude, Latitude)
              if (row.Pincode && row.Longitude && row.Latitude && row.OfficeName) {
                const lon = parseFloat(row.Longitude);
                const lat = parseFloat(row.Latitude);
                if (!isNaN(lon) && !isNaN(lat)) {
                  acc[row.Pincode] = {
                    name: row.OfficeName,
                    x: lon, // Longitude
                    y: lat, // Latitude
                  };
                }
              }
              return acc;
            }, {});
            setPincodeDb(pincodeMap);
          },
          error: (error: any) => {
            console.error('Error parsing pincode CSV:', error);
            setPincodeError('Failed to parse pincode data.');
          },
        });
      } catch (err: any) {
        console.error("Failed to fetch pincode data:", err);
        setPincodeError(err.message || 'An unknown error occurred while fetching map data.');
      }
    };

    fetchPincodeData();
  }, []);

  const handleFileUpload = (file: File, type: 'trips' | 'vehicles') => {
    setFiles(prev => ({ ...prev, [type]: file }));
    reset();
  };
  
  const handleGenerateReport = () => {
    generateReport({ tripsFile: files.trips, vehiclesFile: files.vehicles });
  };

  const handleRowClick = (trip: ReportRow) => {
    setSelectedTrip(trip);
  };

  const handleCloseModal = () => {
    setSelectedTrip(null);
  };

  const kpiData = useMemo(() => {
    if (report.length === 0) return { totalEmissions: 0, totalDistance: 0, totalTrips: 0 };
    
    const totalEmissions = report.reduce((sum, trip) => {
      const emissions = trip['Calculated Carbon Emissions (kg CO₂e)'];
      return sum + (isNaN(emissions) ? 0 : emissions);
    }, 0);

    const totalDistance = report.reduce((sum, trip) => {
      const distance = trip['Running Distance (km)'];
      return sum + (isNaN(distance) ? 0 : distance);
    }, 0);

    return { totalEmissions, totalDistance, totalTrips: report.length };
  }, [report]);

  const vehicleDashboardData = useMemo((): VehicleData[] => {
    if (report.length === 0) return [];

    const vehicleStats: Record<string, {
        totalEmissions: number;
        tripCount: number;
        totalDistance: number;
    }> = report.reduce((acc, trip) => {
        const vehicleNo = trip['Vehicle No.'];
        const emissions = trip['Calculated Carbon Emissions (kg CO₂e)'];
        const distance = trip['Running Distance (km)'];

        if (!acc[vehicleNo]) {
            acc[vehicleNo] = { totalEmissions: 0, tripCount: 0, totalDistance: 0 };
        }

        if (!isNaN(emissions)) {
            acc[vehicleNo].totalEmissions += emissions;
        }
        if (!isNaN(distance)) {
            acc[vehicleNo].totalDistance += distance;
        }
        acc[vehicleNo].tripCount += 1;

        return acc;
    }, {} as Record<string, { totalEmissions: number; tripCount: number; totalDistance: number; }>);

    return Object.entries(vehicleStats).map(([vehicleNo, stats]) => ({
        vehicleNo,
        ...stats,
        efficiency: stats.totalDistance > 0 ? stats.totalEmissions / stats.totalDistance : 0,
    })).sort((a, b) => b.totalEmissions - a.totalEmissions);
  }, [report]);

  const vehicleTypeEmissionsData = useMemo((): VehicleTypeData[] => {
    if (report.length === 0) return [];

    const emissionsByType = report.reduce((acc, trip) => {
      const vehicleType = trip['Vehicle Category'] || 'UNKNOWN';
      const emissions = trip['Calculated Carbon Emissions (kg CO₂e)'];
      
      if (!acc[vehicleType]) {
        acc[vehicleType] = 0;
      }
      
      if (!isNaN(emissions)) {
        acc[vehicleType] += emissions;
      }

      return acc;
    }, {} as Record<string, number>);

    return Object.entries(emissionsByType)
      .map(([type, emissions]) => ({ type, emissions }))
      .sort((a, b) => b.emissions - a.emissions);
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
       {pincodeError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Map Data Error</AlertTitle>
          <AlertDescription>{pincodeError}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {assumptionNotes.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Assumptions Made</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside">
              {assumptionNotes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KPICard title="Total Emissions" value={kpiData.totalEmissions.toFixed(0)} unit="kg CO₂e" icon={BarChart} />
        <KPICard title="Total Distance" value={kpiData.totalDistance.toFixed(0)} unit="km" icon={Route} />
        <KPICard title="Total Trips" value={String(kpiData.totalTrips)} unit="Trips Analyzed" icon={Tractor} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VehiclesDashboard data={vehicleDashboardData} />
        <VehicleTypeChart data={vehicleTypeEmissionsData} />
      </div>
      <div>
        <TripDataTable data={report} onRowClick={handleRowClick} />
      </div>
      <TripDetailModal tripData={selectedTrip} onClose={handleCloseModal} pincodeDb={pincodeDb} />
    </div>
  );
};

export default CarbonIQDashboard;
