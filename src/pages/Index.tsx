
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CarbonIQDashboard from '@/components/CarbonIQDashboard';
import SimpleTripCalculator from '@/components/SimpleTripCalculator';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { BarChart2, Calculator, Leaf, BookOpen } from 'lucide-react';

type AppMode = 'dashboard' | 'calculator';

const Index = () => {
  const [appMode, setAppMode] = useState<AppMode>('dashboard');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Leaf className="h-8 w-8 text-eco-green" />
            <div>
              <h1 className="text-xl md:text-2xl font-poppins font-bold text-slate-800">
                Gocarbontracker <span className="text-eco-green">Tools</span>
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">A tool for Last Mile Carbon Emissions</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
            <Link to="/methodology">
              <Button variant="outline" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Methodology
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto">
        {appMode === 'dashboard' ? <CarbonIQDashboard /> : <SimpleTripCalculator />}
      </main>
      
      <footer className="text-center p-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Gocarbontracker Tools. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
