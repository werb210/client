/**
 * ❌ DISABLED: Lender products service removed
 * Replaced with application status polling
 */

export async function fetchLenderProducts(): Promise<never[]> {
  throw new Error("Lender products service disabled - use application status polling instead");
}