
export type Vehicle = {
  name: string;
  emissionFactor: number; // kg CO2e/km
  maxPayload: number; // tonnes
  gvw: string; // Gross Vehicle Weight as a string for display
  source: string;
  sourceUrl: string;
};

const GLEC_SOURCE = {
  source: "GLEC Framework, adapted for India",
  sourceUrl: "https://www.smartfreightcentre.org/en/glec-framework/"
};

// A detailed list of common Indian market vehicle categories
export const VEHICLE_CATEGORIES = {
  '2W': { name: '2-Wheeler', emissionFactor: 0.05, maxPayload: 0.05, gvw: '< 0.5t', ...GLEC_SOURCE },
  '3W': { name: '3-Wheeler Auto', emissionFactor: 0.1, maxPayload: 0.5, gvw: '0.5t - 1t', ...GLEC_SOURCE },
  'MINI_TRUCK': { name: 'Mini Truck (Tata Ace)', emissionFactor: 0.22, maxPayload: 0.75, gvw: '1.5t', ...GLEC_SOURCE },
  'PICKUP': { name: 'Pickup Truck (Bolero)', emissionFactor: 0.30, maxPayload: 1.7, gvw: '3.5t', ...GLEC_SOURCE },
  'LCV': { name: 'Light Commercial Vehicle (Tata 407)', emissionFactor: 0.42, maxPayload: 4, gvw: '4t - 7.5t', ...GLEC_SOURCE },
  'MCV': { name: 'Medium Commercial Vehicle (10-wheeler)', emissionFactor: 0.8, maxPayload: 10, gvw: '10t - 16t', ...GLEC_SOURCE },
  'HCV': { name: 'Heavy Commercial Vehicle (12-wheeler)', emissionFactor: 1.26, maxPayload: 21, gvw: '31t', ...GLEC_SOURCE },
  'TRAILER_1': { name: 'Tractor Trailer (22-wheeler)', emissionFactor: 1.5, maxPayload: 35, gvw: '49t', ...GLEC_SOURCE },
} as const;

export type VehicleId = keyof typeof VEHICLE_CATEGORIES;

export type VehicleType = VehicleId;

// Emission factors for fuels
export type FuelData = {
  factor: number;
  unit: string;
  source: string;
  sourceUrl: string;
};

const IPCC_SOURCE = {
  source: "IPCC 2006 Guidelines",
  sourceUrl: "https://www.ipcc-nggip.iges.or.jp/public/2006gl/"
};

export const FUEL_EMISSION_FACTORS = {
  'Diesel':      { factor: 2.68, unit: 'liter', ...IPCC_SOURCE },
  'CNG':         { factor: 2.75, unit: 'kg', ...IPCC_SOURCE },
  'Petrol':      { factor: 2.31, unit: 'liter', ...IPCC_SOURCE },
  'Electricity': { factor: 0.75, unit: 'kWh', source: "CEA India Report", sourceUrl: "https://cea.nic.in/wp-content/uploads/2020/11/co2_database_version_15_formatted_for_website.pdf" },
} as const;


export type FuelType = keyof typeof FUEL_EMISSION_FACTORS;
