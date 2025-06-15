
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { EMISSION_FACTORS, FUEL_EMISSION_FACTORS, VehicleType, FuelType } from '@/lib/constants';
import { MapPin, Route, Leaf, Fuel, Weight, Repeat, TestTube2, Waypoints } from 'lucide-react';

const formSchema = z.discriminatedUnion("calculationMode", [
  z.object({
    calculationMode: z.literal("distance"),
    origin: z.string().min(1, { message: "Origin is required." }),
    destination: z.string().min(1, { message: "Destination is required." }),
    vehicleType: z.enum(['LGV', 'MGV', 'HGV'], { required_error: "Please select a vehicle type." }),
    loadWeight: z.coerce.number().positive({ message: "Weight must be positive." }).optional(),
    isRoundTrip: z.boolean().default(false),
  }),
  z.object({
    calculationMode: z.literal("fuel"),
    fuelConsumed: z.coerce.number().positive({ message: "Must be a positive number." }),
    fuelType: z.enum(['Diesel', 'CNG'], { required_error: "Please select a fuel type." }),
  }),
]);

type FormValues = z.infer<typeof formSchema>;
type Result = {
  emissions: number;
  distance?: number;
  emissionsPerTonneKm?: number;
  calculationMode: 'distance' | 'fuel';
};

const ResultDisplay = ({ emissions, distance, emissionsPerTonneKm, calculationMode }: Result) => (
  <div className="mt-6 p-6 bg-slate-100 rounded-lg animate-fade-in space-y-4">
    <div className="text-center">
      <p className="font-poppins text-3xl font-bold text-eco-green-dark">{emissions.toFixed(2)} kg CO₂e</p>
      <p className="text-sm text-muted-foreground">Total Emissions</p>
    </div>
    <div className="flex justify-between items-start pt-4 border-t text-center w-full">
      {calculationMode === 'distance' && typeof distance !== 'undefined' && (
        <div className="flex-1">
          <p className="font-bold text-lg">{distance.toFixed(0)} km</p>
          <p className="text-sm text-muted-foreground">Estimated Distance</p>
        </div>
      )}
      {typeof emissionsPerTonneKm !== 'undefined' && (
         <div className="flex-1">
          <p className="font-bold text-lg">{emissionsPerTonneKm.toFixed(4)}</p>
          <p className="text-sm text-muted-foreground">kg CO₂e/t-km</p>
        </div>
      )}
      {calculationMode === 'distance' && (
        <div className="flex-1">
          <div className="w-24 h-16 bg-slate-200 rounded-md flex items-center justify-center mx-auto">
            <Waypoints className="h-8 w-8 text-slate-400"/>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Route Visualization</p>
        </div>
      )}
    </div>
  </div>
);

const SimpleTripCalculator = () => {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calculationMode: 'distance',
      origin: '',
      destination: '',
      isRoundTrip: false,
    },
  });

  const calculationMode = form.watch('calculationMode');
  const fuelType = form.watch('fuelType' as 'fuelType');

  // Simulate an API call to get distance
  const getSimulatedDistance = () => Math.floor(Math.random() * (1000 - 50)) + 50;

  const onSubmit = (values: FormValues) => {
    setResult(null);
    if (values.calculationMode === 'distance') {
      let distance = getSimulatedDistance();
      if (values.isRoundTrip) {
        distance *= 2;
      }
      const emissions = distance * EMISSION_FACTORS[values.vehicleType];
      let emissionsPerTonneKm;
      if (values.loadWeight && values.loadWeight > 0) {
        emissionsPerTonneKm = emissions / (distance * values.loadWeight);
      }
      setResult({ distance, emissions, emissionsPerTonneKm, calculationMode: 'distance' });
    } else { // 'fuel' mode
      const emissions = values.fuelConsumed * FUEL_EMISSION_FACTORS[values.fuelType];
      setResult({ emissions, calculationMode: 'fuel' });
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
                    <FormItem><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><FormControl><Input placeholder="Origin Location" className="pl-10" {...field} /></FormControl></div><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="destination" render={({ field }) => (
                    <FormItem><div className="relative"><Route className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><FormControl><Input placeholder="Destination Location" className="pl-10" {...field} /></FormControl></div><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="vehicleType" render={({ field }) => (
                     <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Vehicle Type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="LGV">Light Goods Vehicle (LGV)</SelectItem><SelectItem value="MGV">Medium Goods Vehicle (MGV)</SelectItem><SelectItem value="HGV">Heavy Goods Vehicle (HGV)</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="loadWeight" render={({ field }) => (
                    <FormItem><div className="relative"><Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><FormControl><Input type="number" placeholder="Load Weight (tonnes) (Optional)" className="pl-10" {...field} onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)} /></FormControl></div><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="isRoundTrip" render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm"><Repeat className="h-5 w-5 text-muted-foreground" /><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><Label>Include empty return journey?</Label></div></FormItem>
                  )} />
                </div>
              )}

              {calculationMode === 'fuel' && (
                <div className="space-y-4 animate-fade-in">
                  <FormField control={form.control} name="fuelType" render={({ field }) => (
                     <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Fuel Type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Diesel">Diesel</SelectItem><SelectItem value="CNG">CNG</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="fuelConsumed" render={({ field }) => (
                    <FormItem><FormLabel>Fuel Consumed</FormLabel><div className="relative"><TestTube2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><FormControl><Input type="number" placeholder={`Amount in ${fuelType === 'CNG' ? 'kg' : 'liters'}`} className="pl-10" {...field} onChange={event => field.onChange(+event.target.value)} /></FormControl></div><FormMessage /></FormItem>
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
