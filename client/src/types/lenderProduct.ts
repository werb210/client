// Import shared types to prevent drift between Staff & Client
export type { LenderProduct, Lender, fmtRange } from '../../../shared/types/lenderProduct';

// Re-export for backward compatibility
export { fetchLenderProducts } from '../../../shared/types/lenderProduct';