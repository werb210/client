export interface LenderProduct {
  id: string;
  lenderName: string;
  productName: string;
  productCategory: string;
  minimumLendingAmount: number;
  maximumLendingAmount: number;
  countryOffered: string;
  isActive: boolean;
}

export interface LenderProductsResponse {
  success: boolean;
  products: LenderProduct[];
  error?: string;
}

// API functions for lender products
export const fetchLenderProducts = async (): Promise<LenderProductsResponse> => {
  try {
    const response = await fetch('/api/catalog/export-products?includeInactive=1');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching lender products:', error);
    return {
      success: false,
      products: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const filterProductsByCategory = (
  products: LenderProduct[], 
  category: string,
  amount?: number,
  country?: string
): LenderProduct[] => {
  return products.filter(product => {
    const matchesCategory = product.productCategory === category;
    const matchesAmount = !amount || (amount >= product.minimumLendingAmount && amount <= product.maximumLendingAmount);
    const matchesCountry = !country || product.countryOffered === country || product.countryOffered === 'United States' || product.countryOffered === 'US';
    const isActive = product.isActive !== false;
    
    return matchesCategory && matchesAmount && matchesCountry && isActive;
  });
};

export const getRecommendations = async (
  category: string = 'Working Capital', 
  amount: number = 50000,
  country: string = 'US'
): Promise<LenderProduct[]> => {
  const response = await fetchLenderProducts();
  if (response.success) {
    return filterProductsByCategory(response.products, category, amount, country);
  }
  return [];
};