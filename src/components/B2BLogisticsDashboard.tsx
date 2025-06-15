import React, { useState, useMemo, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import FileUpload from './FileUpload';
import KPICard from './KPICard';
import VehiclesDashboard, { VehicleData } from './VehiclesDashboard';
import TripDataTable from './TripDataTable';
import TripDetailModal from './TripDetailModal';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, BarChart, Info, Route, Tractor, Truck, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useReportGenerator, ReportRow } from '@/hooks/useReportGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleType } from '@/lib/constants';
import VehicleTypeChart, { VehicleTypeData } from './VehicleTypeChart';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import AiHelperModal from './AiHelperModal';

const B2BLogisticsDashboard = () => {
  const [files, setFiles] = useState<{ trips: File | null; vehicles: File | null }>({ trips: null, vehicles: null });
  const [selectedTrip, setSelectedTrip] = useState<ReportRow | null>(null);
  const { report, isLoading, error, assumptionNotes, generateReport, reset } = useReportGenerator();
  const [pincodeDb, setPincodeDb] = useState<Record<string, { name: string; x: number; y: number }> | null>(null);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'trips' | 'vehicles' | null>(null);
  const tripsInputRef = useRef<HTMLInputElement>(null);
  const vehiclesInputRef = useRef<HTMLInputElement>(null);

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

  const handleAreaClick = (type: 'trips' | 'vehicles') => {
    if (!files[type]) {
      setModalType(type);
      setIsAiModalOpen(true);
    } else {
      if (type === 'trips') tripsInputRef.current?.click();
      else vehiclesInputRef.current?.click();
    }
  };

  const handleContinueUpload = () => {
    if (modalType === 'trips') {
      tripsInputRef.current?.click();
    } else if (modalType === 'vehicles') {
      vehiclesInputRef.current?.click();
    }
    setIsAiModalOpen(false);
  };

  const getFormattedDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const downloadSampleCsv = (type: 'trips' | 'vehicles') => {
    let data: object[], filename: string;
    const date = getFormattedDate();

    if (type === 'trips') {
      filename = `trips_template_${date}.csv`;
      data = [
        { "Assignment_ID": "ASSIGN001", "Vehicle_Number": "VEHICLE-001", "Source": "Mumbai", "Destination": "Delhi", "Distance_KM": 1400, "Date_Time": "2024-01-15 08:00", "Load_Weight_Tons": 15.5, "Fuel_Consumed_Liters": 180, "Total_Halt_Time_Hours": 2.5 },
        { "Assignment_ID": "ASSIGN002", "Vehicle_Number": "VEHICLE-002", "Source": "Chennai", "Destination": "Bangalore", "Distance_KM": 350, "Date_Time": "2024-01-16 14:30", "Load_Weight_Tons": 8.2, "Fuel_Consumed_Liters": 45, "Total_Halt_Time_Hours": 1.0 },
        { "Assignment_ID": "ASSIGN003", "Vehicle_Number": "VEHICLE-003", "Source": "Kolkata", "Destination": "Hyderabad", "Distance_KM": 1200, "Date_Time": "2024-01-17 10:15", "Load_Weight_Tons": 20.0, "Fuel_Consumed_Liters": 150, "Total_Halt_Time_Hours": 3.0 }
      ];
    } else {
      filename = `vehicles_template_${date}.csv`;
      data = [
        { "Vehicle_Number": "VEHICLE-001", "Vehicle_Type": "Heavy Goods Vehicle", "Model": "Tata 1618", "Fuel_Type": "Diesel", "Gross_Vehicle_Weight_Tons": 16.2, "Year_Manufactured": 2019, "Emission_Standard": "BS-VI" },
        { "Vehicle_Number": "VEHICLE-002", "Vehicle_Type": "Medium Goods Vehicle", "Model": "Ashok Leyland 1415", "Fuel_Type": "Diesel", "Gross_Vehicle_Weight_Tons": 14.0, "Year_Manufactured": 2020, "Emission_Standard": "BS-VI" },
        { "Vehicle_Number": "VEHICLE-003", "Vehicle_Type": "Heavy Goods Vehicle", "Model": "Mahindra Blazo", "Fuel_Type": "Diesel", "Gross_Vehicle_Weight_Tons": 25.0, "Year_Manufactured": 2021, "Emission_Standard": "BS-VI" }
      ];
    }
    
    const csv = Papa.unparse(data);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsAiModalOpen(false);
  };

  const kpiData = useMemo(() => {
    if (report.length === 0) return { totalEmissions: 0, totalDistance: 0, totalTrips: 0, totalVehicles: 0 };
    
    const totalEmissions = report.reduce((sum, trip) => {
      const emissions = trip['Calculated Carbon Emissions (kg CO₂e)'];
      return sum + (isNaN(emissions) ? 0 : emissions);
    }, 0);

    const totalDistance = report.reduce((sum, trip) => {
      const distance = trip['Running Distance (km)'];
      return sum + (isNaN(distance) ? 0 : distance);
    }, 0);

    const totalVehicles = new Set(report.map(trip => trip['Vehicle No.'])).size;

    return { totalEmissions, totalDistance, totalTrips: report.length, totalVehicles };
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
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">B2B Last Mile & First Mile Emissions Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This tool is designed for analyzing carbon emissions from one-way, B2B supply chain transaction trips (last-mile or first-mile).
          </p>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>For Demonstration Purposes Only</AlertTitle>
            <AlertDescription>
              All trip and vehicle data used in this dashboard is mock data, intended to showcase the tool's capabilities.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="flex items-center gap-2 font-semibold text-base">
              <span role="img" aria-label="clipboard">📋</span> How to Get Started
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 pb-4 px-4 border-t">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Download the sample templates below.</li>
                <li>Replace sample data with your actual trip/vehicle information.</li>
                <li>Keep column headers exactly as provided.</li>
                <li>Upload completed files for analysis.</li>
              </ol>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold text-blue-800">💡 Pro Tip:</p>
                <p className="text-blue-700">Use AI assistants (like ChatGPT or Claude) to help convert your existing data formats to match our template structure.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <FileUpload ref={tripsInputRef} fileType="trips" title="1. Upload Trips CSV" onFileUpload={handleFileUpload} fileName={files.trips?.name || null} onAreaClick={() => handleAreaClick('trips')} />
          <Button variant="secondary" onClick={() => downloadSampleCsv('trips')}>
             <span role="img" aria-label="download" className="mr-2">📥</span> Download Sample Trips Template
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <FileUpload ref={vehiclesInputRef} fileType="vehicles" title="2. Upload Vehicles CSV" onFileUpload={handleFileUpload} fileName={files.vehicles?.name || null} onAreaClick={() => handleAreaClick('vehicles')} />
          <Button variant="secondary" onClick={() => downloadSampleCsv('vehicles')}>
            <span role="img" aria-label="download" className="mr-2">📥</span> Download Sample Vehicles Template
          </Button>
        </div>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Emissions" value={kpiData.totalEmissions.toFixed(0)} unit="kg CO₂e" icon={BarChart} />
        <KPICard title="Total Distance" value={kpiData.totalDistance.toFixed(0)} unit="km" icon={Route} />
        <KPICard title="Total Trips" value={String(kpiData.totalTrips)} unit="Trips Analyzed" icon={Tractor} />
        <KPICard title="Total Vehicles" value={String(kpiData.totalVehicles)} unit="Vehicles Analyzed" icon={Truck} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VehiclesDashboard data={vehicleDashboardData} />
        <VehicleTypeChart data={vehicleTypeEmissionsData} />
      </div>
      <div>
        <TripDataTable data={report} onRowClick={handleRowClick} />
      </div>
      <TripDetailModal tripData={selectedTrip} onClose={handleCloseModal} pincodeDb={pincodeDb} />
      {modalType && (
        <AiHelperModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onContinue={handleContinueUpload}
          onDownloadTemplate={() => downloadSampleCsv(modalType)}
          type={modalType}
        />
      )}
    </div>
  );
};

export default B2BLogisticsDashboard;
