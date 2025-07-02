// Category mapping logic for dynamic document requirements
export const getDocumentCategory = (formData: any, selectedProduct: string): string => {
  // Use selectedProduct if it contains specific product type information
  if (selectedProduct && selectedProduct.toLowerCase().includes('line of credit')) {
    return 'line_of_credit';
  }
  
  // Primary logic based on form data
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
  const categoryMap: Record<string, string> = {
    'term_loan': 'Term Loan',
    'line_of_credit': 'Business Line of Credit',
    'equipment_financing': 'Equipment Financing',
    'factoring': 'Invoice Factoring',
    'working_capital': 'Working Capital'
  };
  return categoryMap[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const mapFormDataToCategory = (formData: any): string => {
  // Map form field values to database product types
  const productTypeMapping: Record<string, string> = {
    'equipment': 'equipment_financing',
    'capital': 'term_loan', 
    'both': 'line_of_credit',
    'line of credit': 'line_of_credit',
    'term loan': 'term_loan',
    'equipment financing': 'equipment_financing',
    'invoice factoring': 'factoring'
  };

  return productTypeMapping[formData.lookingFor] || 'term_loan';
};