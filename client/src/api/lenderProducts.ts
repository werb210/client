/**
 * ❌ DISABLED: Lender products API integration removed
 * All lender product fetching is disabled - client only polls application status
 */

export async function fetchLenderProducts(): Promise<never[]> {
  throw new Error("Lender products API integration disabled - use application status polling instead");
}

export async function getLenderProducts(): Promise<never[]> {
  throw new Error("Lender products API integration disabled - use application status polling instead");
}

export async function getLenderCategories(): Promise<never[]> {
  throw new Error("Lender categories API integration disabled - use application status polling instead");
}

// All lender product related API calls are disabled