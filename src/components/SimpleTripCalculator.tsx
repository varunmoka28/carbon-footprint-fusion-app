
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { VEHICLE_CATEGORIES, FUEL_EMISSION_FACTORS, VehicleId } from '@/lib/constants';
import { MapPin, Route, Leaf, Fuel, Weight, Repeat, TestTube2, Waypoints } from 'lucide-react';

import { usePincodeData } from '@/hooks/usePincodeData';
import { calculateDistance } from '@/lib/distance';
import ResultDisplay, { Result } from './ResultDisplay';
import { resolveLocation } from '@/lib/locationUtils';

const vehicleIds = Object.keys(VEHICLE_CATEGORIES) as [VehicleId, ...VehicleId[]];

const formSchema = z.discriminatedUnion("calculationMode", [
  z.object({
    calculationMode: z.literal("distance"),
    origin: z.string().min(3, { message: "Enter a city name or 6-digit pincode." }),
    destination: z.string().min(3, { message: "Enter a city name or 6-digit pincode." }),
    vehicleType: z.enum(vehicleIds, { required_error: "Please select a vehicle type." }),
    loadWeight: z.coerce.number().positive({ message: "Weight must be positive." }).optional(),
    isRoundTrip: z.boolean().default(false),
  }),
  z.object({
    calculationMode: z.literal("fuel"),
    fuelConsumed: z.coerce.number().positive({ message: "Must be a positive number." }),
    fuelType: z.enum(['Diesel', 'CNG', 'Petrol', 'Electricity'], { required_error: "Please select a fuel type." }),
  }),
]).refine(data => {
  // If we are in distance mode and there's a load weight and a vehicle type, check if the weight is within the vehicle's max payload.
  if (data.calculationMode === 'distance' && data.loadWeight && data.vehicleType) {
    return data.loadWeight <= VEHICLE_CATEGORIES[data.vehicleType].maxPayload;
  }
  // Otherwise, validation passes.
  return true;
}, {
  message: "Load weight exceeds the selected vehicle's maximum payload.",
  path: ["loadWeight"], // Apply the error message to the loadWeight field
});

type FormValues = z.infer<typeof formSchema>;

const SimpleTripCalculator = () => {
  const [result, setResult] = useState<Result | null>(null);
  const { pincodeDb } = usePincodeData();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calculationMode: 'distance',
      origin: '',
      destination: '',
      vehicleType: 'LCV', // A sensible default
      isRoundTrip: false,
    },
  });

  const calculationMode = form.watch('calculationMode');
  const fuelType = form.watch('fuelType' as 'fuelType');
  const selectedVehicleId = form.watch('vehicleType' as 'vehicleType'); // Watch for changes
  const selectedVehicle = selectedVehicleId ? VEHICLE_CATEGORIES[selectedVehicleId] : null;

  const onSubmit = (values: FormValues) => {
    setResult(null);
    if (values.calculationMode === 'distance') {
      if (!pincodeDb) {
        toast.error("Pincode data is still loading. Please try again in a moment.");
        return;
      }
      
      const originData = resolveLocation(values.origin, pincodeDb);
      const destData = resolveLocation(values.destination, pincodeDb);

      if (!originData) {
        toast.error("Could not find origin location. Please check the spelling or pincode.");
        form.setError("origin", { message: "Invalid location" });
        return;
      }
      if (!destData) {
        toast.error("Could not find destination location. Please check the spelling or pincode.");
        form.setError("destination", { message: "Invalid location" });
        return;
      }
      
      let distance = calculateDistance(originData.y, originData.x, destData.y, destData.x);
      
      if (values.isRoundTrip) {
        distance *= 2;
      }
      
      const vehicle = VEHICLE_CATEGORIES[values.vehicleType];
      const emissions = distance * vehicle.emissionFactor;
      let emissionsPerTonneKm;
      if (values.loadWeight && values.loadWeight > 0) {
        emissionsPerTonneKm = emissions / (distance * values.loadWeight);
      }
      setResult({
        distance,
        emissions,
        emissionsPerTonneKm,
        calculationMode: 'distance',
        origin: originData.resolvedName,
        destination: destData.resolvedName,
        emissionFactorDetails: {
          factor: vehicle.emissionFactor,
          source: vehicle.source,
          sourceUrl: vehicle.sourceUrl,
          unit: 'km'
        }
      });
    } else { // 'fuel' mode
      const fuelData = FUEL_EMISSION_FACTORS[values.fuelType];
      const emissions = values.fuelConsumed * fuelData.factor;
      setResult({
        emissions,
        calculationMode: 'fuel',
        emissionFactorDetails: {
          factor: fuelData.factor,
          source: fuelData.source,
          sourceUrl: fuelData.sourceUrl,
          unit: fuelData.unit,
        }
      });
    }
    toast.success("Calculation successful!");
  };

  const onInvalid = (errors: any) => {
    console.error(errors);
    toast.error("Please review the form for errors.");
  }

  return (
    <div className="flex justify-center items-start py-12 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="font-poppins text-2xl text-center flex items-center justify-center gap-2">
            <Leaf className="text-eco-green" /> Logistics Emission Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
              <FormField
                control={form.control}
                name="calculationMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calculation Method</FormLabel>
                    <FormControl>
                      <ToggleGroup
                        type="single"
                        defaultValue={field.value}
                        onValueChange={(value) => {
                          if (value) {
                            field.onChange(value);
                            setResult(null);
                            form.reset({ calculationMode: value as 'distance' | 'fuel' });
                          }
                        }}
                        className="grid grid-cols-2"
                      >
                        <ToggleGroupItem value="distance" aria-label="Calculate by distance">
                          <Waypoints className="mr-2 h-4 w-4" /> By Distance
                        </ToggleGroupItem>
                        <ToggleGroupItem value="fuel" aria-label="Calculate by fuel">
                          <Fuel className="mr-2 h-4 w-4" /> By Fuel
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              {calculationMode === 'distance' && (
                <div className="space-y-4 animate-fade-in">
                  <FormField control={form.control} name="origin" render={({ field }) => (
                    <FormItem><FormLabel>Origin</FormLabel><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><FormControl><Input placeholder="e.g. Mumbai or 400001" className="pl-10" {...field} /></FormControl></div><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="destination" render={({ field }) => (
                    <FormItem><FormLabel>Destination</FormLabel><div className="relative"><Route className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><FormControl><Input placeholder="e.g. Delhi or 110001" className="pl-10" {...field} /></FormControl></div><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="vehicleType" render={({ field }) => (
                     <FormItem>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                         <FormControl><SelectTrigger><SelectValue placeholder="Select Vehicle Type" /></SelectTrigger></FormControl>
                         <SelectContent>
                           {Object.entries(VEHICLE_CATEGORIES).map(([id, { name, gvw }]) => (
                             <SelectItem key={id} value={id}>{name} ({gvw})</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                       {selectedVehicle && (
                         <FormDescription>
                           Max Payload: {selectedVehicle.maxPayload} tonnes.
                         </FormDescription>
                       )}
                       <FormMessage />
                     </FormItem>
                  )} />
                   <FormField control={form.control} name="loadWeight" render={({ field }) => (
                    <FormItem><div className="relative"><Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><FormControl><Input type="number" placeholder="Load Weight (tonnes) (Optional)" className="pl-10" {...field} value={field.value ?? ''} onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)} /></FormControl></div><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="isRoundTrip" render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm"><Repeat className="h-5 w-5 text-muted-foreground" /><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><Label>Include empty return journey?</Label></div></FormItem>
                  )} />
                </div>
              )}

              {calculationMode === 'fuel' && (
                <div className="space-y-4 animate-fade-in">
                  <FormField control={form.control} name="fuelType" render={({ field }) => (
                     <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Fuel Type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Diesel">Diesel</SelectItem><SelectItem value="CNG">CNG</SelectItem><SelectItem value="Petrol">Petrol</SelectItem><SelectItem value="Electricity">Electricity</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="fuelConsumed" render={({ field }) => (
                    <FormItem><FormLabel>Fuel Consumed</FormLabel><div className="relative"><TestTube2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><FormControl><Input type="number" placeholder={`Amount in ${fuelType ? FUEL_EMISSION_FACTORS[fuelType].unit : 'units'}`} className="pl-10" {...field} onChange={event => field.onChange(+event.target.value)} /></FormControl></div><FormMessage /></FormItem>
                  )} />
                </div>
              )}

              <Button type="submit" className="w-full bg-eco-green hover:bg-eco-green-dark text-white font-bold py-3 text-base" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Calculating..." : "Calculate Emissions"}
              </Button>
            </form>
          </Form>

          {result && <ResultDisplay {...result} />}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleTripCalculator;
