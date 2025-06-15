
// Emission factors in kg CO2e/km
export const EMISSION_FACTORS = {
  'LGV': 0.34, // Light Goods Vehicle
  'MGV': 0.42, // Medium Goods Vehicle
  'HGV': 1.26, // Heavy Goods Vehicle
  'UNKNOWN': 0.5, // A default fallback
};

export type VehicleType = keyof typeof EMISSION_FACTORS;
