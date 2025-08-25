// ✅ Same-origin only - no external URLs from client
export const API_BASE_URL = ""; // ✅ Same-origin only

export const API_URL = "/api/applications"; // Always relative path

export const API_ENDPOINTS = {
  LENDER_PRODUCTS: "/api/lender-products",
  LENDERS: "/api/lenders", 
  HEALTH: "/api/health",
  APPLICATIONS: "/api/applications"
};

// Health check fallback
export async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.HEALTH}`);
    const { status } = await res.json();
    return status === "ok";
  } catch {
    return false;
  }
}

// Production API client with error handling
export async function fetchFromProduction(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);
    throw error;
  }
}