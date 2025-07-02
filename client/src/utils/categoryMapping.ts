export const getDocumentCategory = (formData: any, selectedProduct: string): string => {
  // Use selectedProduct if specific
  if (selectedProduct?.toLowerCase().includes('line of credit')) {
    return 'line_of_credit';
  }
  
  if (selectedProduct?.toLowerCase().includes('equipment')) {
    return 'equipment_financing';
  }

  if (selectedProduct?.toLowerCase().includes('factoring')) {
    return 'invoice_factoring';
  }

  if (selectedProduct?.toLowerCase().includes('working capital')) {
    return 'working_capital';
  }
  
  // Map form selections to database categories
  if (formData.lookingFor === 'equipment') {
    return 'equipment_financing';
  } else if (formData.lookingFor === 'capital') {
    return 'term_loan';
  } else if (formData.lookingFor === 'both') {
    return 'line_of_credit';
  } else {
    return 'term_loan';
  }
};

export const formatCategoryName = (category: string): string => {
  const map: Record<string, string> = {
    'term_loan': 'Term Loan',
    'line_of_credit': 'Business Line of Credit',
    'equipment_financing': 'Equipment Financing',
    'invoice_factoring': 'Invoice Factoring',
    'working_capital': 'Working Capital',
    'purchase_order_financing': 'Purchase Order Financing',
    'asset_based_lending': 'Asset Based Lending',
    'merchant_cash_advance': 'Merchant Cash Advance'
  };
  return map[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};