import { useQuery } from '@tanstack/react-query';
import { getStaffApiUrl } from '../api/constants';
import { filterProducts, calculateRecommendationScore, StaffLenderProduct, RecommendationFormData } from '../lib/recommendation';

/**
 * Fetch products directly from staff database API
 */
async function fetchStaffProducts(): Promise<StaffLenderProduct[]> {
  try {
    const staffUrl = `${getStaffApiUrl()}/api/public/lenders`;
    
    const response = await fetch(staffUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Staff API failed: ${response.status}`);
    }

    const data = await response.json();
    const products = data.products || [];

    console.log(`[STAFF RECOMMENDATIONS] Fetched ${products.length} products from staff database`);

    return products;
  } catch (error) {
    console.error('[STAFF RECOMMENDATIONS] Error fetching staff products:', error);
    throw error;
  }
}

/**
 * Hook to get filtered recommendations from staff database using your business rules
 */
export function useStaffRecommendations(formData: RecommendationFormData, monthlyRevenue: number = 0) {
  const query = useQuery({
    queryKey: ['staff-recommendations', formData],
    queryFn: async () => {
      console.log('[STAFF RECOMMENDATIONS] Fetching products from staff database...');
      
      // Fetch all products from staff database (43+ products)  
      const allProducts = await fetchStaffProducts();
      
      console.log(`[STAFF RECOMMENDATIONS] Found ${allProducts.length} products in staff database`);

      // Apply your business rules to filter products
      const filteredProducts = filterProducts(allProducts, formData);
      
      console.log(`[STAFF RECOMMENDATIONS] Filtered to ${filteredProducts.length} matching products`);

      // Calculate scores for each filtered product
      const productsWithScores = filteredProducts.map(product => ({
        ...product,
        matchScore: calculateRecommendationScore(product, formData, monthlyRevenue)
      }));

      // Sort by match score (highest first)
      const sortedProducts = productsWithScores.sort((a, b) => b.matchScore - a.matchScore);

      // Group by category for display
      const productsByCategory = sortedProducts.reduce((acc, product) => {
        const category = product.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(product);
        return acc;
      }, {} as Record<string, typeof sortedProducts>);

      console.log('[STAFF RECOMMENDATIONS] Categories found:', Object.keys(productsByCategory));

      return {
        allFilteredProducts: sortedProducts,
        productsByCategory,
        totalMatches: filteredProducts.length,
        bestMatch: sortedProducts[0] || null,
        averageScore: sortedProducts.length > 0 
          ? sortedProducts.reduce((sum, p) => sum + p.matchScore, 0) / sortedProducts.length 
          : 0
      };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!formData.headquarters && !!formData.fundingAmount
  });

  return {
    ...query,
    recommendations: query.data
  };
}

      // Apply your business rules to filter products
      const filteredProducts = filterProducts(staffProducts, formData);
      
      console.log(`[STAFF RECOMMENDATIONS] Filtered to ${filteredProducts.length} matching products`);

      // Calculate scores for each filtered product
      const productsWithScores = filteredProducts.map(product => ({
        ...product,
        matchScore: calculateRecommendationScore(product, formData, monthlyRevenue)
      }));

      // Sort by match score (highest first)
      const sortedProducts = productsWithScores.sort((a, b) => b.matchScore - a.matchScore);

      // Group by category for display
      const productsByCategory = sortedProducts.reduce((acc, product) => {
        const category = product.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(product);
        return acc;
      }, {} as Record<string, typeof sortedProducts>);

      console.log('[STAFF RECOMMENDATIONS] Categories found:', Object.keys(productsByCategory));

      return {
        allFilteredProducts: sortedProducts,
        productsByCategory,
        totalMatches: filteredProducts.length,
        bestMatch: sortedProducts[0] || null,
        averageScore: sortedProducts.length > 0 
          ? sortedProducts.reduce((sum, p) => sum + p.matchScore, 0) / sortedProducts.length 
          : 0
      };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!formData.headquarters && !!formData.fundingAmount
  });

  return {
    ...query,
    recommendations: query.data
  };
}

/**
 * Convert Step 1 form data to RecommendationFormData format
 */
export function convertStep1ToRecommendationData(step1Data: any): RecommendationFormData {
  // Convert business location to headquarters format
  const headquarters = step1Data.businessLocation === 'united-states' ? 'US' : 
                      step1Data.businessLocation === 'canada' ? 'CA' : 'US';

  // Parse funding amount - remove currency symbols and commas
  const fundingAmount = parseFloat(
    (step1Data.fundingAmount || '0').replace(/[$,]/g, '')
  ) || 0;

  // Convert "What are you looking for?" to the format expected by business rules
  const lookingFor = step1Data.lookingFor as 'capital' | 'equipment' | 'both';

  // Parse accounts receivable balance
  const arBalance = step1Data.accountsReceivableBalance;
  const accountsReceivableBalance = arBalance === 'no-account-receivables' ? 0 : 
                                   arBalance === 'under-10k' ? 5000 :
                                   arBalance === '10k-to-50k' ? 30000 :
                                   arBalance === '50k-to-100k' ? 75000 :
                                   arBalance === '100k-to-500k' ? 300000 :
                                   arBalance === 'over-500k' ? 750000 : 0;

  return {
    headquarters,
    fundingAmount,
    lookingFor,
    accountsReceivableBalance,
    fundsPurpose: step1Data.fundsPurpose || ''
  };
}

/**
 * Convert revenue range to monthly amount for scoring
 */
export function convertRevenueToMonthly(revenueRange: string): number {
  const ranges: Record<string, number> = {
    'under-100k': 8333,      // $100k/year = ~$8.3k/month  
    '100k-to-250k': 14583,   // $175k/year = ~$14.6k/month
    '250k-to-500k': 31250,   // $375k/year = ~$31.25k/month
    '500k-to-1m': 62500,     // $750k/year = ~$62.5k/month
    '1m-to-5m': 250000,      // $3M/year = ~$250k/month
    'over-5m': 500000        // $6M+/year = ~$500k/month
  };
  
  return ranges[revenueRange] || 0;
}