
export type Vehicle = {
  name: string;
  emissionFactor: number; // kg CO2e/km
  maxPayload: number; // tonnes
  gvw: string; // Gross Vehicle Weight as a string for display
};

// A detailed list of common Indian market vehicle categories
export const VEHICLE_CATEGORIES = {
  '2W': { name: '2-Wheeler', emissionFactor: 0.05, maxPayload: 0.05, gvw: '< 0.5t' },
  '3W': { name: '3-Wheeler Auto', emissionFactor: 0.1, maxPayload: 0.5, gvw: '0.5t - 1t' },
  'MINI_TRUCK': { name: 'Mini Truck (Tata Ace)', emissionFactor: 0.22, maxPayload: 0.75, gvw: '1.5t' },
  'PICKUP': { name: 'Pickup Truck (Bolero)', emissionFactor: 0.30, maxPayload: 1.7, gvw: '3.5t' },
  'LCV': { name: 'Light Commercial Vehicle (Tata 407)', emissionFactor: 0.42, maxPayload: 4, gvw: '4t - 7.5t' },
  'MCV': { name: 'Medium Commercial Vehicle (10-wheeler)', emissionFactor: 0.8, maxPayload: 10, gvw: '10t - 16t' },
  'HCV': { name: 'Heavy Commercial Vehicle (12-wheeler)', emissionFactor: 1.26, maxPayload: 21, gvw: '31t' },
  'TRAILER_1': { name: 'Tractor Trailer (22-wheeler)', emissionFactor: 1.5, maxPayload: 35, gvw: '49t' },
} as const;

export type VehicleId = keyof typeof VEHICLE_CATEGORIES;

// Emission factors for fuels
export const FUEL_EMISSION_FACTORS = {
  'Diesel': 2.68,      // kg CO2e/liter
  'CNG': 2.75,         // kg CO2e/kg
  'Petrol': 2.31,      // kg CO2e/liter
  'Electricity': 0.75, // kg CO2e/kWh (Grid average)
};

export type FuelType = keyof typeof FUEL_EMISSION_FACTORS;
