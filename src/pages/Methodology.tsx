import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Route, Weight, FileWarning, HelpCircle, TrendingDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Methodology = () => {
  const emissionFactors = [
    { category: 'Light Goods Vehicle (LGV)', factor: '0.34 kg CO₂e/km', description: 'Typically up to 3.5 tonnes' },
    { category: 'Medium Goods Vehicle (MGV)', factor: '0.42 kg CO₂e/km', description: 'From 3.5 to 7.5 tonnes' },
    { category: 'Heavy Goods Vehicle (HGV)', factor: '1.26 kg CO₂e/km', description: 'Over 7.5 tonnes' },
    { category: 'Default / Unspecified', factor: '0.42 kg CO₂e/km (Assumed MGV)', description: 'Fallback for missing vehicle data' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 space-y-8">
        <div className="text-center space-y-2">
          <BookOpen className="mx-auto h-12 w-12 text-eco-green" />
          <h1 className="text-4xl font-bold">Calculation Methodology</h1>
          <p className="text-muted-foreground text-lg">
            Understanding how we calculate carbon emissions for last-mile logistics.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              This tool provides an estimate of carbon dioxide equivalent (CO₂e) emissions for B2B last-mile and first-mile delivery trips. The calculation is based on vehicle type, fuel type, and distance traveled. Our goal is to offer a standardized, accessible method for businesses to begin quantifying their logistics footprint.
            </p>
            <p>
              The methodology adheres to common frameworks for greenhouse gas (GHG) accounting but is simplified for ease of use with limited data inputs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Weight className="h-5 w-5" />
              Emission Calculation Framework
            </CardTitle>
            <CardDescription>
              The core formula for calculating emissions is:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg text-center font-mono my-4">
              Total Emissions (kg CO₂e) = Running Distance (km) × Emission Factor (kg CO₂e/km)
            </div>
            <h3 className="font-semibold text-lg mb-2">Emission Factors</h3>
            <p className="text-muted-foreground mb-4">
              We use standardized emission factors based on vehicle category. These factors represent the average emissions per kilometer for a typical vehicle in that class.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Emission Factor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emissionFactors.map((ef) => (
                  <TableRow key={ef.category}>
                    <TableCell className="font-medium">{ef.category}</TableCell>
                    <TableCell className="text-muted-foreground">{ef.description}</TableCell>
                    <TableCell className="text-right font-mono">{ef.factor}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-4">
              Source: Emission factors are derived from industry standards like the GLEC Framework and are subject to regional and operational variations. The values used here are illustrative for demonstration.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-blue-500" />
              Freight Efficiency: Tonne-Kilometer Emissions
            </CardTitle>
            <CardDescription>
              Measuring the carbon intensity of moving goods.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg text-center font-mono my-4">
              Emissions per Tonne-km (kg CO₂e/t-km) = Total Emissions / (Distance × Load Weight)
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                While total emissions provide a high-level view, the <strong>tonne-kilometer (t-km)</strong> emission metric offers deeper insight into logistics efficiency. It measures the amount of CO₂e produced to move one tonne of freight over one kilometer.
              </p>
              <p>
                This Key Performance Indicator (KPI) helps businesses:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li><strong>Benchmark Performance:</strong> Compare the carbon efficiency of different routes, vehicles, or shipping strategies.</li>
                <li><strong>Identify Inefficiencies:</strong> Higher t-km values can indicate issues like under-utilized vehicle capacity (empty or partially loaded trips).</li>
                <li><strong>Drive Optimization:</strong> Setting targets to reduce kg CO₂e/t-km encourages better load planning and network optimization, leading to both cost savings and a lower carbon footprint.</li>
              </ul>
              <p>
                In our calculator, this value is provided when you input the optional "Load Weight". A lower number signifies greater carbon efficiency for your freight operations.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="h-5 w-5" />
              Assumptions and Data Handling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong>Distance Calculation:</strong> If trip distance is not provided in the uploaded data, it is estimated using the straight-line (Haversine) distance between the source and destination pincodes, plus a circuity factor of 25% to account for actual road networks.
              </li>
              <li>
                <strong>Vehicle Data:</strong> If vehicle category or fuel type is missing for a given vehicle number, the system applies a default emission factor corresponding to a Medium Goods Vehicle (MGV).
              </li>
              <li>
                <strong>Data Completeness:</strong> The accuracy of the report is directly dependent on the quality and completeness of the uploaded trip and vehicle data.
              </li>
              <li>
                <strong>Scope:</strong> The calculation only covers tank-to-wheel emissions from fuel combustion during transit and does not include well-to-tank emissions, vehicle manufacturing, or other lifecycle emissions.
              </li>
            </ul>
             <Alert variant="destructive" className="mt-6">
                <HelpCircle className="h-4 w-4" />
                <AlertTitle>For Demonstration Purposes Only</AlertTitle>
                <AlertDescription>
                  The results from this calculator are estimates and should be used for informational and demonstrative purposes. For official GHG reporting, a more detailed, company-specific analysis is required.
                </AlertDescription>
              </Alert>
          </CardContent>
        </Card>

      </main>

       <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} Gocarbontracker Tools. All rights reserved.
      </footer>
    </div>
  );
};

export default Methodology;
