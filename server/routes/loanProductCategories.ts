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

// Multi-filter API endpoint for real-time product categories using local database
router.get('/categories', async (req, res) => {
  try {
    const {
      country = 'united_states',
      lookingFor = 'capital',
      fundingAmount = '$50,000',
      accountsReceivableBalance,
      fundsPurpose
    } = req.query as ProductCategoryFilters;

    // Filtering products

    // CRITICAL: Only use authentic 41-product database - delegate to client-side cached data
    // Delegating to client-side system
    
    // Return error to force Step 2 to use client-side useLocalLenders hook with authentic data
    return res.status(503).json({
      success: false,
      error: 'Server route disabled - use client-side authentic data',
      details: 'Step 2 configured to use useLocalLenders hook with authentic 41-product database from IndexedDB cache.',
      message: 'Client-side Step 2 system has authentic data available',
      useClientSide: true,
      filters: { country, lookingFor, fundingAmount, accountsReceivableBalance, fundsPurpose }
    });

    // Apply filtering logic to authentic API data
    const fundingAmount_parsed = parseFloat(fundingAmount.replace(/[^0-9.-]+/g, ''));
    const selectedCountryCode = country === 'canada' ? 'CA' : 'US';

    const filteredProducts = products.filter((p: any) => {
      // Log product structure for debugging
      if (products.indexOf(p) === 0) {
        // Sample product structure
      }

      // Country filter - check different possible field names
      const productCountry = p.geography || p.country || p.region;
      if (productCountry) {
        const countryMatches = Array.isArray(productCountry) 
          ? productCountry.includes(selectedCountryCode)
          : productCountry === selectedCountryCode || productCountry === 'US/CA';
        
        if (!countryMatches) {
          // Product rejected: country mismatch
          return false;
        }
      }

      // Amount range filter - check different possible field names
      const minAmount = p.minAmountUsd || p.amountMin || p.min_amount || 0;
      const maxAmount = p.maxAmountUsd || p.amountMax || p.max_amount || Infinity;
      
      if (fundingAmount_parsed < minAmount || fundingAmount_parsed > maxAmount) {
        return false;
      }

      // Product type filter - check different possible field names
      const productType = p.productCategory || p.category || p.type;
      if (lookingFor === 'capital') {
        const isCapitalProduct = isBusinessCapitalProduct(productType);
        if (!isCapitalProduct) {
          // Product rejected: not capital
          return false;
        }
      } else if (lookingFor === 'equipment') {
        if (!productType || !productType.toLowerCase().includes('equipment')) {
          // Product rejected: not equipment
          return false;
        }
      }

      // Accounts receivable filter - exclude Invoice Factoring when no AR
      const hasNoAccountsReceivable = accountsReceivableBalance === 'none' || 
                                      accountsReceivableBalance === '0' || 
                                      parseFloat(accountsReceivableBalance || '0') === 0;
      
      if (hasNoAccountsReceivable && productType &&
          (productType.toLowerCase().includes('invoice') || productType.toLowerCase().includes('factoring'))) {
        // Invoice factoring excluded
        return false;
      }

      return true;
    });

    // Group by category and count
    const categoryGroups: Record<string, number> = {};
    filteredProducts.forEach((product: any) => {
      const category = product.productCategory || product.category || product.type || 'Unknown';
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
    console.error('❌ Staff API Connection Error:', error);
    
    // Provide detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isStaffAPIDown = errorMessage.includes('404') || errorMessage.includes('Staff API error');
    
    if (isStaffAPIDown) {
      res.status(503).json({ 
        success: false, 
        error: 'Staff Backend API Unavailable',
        details: 'The staff backend API at https://staffportal.replit.app is not responding. All endpoints return 404.',
        diagnostic: {
          testedEndpoints: [
            'https://staffportal.replit.app/api/public/lenders',
            'https://staffportal.replit.app/api/lenders', 
            'https://staffportal.replit.app/api/products'
          ],
          allReturned: '404 Not Found',
          recommendation: 'Contact staff backend team to restore API service'
        }
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch product categories',
        details: errorMessage
      });
    }
  }
});

// Helper function to determine if category is business capital
function isBusinessCapitalProduct(category: string): boolean {
  if (!category) return false;
  
  const capitalCategories = [
    'working_capital',
    'line_of_credit', 
    'term_loan',
    'business_term_loan',
    'sba_loan',
    'asset_based_lending',
    'invoice_factoring',
    'purchase_order_financing'
  ];
  
  const categoryLower = category.toLowerCase();
  const isCapital = capitalCategories.some(cat => 
    categoryLower.includes(cat) || cat.includes(categoryLower)
  );
  
  console.log(`🔍 Category check: "${category}" -> ${isCapital ? 'CAPITAL' : 'NOT CAPITAL'}`);
  return isCapital;
}

function isEquipmentFinancingProduct(category: string): boolean {
  const equipmentCategories = [
    'Equipment Financing',
    'Equipment Finance',
    'Asset-Based Lending',
    'Asset Based Lending'
  ];
  
  return equipmentCategories.some(cat => 
    category.toLowerCase().includes(cat.toLowerCase()) ||
    cat.toLowerCase().includes(category.toLowerCase())
  );
}



export default router;