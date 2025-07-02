// Category name formatting utility
export const formatCategoryName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'term_loan': 'Term Loan',
    'line_of_credit': 'Business Line of Credit',
    'equipment_financing': 'Equipment Financing',
    'invoice_factoring': 'Invoice Factoring',
    'working_capital': 'Working Capital',
    'purchase_order_financing': 'Purchase Order Financing',
    'sba_loan': 'SBA Loan',
    'merchant_cash_advance': 'Merchant Cash Advance',
    'factoring': 'Invoice Factoring'
  };
  
  return categoryMap[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Funding amount parsing utility
export const parseFundingAmount = (amount: string): { display: string; value: number } => {
  const clean = amount.replace(/[$,]/g, '');
  
  if (clean.includes('over')) {
    const match = clean.match(/over\s+(\d+)/i);
    const value = match ? parseInt(match[1]) : 0;
    return { display: `Over $${(value/1000)}K`, value };
  }
  
  const rangeMatch = clean.match(/(\d+)[\s-]+(\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1]);
    const max = parseInt(rangeMatch[2]);
    return { 
      display: `$${min/1000}K - $${max/1000}K`, 
      value: Math.floor((min + max) / 2) 
    };
  }

  const singleMatch = clean.match(/(\d+)/);
  if (singleMatch) {
    const value = parseInt(singleMatch[1]);
    return { display: `$${value/1000}K`, value };
  }
  
  return { display: amount, value: 0 };
};