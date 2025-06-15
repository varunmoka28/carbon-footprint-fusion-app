
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";

interface AiHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onDownloadTemplate: () => void;
  type: 'trips' | 'vehicles';
}

const tripsColumns = "Assignment_ID,Vehicle_Number,Source,Destination,Distance_KM,Date_Time,Load_Weight_Tons,Fuel_Consumed_Liters,Total_Halt_Time_Hours";
const vehiclesColumns = "Vehicle_Number,Vehicle_Type,Model,Fuel_Type,Gross_Vehicle_Weight_Tons,Year_Manufactured,Emission_Standard";

const AiHelperModal = ({ isOpen, onClose, onContinue, onDownloadTemplate, type }: AiHelperModalProps) => {
  const { toast } = useToast();
  const columns = type === 'trips' ? tripsColumns : vehiclesColumns;
  const promptText = `I have logistics data with columns [list your columns]. Please convert this to match the format: [${columns}]. Here's my data: [paste your data]`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(promptText);
    toast({
      title: 'Prompt Copied!',
      description: 'The sample AI prompt has been copied to your clipboard.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span role="img" aria-label="robot">🤖</span> Need Help Formatting Your Data?
          </DialogTitle>
          <DialogDescription>
            If you have data in different formats, AI can help you convert it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-semibold mb-2 text-sm">Sample AI Prompt:</h4>
            <div className="relative p-3 bg-slate-100 rounded-md text-xs text-slate-700">
              <p>{promptText}</p>
              <Button variant="outline" size="sm" className="absolute top-2 right-2 h-7" onClick={copyToClipboard}>
                Copy
              </Button>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-sm">Recommended AI Tools:</h4>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">ChatGPT</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Claude</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Gemini</span>
              <span className="bg-sky-100 text-sky-800 px-2 py-1 rounded-full text-xs">Copilot</span>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between gap-2 mt-2">
           <Button type="button" variant="outline" onClick={onDownloadTemplate}>
            Download Template Instead
          </Button>
          <Button type="button" onClick={onContinue}>
            Continue with Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AiHelperModal;
