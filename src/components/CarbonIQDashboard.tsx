
import React, { useState, useMemo, useEffect } from 'react';
import Papa from 'papaparse';
import FileUpload from './FileUpload';
import KPICard from './KPICard';
import EmissionsChart from './EmissionsChart';
import TripDataTable from './TripDataTable';
import TripDetailModal from './TripDetailModal';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, BarChart, Info, Route, Tractor, PieChart as PieChartIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useReportGenerator, ReportRow } from '@/hooks/useReportGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleType } from '@/lib/constants';

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

  const chartData = useMemo(() => {
    if (report.length === 0) return [];
    const emissionsByClass = report.reduce((acc: Record<string, number>, trip: ReportRow) => {
      const vehicleClass = trip['Vehicle Category'];
      const emissions = trip['Calculated Carbon Emissions (kg CO₂e)'];
      if (vehicleClass && !isNaN(emissions)) {
        acc[vehicleClass] = (acc[vehicleClass] || 0) + emissions;
      }
      return acc;
    }, {});
    return Object.entries(emissionsByClass).map(([name, emissions]) => ({ name, emissions }));
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
        <EmissionsChart data={chartData} />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Emissions Breakdown</CardTitle>
            <PieChartIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-[350px] w-full flex items-center justify-center">
             <p className="text-muted-foreground">Pie chart coming soon.</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <TripDataTable data={report} onRowClick={handleRowClick} />
      </div>
      <TripDetailModal tripData={selectedTrip} onClose={handleCloseModal} pincodeDb={pincodeDb} />
    </div>
  );
};

export default CarbonIQDashboard;
