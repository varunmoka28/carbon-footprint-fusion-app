import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Route, Weight, FileWarning, HelpCircle, TrendingDown, Scale, ShieldCheck, Layers3, Info } from 'lucide-react';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { VEHICLE_CATEGORIES, FUEL_EMISSION_FACTORS } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';

const Methodology = () => {
  const frameworks = [
    { name: 'GHG Protocol', description: 'The global standard for corporate GHG accounting. Our methodology is designed to be fully compliant with its principles for Scope 1, 2, and 3 calculations.' },
    { name: 'GLEC Framework', description: 'Specifically designed for calculating GHG emissions across the logistics supply chain. We use GLEC-aligned factors and methods for freight transport.' },
    { name: 'ISO 14064-1', description: 'An international standard that specifies principles and requirements for designing, developing, and reporting GHG inventories at the organization level.' },
    { name: 'IPCC Guidelines', description: 'Provides the scientific basis for our fuel emission factors, ensuring they are derived from internationally recognized, peer-reviewed data.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold hover:text-eco-green transition-colors">
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 space-y-8">
        <div className="text-center space-y-2">
          <BookOpen className="mx-auto h-12 w-12 text-eco-green" />
          <h1 className="text-4xl font-bold">Calculation Methodology</h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            A transparent guide to how we calculate carbon emissions, aligned with global standards for corporate reporting.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-eco-green" />
              Guiding Principles & Frameworks
            </CardTitle>
            <CardDescription>
              Our methodology is built on established global standards to ensure accuracy, consistency, and transparency.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Core Accounting Principles</h3>
              <p className="text-muted-foreground mb-4">
                We adhere to the five core principles of GHG accounting as defined by the GHG Protocol:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <li className="bg-muted p-3 rounded-lg"><strong className="font-semibold text-foreground">Relevance:</strong> Ensure the GHG inventory appropriately reflects the emissions of the company and serves the decision-making needs of users.</li>
                <li className="bg-muted p-3 rounded-lg"><strong className="font-semibold text-foreground">Completeness:</strong> Account for all GHG emission sources and activities within the chosen inventory boundary.</li>
                <li className="bg-muted p-3 rounded-lg"><strong className="font-semibold text-foreground">Consistency:</strong> Use consistent methodologies to allow for meaningful comparisons of emissions over time.</li>
                <li className="bg-muted p-3 rounded-lg"><strong className="font-semibold text-foreground">Transparency:</strong> Disclose all relevant information, assumptions, and methodologies to allow for external review.</li>
                <li className="bg-muted p-3 rounded-lg"><strong className="font-semibold text-foreground">Accuracy:</strong> Ensure that the quantification of GHG emissions is systemically neither over nor under actual emissions.</li>
              </ul>
            </div>
             <Separator />
            <div>
              <h3 className="font-semibold text-lg mb-2">Key Regulatory Frameworks</h3>
              <p className="text-muted-foreground mb-4">Our calculations are aligned with the following key industry frameworks, making your data suitable for various reporting needs like CDP, SBTi, and TCFD.</p>
              <div className="space-y-4">
                {frameworks.map((framework) => (
                  <div key={framework.name} className="flex items-start gap-4">
                    <Scale className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">{framework.name}</h4>
                      <p className="text-muted-foreground text-sm">{framework.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers3 className="h-6 w-6 text-eco-green" />
              Emission Calculation Models
            </CardTitle>
            <CardDescription>
              We provide two robust models to estimate emissions, accommodating different levels of data availability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h3 className="font-bold text-xl mb-2 text-foreground">Model 1: Distance-Based Emissions</h3>
              <p className="text-muted-foreground mb-4">This model is ideal when trip distance and vehicle type are known, but specific fuel consumption data is unavailable. It is the most common method for initial assessments.</p>
              <div className="bg-muted p-4 rounded-lg text-center font-mono my-4">
                Total Emissions (kg CO₂e) = Distance (km) × Emission Factor (kg CO₂e/km)
              </div>
              <h4 className="font-semibold text-lg mb-2">Vehicle Emission Factors</h4>
              <p className="text-muted-foreground mb-4">
                We use standardized, GLEC-compliant emission factors adapted for common Indian vehicle types.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle Category</TableHead>
                    <TableHead>Gross Vehicle Weight (GVW)</TableHead>
                    <TableHead>Max Payload</TableHead>
                    <TableHead>Examples</TableHead>
                    <TableHead className="text-right">Emission Factor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(VEHICLE_CATEGORIES).map((vehicle) => (
                    <TableRow key={vehicle.name}>
                      <TableCell className="font-medium">{vehicle.name}</TableCell>
                      <TableCell className="text-muted-foreground">{vehicle.gvw}</TableCell>
                      <TableCell className="text-muted-foreground">{vehicle.maxPayload} t</TableCell>
                       <TableCell className="text-muted-foreground text-xs">{vehicle.examples || 'N/A'}</TableCell>
                      <TableCell className="text-right font-mono">{vehicle.emissionFactor.toFixed(2)} kg CO₂e/km</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator />

            <div>
              <h3 className="font-bold text-xl mb-2 text-foreground">Model 2: Fuel-Based Emissions</h3>
              <p className="text-muted-foreground mb-4">This model provides higher accuracy and is preferred when direct fuel consumption data is available. It follows the IPCC's recommended approach.</p>
              <div className="bg-muted p-4 rounded-lg text-center font-mono my-4">
                Total Emissions (kg CO₂e) = Fuel Consumed (liters or kg) × Fuel Emission Factor
              </div>
               <h4 className="font-semibold text-lg mb-2">Fuel Emission Factors</h4>
              <p className="text-muted-foreground mb-4">
                These factors represent the CO₂e emissions produced per unit of fuel, based on IPCC 2006 Guidelines.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fuel Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Emission Factor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(FUEL_EMISSION_FACTORS).map(([fuel, data]) => (
                     <TableRow key={fuel}>
                      <TableCell className="font-medium">{fuel}</TableCell>
                      <TableCell className="text-muted-foreground">{data.source}</TableCell>
                      <TableCell className="text-right font-mono">{data.factor.toFixed(2)} kg CO₂e / {data.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
              <Alert className="mt-4 border-blue-200 bg-blue-50 text-blue-800">
                <AlertTitle className="font-semibold">How Load Weight is Used</AlertTitle>
                <AlertDescription>
                  In our model, "Load Weight" does not change the "Total Emissions" calculation, which is based on distance and vehicle type. Instead, load weight is essential for calculating freight efficiency (kg CO₂e/t-km). A heavier load on the same trip results in a lower (better) tonne-kilometer value, indicating a more efficient use of vehicle capacity.
                </AlertDescription>
              </Alert>
              <p>
                In our calculator, this value is provided when you input the optional "Load Weight". A lower number signifies greater carbon efficiency for your freight operations.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-6 w-6 text-eco-green" />
              Assumptions & Scope of Emissions
            </CardTitle>
            <CardDescription>Understanding the boundaries and key assumptions in our calculations is crucial for correct interpretation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Scope of Emissions</h3>
              <p className="text-muted-foreground mb-2">Our calculations primarily cover:</p>
               <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Scope 3, Category 4 & 9:</strong> Upstream and downstream transportation and distribution. This covers third-party logistics (3PL) movements.</li>
                <li><strong>Tank-to-Wheel (TTW) Emissions:</strong> We calculate emissions from the combustion of fuel in the vehicle's engine. This does not include "Well-to-Tank" (WTT) emissions from fuel extraction, processing, and delivery, which can add 15-25% to the total.</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-lg mb-2">Key Assumptions</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong>Distance Calculation:</strong> Distance is estimated using the straight-line (Haversine) distance between locations, plus a circuity factor of 25% to approximate actual road networks. For higher accuracy, use specific route distances from mapping services.
              </li>
              <li>
                <strong>Data Quality:</strong> The accuracy of the output is directly dependent on the quality of input data. Primary data (e.g., actual fuel consumed) will always yield more accurate results than secondary data (e.g., estimates based on vehicle type and distance).
              </li>
              <li>
                <strong>Default Values:</strong> If a vehicle category is not specified, a default factor for a Light Commercial Vehicle (LCV) is used as a conservative estimate.
              </li>
              <li>
                <strong>Data Completeness:</strong> The accuracy of the report is directly dependent on the quality of the input data.
              </li>
            </ul>
            </div>
             <Alert variant="destructive" className="mt-6">
                <HelpCircle className="h-4 w-4" />
                <AlertTitle>For Informational Purposes Only</AlertTitle>
                <AlertDescription>
                  The results from this calculator are powerful estimates for internal strategy, hotspot analysis, and initial assessments. For official, audited GHG reporting or compliance, a more detailed, company-specific analysis conducted with a certified expert is required.
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
