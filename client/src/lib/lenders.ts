// CLIENT APP: shared types, fetchers that match Staff API/view, and display helpers.
// Drop in a shared lib and import where needed.

// Re-export from shared types to maintain consistency
export type { LenderProduct, LenderCount } from '../../../shared/types/lenderProduct';
export { fetchLenderProducts, fetchLenderCounts, formatCurrencyRange } from '../../../shared/types/lenderProduct';