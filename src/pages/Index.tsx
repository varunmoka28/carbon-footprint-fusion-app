
import React, { useState } from 'react';
import CarbonIQDashboard from '@/components/CarbonIQDashboard';
import SimpleTripCalculator from '@/components/SimpleTripCalculator';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Calculator, Leaf } from 'lucide-react';

type AppMode = 'dashboard' | 'calculator';

const Index = () => {
  const [appMode, setAppMode] = useState<AppMode>('dashboard');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-eco-green" />
            <h1 className="text-xl md:text-2xl font-poppins font-bold text-slate-800">
              Carbon<span className="text-eco-green">IQ</span>
            </h1>
          </div>
          <Tabs value={appMode} onValueChange={(value) => setAppMode(value as AppMode)} className="w-auto">
            <TabsList>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Calculator
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>
      
      <main className="container mx-auto">
        {appMode === 'dashboard' ? <CarbonIQDashboard /> : <SimpleTripCalculator />}
      </main>

      <footer className="text-center p-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} CarbonIQ. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
