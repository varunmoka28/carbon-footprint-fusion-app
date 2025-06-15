import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { VEHICLE_CATEGORIES, FUEL_EMISSION_FACTORS, VehicleId } from '@/lib/constants';
import { MapPin, Route, Leaf, Fuel, Weight, Repeat, TestTube2, Waypoints } from 'lucide-react';
import { Input } from '@/components/ui/input';

import { usePincodeData } from '@/hooks/usePincodeData';
import { calculateDistance } from '@/lib/distance';
import ResultDisplay, { Result } from './ResultDisplay';

const vehicleIds = Object.keys(VEHICLE_CATEGORIES) as [VehicleId, ...VehicleId[]];

const PincodeRegex = /^\d{6}$/;

const formSchema = z.discriminatedUnion("calculationMode", [
  z.object({
    calculationMode: z.literal("distance"),
    origin: z.string().regex(PincodeRegex, { message: "Must be a 6-digit pincode." }),
    destination: z.string().regex(PincodeRegex, { message: "Must be a 6-digit pincode." }),
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

const LogisticsEmissionCalculator = () => {
  const [result, setResult] = useState<Result | null>(null);
  const { locationMap, isLoading: isLocationDataLoading } = usePincodeData();
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
      const resolvedOrigin = locationMap.get(values.origin);
      if (!resolvedOrigin) {
        toast.error("Invalid Origin Pincode", { description: "This pincode could not be found in our database." });
        form.setError("origin", { message: "Invalid pincode." });
        return;
      }

      const resolvedDestination = locationMap.get(values.destination);
      if (!resolvedDestination) {
        toast.error("Invalid Destination Pincode", { description: "This pincode could not be found in our database." });
        form.setError("destination", { message: "Invalid pincode." });
        return;
      }
      
      let distance = calculateDistance(resolvedOrigin.y, resolvedOrigin.x, resolvedDestination.y, resolvedDestination.x);
      
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
        origin: `${resolvedOrigin.district}, ${resolvedOrigin.state} (${resolvedOrigin.pincode})`,
        destination: `${resolvedDestination.district}, ${resolvedDestination.state} (${resolvedDestination.pincode})`,
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

  const handleModeChange = (value: 'distance' | 'fuel') => {
    if (value) {
      form.reset({ calculationMode: value });
      setResult(null);
    }
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
                        onValueChange={(value) => handleModeChange(value as 'distance' | 'fuel')}
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
                    <FormItem>
                      <FormLabel>Origin Pincode</FormLabel>
                      <FormControl>
                         <div className="relative">
                           <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                           <Input
                              {...field}
                              placeholder="Enter 6-digit pincode..."
                              className="pl-10"
                              maxLength={6}
                              disabled={isLocationDataLoading}
                           />
                         </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="destination" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Pincode</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Route className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="Enter 6-digit pincode..."
                            className="pl-10"
                            maxLength={6}
                            disabled={isLocationDataLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
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

              <Button type="submit" className="w-full bg-eco-green hover:bg-eco-green-dark text-white font-bold py-3 text-base" disabled={form.formState.isSubmitting || isLocationDataLoading}>
                {isLocationDataLoading ? "Loading Location Data..." : form.formState.isSubmitting ? "Calculating..." : "Calculate Emissions"}
              </Button>
            </form>
          </Form>

          {result && <ResultDisplay {...result} />}
        </CardContent>
      </Card>
    </div>
  );
};

export default LogisticsEmissionCalculator;
