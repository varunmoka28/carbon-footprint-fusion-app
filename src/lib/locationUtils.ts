
import { LocationInfo } from '@/hooks/usePincodeData';

/**
 * Attempts to find a single, definitive location from a search string.
 * It prioritizes exact matches and only returns a result if it's unambiguous.
 * @param query The user's input string (e.g., "Mumbai", "400001", "Bandra, Mumbai").
 * @param locations The list of all possible locations.
 * @returns A single LocationInfo object if a confident match is found, otherwise null.
 */
export const resolveLocation = (query: string, locations: LocationInfo[]): LocationInfo | null => {
  if (!query || locations.length === 0) {
    return null;
  }

  const lowercasedQuery = query.toLowerCase().trim();

  // Prioritize an exact match on the full searchable string, which happens
  // when a user selects an item from the dropdown.
  const exactSearchableMatch = locations.find(loc => loc.searchableString === lowercasedQuery);
  if (exactSearchableMatch) {
    return exactSearchableMatch;
  }

  // Find all potential matches based on the user's input.
  const potentialMatches = locations.filter(location =>
    location.searchableString.includes(lowercasedQuery)
  );

  // If we find exactly one match, we can be confident it's the right one.
  if (potentialMatches.length === 1) {
    return potentialMatches[0];
  }
  
  // If there are zero or multiple matches, we can't be sure.
  // Returning null forces the user to be more specific.
  return null;
};
