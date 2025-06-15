
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LogisticsEmissionCalculator from '@/components/LogisticsEmissionCalculator';
import B2BLogisticsDashboard from '@/components/B2BLogisticsDashboard';
import ToolCard from '@/components/ToolCard';
import { Button } from '@/components/ui/button';
import { Leaf, BookOpen, BarChart2, Calculator, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

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
          <>
            <section className="bg-dark-pine text-white animate-fade-in">
              <div className="container mx-auto text-center py-20 md:py-28">
                <h1 className="text-4xl md:text-6xl font-merriweather font-bold leading-tight">
                  Logistics & Supply Chain Carbon Accounting
                </h1>
                <p className="mt-4 text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-sans">
                  Select a tool below to calculate and analyze your Scope 3 transportation emissions.
                </p>
              </div>
            </section>
            <section className="py-16 sm:py-24 animate-fade-in" style={{animationDelay: '200ms'}}>
               <div className="container mx-auto">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                  <ToolCard
                    title="Logistics Emission Calculator"
                    description="Estimate emissions for individual freight shipments based on distance, fuel, and load weight."
                    icon={Calculator}
                    onClick={() => setActiveTool('logisticsCalculator')}
                  />
                  <ToolCard
                    title="B2B Logistics Dashboard"
                    description="Analyze bulk transportation data by uploading CSV files to calculate and visualize your comprehensive Scope 3 logistics footprint."
                    icon={BarChart2}
                    onClick={() => setActiveTool('b2bDashboard')}
                  />
                </div>
              </div>
            </section>
          </>
        );
    }
  };

  const isHomePage = activeTool === 'home';

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className={cn(
        "sticky top-0 z-20 transition-colors duration-300",
        isHomePage ? 'bg-dark-pine' : 'bg-background/80 backdrop-blur-md border-b'
      )}>
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Leaf className="h-8 w-8 text-eco-green" />
            <div>
              <h1 className={cn(
                "text-xl md:text-2xl font-merriweather font-bold",
                isHomePage ? 'text-white' : 'text-slate-800'
              )}>
                Gocarbontracker <span className="text-eco-green">Tools</span>
              </h1>
              <p className={cn(
                "text-xs hidden sm:block",
                isHomePage ? 'text-white/60' : 'text-muted-foreground'
              )}>Corporate Scope 3 Transportation Emissions Platform</p>
            </div>
          </div>
          <nav className="flex items-center gap-2 md:gap-4">
            {activeTool !== 'home' && (
              <Button variant="ghost" onClick={() => setActiveTool('home')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tools
              </Button>
            )}
            <Link to="/methodology">
              <Button variant="outline" className={cn(
                isHomePage && 'border-white/20 text-white hover:bg-white/10 hover:text-white'
              )}>
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Methodology</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      
      <main>
        {renderContent()}
      </main>
      
      <footer className="text-center p-4 text-sm text-muted-foreground bg-background">
        © {new Date().getFullYear()} Gocarbontracker Tools. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
