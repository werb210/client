import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

interface ProductCategoryFilters {
  country?: string;
  lookingFor?: string;
  fundingAmount?: string;
  accountsReceivableBalance?: string;
  fundsPurpose?: string;
}

// Multi-filter API endpoint for real-time product categories using staff API data
router.get('/categories', async (req, res) => {
  try {
    const {
      country = 'united_states',
      lookingFor = 'capital',
      fundingAmount = '$50,000',
      accountsReceivableBalance,
      fundsPurpose
    } = req.query as ProductCategoryFilters;

    console.log(`🔍 FILTERING PRODUCTS:`, { country, lookingFor, fundingAmount, accountsReceivableBalance, fundsPurpose });

    // Fetch data from staff API (same source as client)
    const staffApiUrl = process.env.VITE_STAFF_API_URL || 'https://staffportal.replit.app/api';
    const response = await fetch(`${staffApiUrl}/public/lenders`);
    
    if (!response.ok) {
      throw new Error(`Staff API error: ${response.status}`);
    }
    
    const data = await response.json() as any;
    if (!data.products) {
      throw new Error('No products found in staff API response');
    }

    // Apply same filtering logic as client-side
    const fundingAmount_parsed = parseFloat(fundingAmount.replace(/[^0-9.-]+/g, ''));
    const selectedCountryCode = country === 'united_states' ? 'US' : 'CA';

    const filteredProducts = data.products.filter((p: any) => {
      // Country filter - exact match or multi-country
      if (!(p.country === selectedCountryCode || p.country === 'US/CA')) {
        return false;
      }

      // Amount range filter
      const min = p.amountRange?.min || 0;
      const max = p.amountRange?.max || Infinity;
      if (fundingAmount_parsed < min || fundingAmount_parsed > max) {
        return false;
      }

      // Product type filter
      if (lookingFor === 'capital') {
        const isCapitalProduct = isBusinessCapitalProduct(p.category);
        if (!isCapitalProduct) {
          return false;
        }
      } else if (lookingFor === 'equipment') {
        if (p.category !== 'Equipment Financing') {
          return false;
        }
      }

      // Accounts receivable filter - exclude Invoice Factoring when no AR
      if (accountsReceivableBalance === 'none' && 
          (p.category.toLowerCase().includes('invoice') || p.category.toLowerCase().includes('factoring'))) {
        console.log(`Invoice Factoring: ${p.productName || p.lenderName} excluded because no accounts receivable`);
        return false;
      }

      return true;
    });

    // Group by category and count
    const categoryGroups: Record<string, number> = {};
    filteredProducts.forEach((product: any) => {
      const category = product.category;
      categoryGroups[category] = (categoryGroups[category] || 0) + 1;
    });

    // Format response
    const totalProducts = filteredProducts.length;
    const categories = Object.entries(categoryGroups).map(([category, count]) => ({
      category,
      count,
      percentage: totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    console.log(`✅ FOUND ${totalProducts} products across ${categories.length} categories`);

    res.json({
      success: true,
      data: categories,
      totalProducts,
      filters: { country, lookingFor, fundingAmount, accountsReceivableBalance, fundsPurpose }
    });

  } catch (error) {
    console.error('Error fetching product categories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch product categories' });
  }
});

// Helper function to determine if category is business capital
function isBusinessCapitalProduct(category: string): boolean {
  const capitalCategories = [
    'Working Capital',
    'Business Line of Credit', 
    'Term Loan',
    'Business Term Loan',
    'SBA Loan',
    'Asset Based Lending',
    'Invoice Factoring',
    'Purchase Order Financing'
  ];
  
  return capitalCategories.some(cat => 
    category.toLowerCase().includes(cat.toLowerCase()) ||
    cat.toLowerCase().includes(category.toLowerCase())
  );
}



export default router;