
import { PincodeDB, PincodeData } from '@/hooks/usePincodeData';

/**
 * Resolves a location string (pincode or name) to pincode data.
 * @param locationInput The user's input string.
 * @param pincodeDb The database of pincodes.
 * @returns PincodeData object if found, otherwise null.
 */
export function resolveLocation(locationInput: string, pincodeDb: PincodeDB): (PincodeData & { resolvedName: string }) | null {
  if (!locationInput || !pincodeDb) return null;

  // 1. Try to extract a 6-digit pincode
  const pincodeMatch = locationInput.match(/\b(\d{6})\b/);
  if (pincodeMatch) {
    const pincode = pincodeMatch[1];
    if (pincodeDb[pincode]) {
      const data = pincodeDb[pincode];
      return { ...data, resolvedName: `${data.name}, ${pincode}` };
    }
  }

  // 2. If no pincode, search by name (case-insensitive)
  const searchName = locationInput.toLowerCase().trim();
  for (const pincode in pincodeDb) {
    const locationData = pincodeDb[pincode];
    const locationName = locationData.name.toLowerCase();
    if (locationName.includes(searchName)) {
      return { ...locationData, resolvedName: `${locationData.name}, ${pincode}` }; // Return with pincode for clarity
    }
  }

  // 3. No match found
  return null;
}
