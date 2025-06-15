
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LogisticsEmissionCalculator from '@/components/LogisticsEmissionCalculator';
import B2BLogisticsDashboard from '@/components/B2BLogisticsDashboard';
import ToolCard from '@/components/ToolCard';
import { Button } from '@/components/ui/button';
import { Leaf, BookOpen, BarChart2, Calculator, Users, ArrowLeft } from 'lucide-react';

type ActiveTool = 'home' | 'b2bDashboard' | 'logisticsCalculator';

const Index = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>('home');

  const renderContent = () => {
    switch (activeTool) {
      case 'b2bDashboard':
        return <B2BLogisticsDashboard />;
      case 'logisticsCalculator':
        return <LogisticsEmissionCalculator />;
      case 'home':
      default:
        return (
          <div className="py-12 text-center animate-fade-in">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              Your Suite of Sustainability Tools
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Select a tool below to begin analyzing and reducing your carbon footprint.
            </p>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              <ToolCard
                title="Logistics Emission Calculator"
                description="Calculate carbon emissions for individual trips using distance or fuel consumption."
                icon={Calculator}
                onClick={() => setActiveTool('logisticsCalculator')}
              />
              <ToolCard
                title="B2B Logistics Dashboard"
                description="Analyze bulk transportation data from CSV uploads for comprehensive emissions reporting."
                icon={BarChart2}
                onClick={() => setActiveTool('b2bDashboard')}
              />
              <ToolCard
                title="Employee Commute Calculator"
                description="Calculate and track employee commuting emissions."
                icon={Users}
                onClick={() => {}}
                isComingSoon
              />
            </div>
          </div>
        );
    }
  };

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
          <nav className="flex items-center gap-4">
            {activeTool !== 'home' && (
              <Button variant="ghost" onClick={() => setActiveTool('home')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tools
              </Button>
            )}
            <Link to="/methodology">
              <Button variant="outline" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Methodology
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto">
        {renderContent()}
      </main>
      
      <footer className="text-center p-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Gocarbontracker Tools. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
