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
  try {
    // First try our own API route
    const response = await fetch("/api/user-country");
    if (response.ok) {
      const data = await response.json();
      const country = data.country;
      return country === "CA" || country === "US" ? country : null;
    }

    // Fallback to external service for development
    const fallbackResponse = await fetch("https://ipapi.co/country_code/", {
      timeout: 3000,
    } as RequestInit);
    
    if (fallbackResponse.ok) {
      const countryCode = await fallbackResponse.text();
      return countryCode === "CA" || countryCode === "US" ? countryCode : null;
    }

    return null;
  } catch (error) {
    console.log("Country detection failed, using manual selection:", error.message);
    return null;
  }
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