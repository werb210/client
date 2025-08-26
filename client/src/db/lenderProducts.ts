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
    const response = await fetch('/api/catalog/export-products?includeInactive=1');
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

export interface SyncStats {
  lastSync: string;
  productCount: number;
  isActive: boolean;
  nextSync: string;
}

export const getSyncStats = async (): Promise<SyncStats> => {
  try {
    const products = await getLenderProducts();
    return {
      lastSync: new Date().toISOString(),
      productCount: products.length,
      isActive: true,
      nextSync: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    };
  } catch (error) {
    console.error('Error getting sync stats:', error);
    return {
      lastSync: 'Unknown',
      productCount: 0,
      isActive: false,
      nextSync: 'Unknown',
    };
  }
};