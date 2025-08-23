import React, { createContext, useContext, useEffect, useState } from 'react';
import { LenderProduct } from '../types/lenderProduct';
import { fetchLenderProducts } from '@/lib/api';

interface LenderDataContextType {
  products: LenderProduct[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const LenderDataContext = createContext<LenderDataContextType | undefined>(undefined);

export function LenderDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<LenderProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // console.log('[LENDER_CONTEXT] Fetching lender products...');
      
      const data = await fetchLenderProducts();
      setProducts(data);
      // console.log(`[LENDER_CONTEXT] ✅ Loaded ${data.length} products successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('[LENDER_CONTEXT] ❌ Failed to load products:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const contextValue: LenderDataContextType = {
    products,
    isLoading,
    error,
    refetch: fetchData
  };

  return (
    <LenderDataContext.Provider value={contextValue}>
      {children}
    </LenderDataContext.Provider>
  );
}

export function useLenderData() {
  const context = useContext(LenderDataContext);
  if (context === undefined) {
    throw new Error('useLenderData must be used within a LenderDataProvider');
  }
  return context;
}