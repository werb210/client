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

// This file provides type definitions and utilities for lender products
// The actual data is fetched from the API endpoints

export const getLenderProducts = async (): Promise<LenderProduct[]> => {
  try {
    const response = await fetch('/api/lender-products');
    const data = await response.json();
    if (data.success) {
      return data.products || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching lender products:', error);
    return [];
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
    const matchesCountry = !country || product.countryOffered === country || product.countryOffered === 'United States';
    const isActive = product.isActive !== false;
    
    return matchesCategory && matchesAmount && matchesCountry && isActive;
  });
};