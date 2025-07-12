/**
 * Location detection utilities
 * Provides automatic country detection based on user IP
 */

export type CountryCode = "CA" | "US" | null;

/**
 * Fetch user's country based on IP geolocation
 * Returns country code or null if detection fails
 */
export const fetchUserCountry = async (): Promise<CountryCode> => {
  // Production cache-only mode: Return null to bypass geolocation API calls
  return null;
};

/**
 * Convert country code to business location format
 */
export const countryCodeToBusinessLocation = (countryCode: CountryCode): string | null => {
  switch (countryCode) {
    case "CA":
      return "canada";
    case "US":
      return "united-states";
    default:
      return null;
  }
};

/**
 * Convert business location to display name
 */
export const businessLocationToDisplayName = (businessLocation: string): string => {
  switch (businessLocation) {
    case "canada":
      return "Canada";
    case "united-states":
      return "United States";
    default:
      return businessLocation;
  }
};