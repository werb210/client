// Import shared types to prevent drift between Staff & Client
export type { LenderProduct, LenderCount } from '../../../shared/types/lenderProduct';

// Re-export for backward compatibility
export { fetchLenderProducts, formatCurrencyRange } from '../../../shared/types/lenderProduct';