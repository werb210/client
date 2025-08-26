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

  } catch (error) {
    console.error('Product category filtering failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to filter product categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
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