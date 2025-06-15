
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { ReportRow } from '@/hooks/useReportGenerator';
import IndiaMap from './IndiaMap';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TripDetailModalProps {
  tripData: ReportRow | null;
  onClose: () => void;
  pincodeDb: Record<string, { name: string; x: number; y: number }> | null;
}

const TripDetailModal = ({ tripData, onClose, pincodeDb }: TripDetailModalProps) => {
  if (!tripData) return null;

  const details = [
    { label: 'Physical Trip ID', value: tripData['Physical Trip ID'] },
    { label: 'Vehicle No.', value: tripData['Vehicle No.'] },
    { label: 'Vehicle Category', value: tripData['Vehicle Category'] },
    { label: 'Running Distance', value: `${tripData['Running Distance (km)'].toFixed(2)} km` },
    { label: 'Carbon Emissions', value: `${tripData['Calculated Carbon Emissions (kg CO₂e)'].toFixed(2)} kg CO₂e` },
    { label: 'Trip Completed At', value: tripData['Representative Trip Completed At'] },
  ];

  return (
    <Dialog open={!!tripData} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row justify-between items-center pb-4">
          <DialogTitle className="text-xl font-bold">Trip Details: {tripData['Physical Trip ID']}</DialogTitle>
           <DialogClose asChild>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-auto p-1">
          {/* Left Side: Trip Details */}
          <div className="space-y-4 pr-4 md:border-r">
             <div className="space-y-2">
                <h3 className="font-semibold text-lg">Route</h3>
                <p><span className="font-medium">From:</span> {tripData['Source']}</p>
                <p><span className="font-medium">To:</span> {tripData['Destination']}</p>
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold text-lg">Summary</h3>
                 {details.map(detail => (
                  <div key={detail.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{detail.label}:</span>
                    <span className="font-mono text-right">{String(detail.value)}</span>
                  </div>
                ))}
            </div>
          </div>
          
          {/* Right Side: Map Visualization */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-lg mb-2">Route Visualization</h3>
            <div className="flex-1 bg-gray-100 rounded-lg">
                <IndiaMap
                    origin={tripData['Source']}
                    destination={tripData['Destination']}
                    pincodeDb={pincodeDb}
                />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TripDetailModal;
