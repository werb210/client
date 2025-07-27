/**
 * Mock Lender Products for Development Testing
 * This data simulates the structure expected from the staff backend
 */

export const mockLenderProducts = [
  // Canadian Working Capital Products
  {
    id: 'advance-funds-wc-001',
    name: 'Working Capital Loan',
    lenderName: 'Advance Funds Network',
    category: 'Working Capital',
    country: 'Canada',
    amount_min: 15000,
    amount_max: 800000,
    useCases: ['Working Capital', 'Business Expansion', 'Inventory'],
    description: 'Flexible working capital for Canadian businesses'
  },
  {
    id: 'accord-wc-002',
    name: 'Business Working Capital',
    lenderName: 'Accord Financial',
    category: 'Working Capital', 
    country: 'Canada',
    amount_min: 25000,
    amount_max: 500000,
    useCases: ['Working Capital', 'Cash Flow'],
    description: 'Working capital solutions for established businesses'
  },

  // Canadian Term Loans
  {
    id: 'bdc-term-001',
    name: 'Growth Capital Term Loan',
    lenderName: 'BDC Capital',
    category: 'Term Loan',
    country: 'Canada', 
    amount_min: 50000,
    amount_max: 2000000,
    useCases: ['Business Expansion', 'Equipment Purchase', 'Real Estate'],
    description: 'Long-term financing for Canadian businesses'
  },
  {
    id: 'export-term-002', 
    name: 'Small Business Term Loan',
    lenderName: 'Export Development Canada',
    category: 'Term Loan',
    country: 'Canada',
    amount_min: 25000,
    amount_max: 1000000,
    useCases: ['Working Capital', 'Equipment', 'Expansion'],
    description: 'Term loans for export-oriented businesses'
  },

  // Canadian Equipment Financing
  {
    id: 'canadian-equip-001',
    name: 'Equipment Finance Solution',
    lenderName: 'Canadian Equipment Finance',
    category: 'Equipment Financing',
    country: 'Canada',
    amount_min: 10000,
    amount_max: 750000,
    useCases: ['Equipment Purchase', 'Vehicle Financing'],
    description: 'Equipment financing for all industries'
  },
  {
    id: 'roynat-equip-002',
    name: 'Equipment Term Loan',
    lenderName: 'Roynat Capital',
    category: 'Equipment Financing', 
    country: 'Canada',
    amount_min: 20000,
    amount_max: 1500000,
    useCases: ['Equipment Purchase', 'Technology Upgrade'],
    description: 'Competitive equipment financing solutions'
  },

  // Canadian Line of Credit
  {
    id: 'accord-loc-001',
    name: 'Business Line of Credit',
    lenderName: 'Accord Financial',
    category: 'Business Line of Credit',
    country: 'Canada',
    amount_min: 50000,
    amount_max: 2000000,
    useCases: ['Working Capital', 'Cash Flow Management'],
    description: 'Flexible line of credit for ongoing needs'
  },
  {
    id: 'merchant-loc-002',
    name: 'Merchant Line of Credit',
    lenderName: 'Merchant Growth Capital',
    category: 'Business Line of Credit',
    country: 'Canada',
    amount_min: 25000,
    amount_max: 500000,
    useCases: ['Inventory', 'Seasonal Cash Flow'],
    description: 'Line of credit for retail and e-commerce'
  },

  // US Products
  {
    id: 'us-working-001',
    name: 'US Working Capital',
    lenderName: 'American Business Capital',
    category: 'Working Capital',
    country: 'USA',
    amount_min: 25000,
    amount_max: 1000000,
    useCases: ['Working Capital', 'Expansion'],
    description: 'Working capital for US businesses'
  },
  {
    id: 'us-equipment-001',
    name: 'US Equipment Loan',
    lenderName: 'Equipment Finance USA',
    category: 'Equipment Financing',
    country: 'USA',
    amount_min: 15000,
    amount_max: 2000000,
    useCases: ['Equipment Purchase', 'Manufacturing Equipment'],
    description: 'Equipment financing across all industries'
  },
  {
    id: 'us-term-001',
    name: 'SBA Term Loan',
    lenderName: 'SBA Preferred Lender',
    category: 'Term Loan',
    country: 'USA',
    amount_min: 100000,
    amount_max: 5000000,
    useCases: ['Real Estate', 'Business Acquisition', 'Major Expansion'],
    description: 'SBA-backed term loans for major investments'
  },

  // Invoice Factoring
  {
    id: 'factoring-can-001',
    name: 'Invoice Factoring',
    lenderName: 'Canadian Factoring Corp',
    category: 'Invoice Factoring',
    country: 'Canada',
    amount_min: 10000,
    amount_max: 500000,
    useCases: ['Cash Flow', 'Immediate Funding'],
    description: 'Convert invoices to immediate cash'
  },
  {
    id: 'factoring-us-001',
    name: 'Accounts Receivable Financing',
    lenderName: 'US Factor Solutions',
    category: 'Invoice Factoring',
    country: 'USA',
    amount_min: 15000,
    amount_max: 1000000,
    useCases: ['Cash Flow', 'Working Capital'],
    description: 'AR financing for B2B companies'
  },

  // Edge cases for testing
  {
    id: 'micro-loan-001',
    name: 'Micro Business Loan',
    lenderName: 'Micro Lender Corp',
    category: 'Working Capital',
    country: 'Canada',
    amount_min: 1000,
    amount_max: 25000,
    useCases: ['Startup Capital', 'Emergency Funding'],
    description: 'Small loans for micro businesses'
  },
  {
    id: 'large-corp-001',
    name: 'Corporate Credit Facility',
    lenderName: 'Large Corporate Finance',
    category: 'Business Line of Credit',
    country: 'Canada',
    amount_min: 1000000,
    amount_max: 50000000,
    useCases: ['Major Expansion', 'Acquisition Financing'],
    description: 'Large corporate credit facilities'
  }
];

export default mockLenderProducts;