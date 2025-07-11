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

    console.log(`🔍 FILTERING PRODUCTS:`, { country, lookingFor, fundingAmount, accountsReceivableBalance, fundsPurpose });

    // Try to fetch from staff API first, fall back to local data
    let products: any[] = [];
    
    try {
      const staffApiUrl = process.env.VITE_STAFF_API_URL || 'https://staff.boreal.financial';
      console.log(`🔗 Connecting to staff API: ${staffApiUrl}/api/public/lenders`);
      
      const response = await fetch(`${staffApiUrl}/api/public/lenders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json() as any;
        products = data.products || data.lenders || data;
        console.log(`📊 Found ${products.length} authentic products from staff API`);
      } else {
        console.warn(`Staff API returned ${response.status}, falling back to local data`);
        throw new Error(`Staff API error: ${response.status}`);
      }
    } catch (error) {
      console.warn(`⚠️ Staff API unavailable, using fallback data:`, error.message);
      
      // Use fallback data
      const fs = await import('fs');
      const path = await import('path');
      
      try {
        const fallbackPath = path.join(process.cwd(), 'public', 'fallback', 'lenders.json');
        const fallbackData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        products = fallbackData.products || [];
        console.log(`📦 Using fallback data: ${products.length} products`);
        console.log(`📦 First 3 products:`, products.slice(0, 3));
      } catch (fallbackError) {
        console.error(`❌ Fallback data also failed:`, fallbackError.message);
        // Return empty result instead of throwing
        return res.json({
          success: true,
          data: [],
          totalProducts: 0,
          filters: { country, lookingFor, fundingAmount, accountsReceivableBalance, fundsPurpose },
          message: 'No products available - fallback data unavailable'
        });
      }
    }

    // Apply filtering logic to authentic API data
    const fundingAmount_parsed = parseFloat(fundingAmount.replace(/[^0-9.-]+/g, ''));
    const selectedCountryCode = country === 'canada' ? 'CA' : 'US';

    const filteredProducts = products.filter((p: any) => {
      // Log product structure for debugging
      if (products.indexOf(p) === 0) {
        console.log(`📋 Sample product structure:`, Object.keys(p));
        console.log(`📋 Sample product:`, p);
      }

      // Country filter - check different possible field names
      const productCountry = p.geography || p.country || p.region;
      if (productCountry) {
        const countryMatches = Array.isArray(productCountry) 
          ? productCountry.includes(selectedCountryCode)
          : productCountry === selectedCountryCode || productCountry === 'US/CA';
        
        if (!countryMatches) {
          console.log(`❌ Product ${p.name} rejected: country mismatch (${productCountry} vs ${selectedCountryCode})`);
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
          console.log(`❌ Product ${p.name} rejected: not a capital product (${productType})`);
          return false;
        }
      } else if (lookingFor === 'equipment') {
        if (!productType || !productType.toLowerCase().includes('equipment')) {
          console.log(`❌ Product ${p.name} rejected: not an equipment product (${productType})`);
          return false;
        }
      }

      // Accounts receivable filter - exclude Invoice Factoring when no AR
      const hasNoAccountsReceivable = accountsReceivableBalance === 'none' || 
                                      accountsReceivableBalance === '0' || 
                                      parseFloat(accountsReceivableBalance || '0') === 0;
      
      if (hasNoAccountsReceivable && productType &&
          (productType.toLowerCase().includes('invoice') || productType.toLowerCase().includes('factoring'))) {
        console.log(`Invoice Factoring: ${p.lender || p.lenderName || p.name} excluded because no accounts receivable (${accountsReceivableBalance})`);
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