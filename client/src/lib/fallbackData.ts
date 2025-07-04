/**
 * Fallback Lender Products Data
 * Provides basic product data when staff database is empty
 * This is ONLY used when staff API returns empty results
 */

export const FALLBACK_LENDER_PRODUCTS = [
  {
    id: 'fallback-term-loan-us',
    name: 'Business Term Loan',
    lenderName: 'Regional Business Bank',
    category: 'term_loan',
    country: 'US',
    minAmount: 25000,
    maxAmount: 500000,
    interestRateMin: 6.5,
    interestRateMax: 12.5,
    termMin: 12,
    termMax: 60,
    description: 'Traditional term loan for established businesses',
    lastSynced: Date.now()
  },
  {
    id: 'fallback-line-credit-us',
    name: 'Business Line of Credit',
    lenderName: 'Commercial Finance Corp',
    category: 'line_of_credit',
    country: 'US',
    minAmount: 10000,
    maxAmount: 250000,
    interestRateMin: 8.0,
    interestRateMax: 18.0,
    termMin: 12,
    termMax: 36,
    description: 'Flexible credit line for working capital',
    lastSynced: Date.now()
  },
  {
    id: 'fallback-equipment-us',
    name: 'Equipment Financing',
    lenderName: 'Equipment Capital LLC',
    category: 'equipment_financing',
    country: 'US',
    minAmount: 15000,
    maxAmount: 1000000,
    interestRateMin: 5.5,
    interestRateMax: 15.0,
    termMin: 24,
    termMax: 84,
    description: 'Financing for business equipment and machinery',
    lastSynced: Date.now()
  },
  {
    id: 'fallback-working-capital-ca',
    name: 'Working Capital Loan',
    lenderName: 'Canadian Business Finance',
    category: 'working_capital',
    country: 'CA',
    minAmount: 20000,
    maxAmount: 300000,
    interestRateMin: 7.0,
    interestRateMax: 14.0,
    termMin: 6,
    termMax: 48,
    description: 'Short-term working capital for Canadian businesses',
    lastSynced: Date.now()
  },
  {
    id: 'fallback-invoice-factoring-us',
    name: 'Invoice Factoring',
    lenderName: 'Factor Finance Solutions',
    category: 'invoice_factoring',
    country: 'US',
    minAmount: 5000,
    maxAmount: 100000,
    interestRateMin: 12.0,
    interestRateMax: 25.0,
    termMin: 1,
    termMax: 12,
    description: 'Immediate cash from outstanding invoices',
    lastSynced: Date.now()
  },
  {
    id: 'fallback-term-loan-ca',
    name: 'Small Business Term Loan',
    lenderName: 'Northern Capital Bank',
    category: 'term_loan',
    country: 'CA',
    minAmount: 30000,
    maxAmount: 400000,
    interestRateMin: 6.0,
    interestRateMax: 11.0,
    termMin: 12,
    termMax: 72,
    description: 'Term loan for Canadian small businesses',
    lastSynced: Date.now()
  }
];

export function useFallbackDataIfNeeded(staffProducts: any[]): boolean {
  // Only use fallback if staff API returns empty results
  return staffProducts.length === 0;
}

export function getFallbackProductCount(): number {
  return FALLBACK_LENDER_PRODUCTS.length;
}

export function getFallbackMessage(): string {
  return `Using ${FALLBACK_LENDER_PRODUCTS.length} fallback products while staff database is being populated. This ensures the application remains functional for testing and demonstration purposes.`;
}