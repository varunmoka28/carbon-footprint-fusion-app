
import React, { useState, useMemo } from 'react';
import FileUpload from './FileUpload';
import KPICard from './KPICard';
import EmissionsChart from './EmissionsChart';
import TripDataTable from './TripDataTable';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, BarChart, Info, Route, Tractor } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useReportGenerator } from '@/hooks/useReportGenerator';

const CarbonIQDashboard = () => {
  const [files, setFiles] = useState<{ trips: File | null; vehicles: File | null }>({ trips: null, vehicles: null });
  const { report, isLoading, error, assumptionNotes, generateReport, reset } = useReportGenerator();

  const handleFileUpload = (file: File, type: 'trips' | 'vehicles') => {
    setFiles(prev => ({ ...prev, [type]: file }));
    reset();
  };
  
  const handleGenerateReport = () => {
    generateReport({ tripsFile: files.trips, vehiclesFile: files.vehicles });
  };

  const kpiData = useMemo(() => {
    if (report.length === 0) return { totalEmissions: 0, totalDistance: 0, totalTrips: 0 };
    const totalEmissions = report.reduce((sum, trip) => sum + trip['Calculated Carbon Emissions (kg CO₂e)'], 0);
    const totalDistance = report.reduce((sum, trip) => sum + trip['Running Distance (km)'], 0);
    return { totalEmissions, totalDistance, totalTrips: report.length };
  }, [report]);

  const chartData = useMemo(() => {
    if (report.length === 0) return [];
    const emissionsByClass = report.reduce((acc, trip) => {
      const vehicleClass = trip['Vehicle Category'];
      const emissions = trip['Calculated Carbon Emissions (kg CO₂e)'];
      acc[vehicleClass] = (acc[vehicleClass] || 0) + emissions;
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <EmissionsChart data={chartData} />
        <TripDataTable data={report} />
      </div>
    </div>
  );
};

export default CarbonIQDashboard;
