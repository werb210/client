/**
 * Sync Lender Products from Staff API to Local Database
 * Pulls the canonical lender product data from staff backend
 */

import fetch from 'node-fetch';
import fs from 'fs';

async function syncLenderProducts() {
  console.log('🔄 Starting lender products sync from staff API...');
  
  try {
    // 1. Fetch products from staff API
    console.log('📡 Fetching products from staff API...');
    const response = await fetch('http://localhost:5000/api/lender-products');
    
    if (!response.ok) {
      throw new Error(`Staff API error: ${response.status}`);
    }
    
    const data = await response.json();
    const staffProducts = data.products || [];
    
    console.log(`✅ Fetched ${staffProducts.length} products from staff API`);
    
    // 2. Transform to local database schema
    console.log('🔄 Transforming products for local database...');
    const transformedProducts = staffProducts.map(product => ({
      // Use staff API ID or generate one
      staff_id: product.id,
      name: product.productName || product.name,
      lender_name: product.lenderName || 'Unknown',
      type: mapCategoryToType(product.productCategory),
      category: product.productCategory,
      country: product.countryOffered,
      description: product.description || `${product.productCategory} from ${product.lenderName}`,
      min_amount: product.minimumLendingAmount || null,
      max_amount: product.maximumLendingAmount || null,
      interest_rate_min: product.interestRateMinimum || null,
      interest_rate_max: product.interestRateMaximum || null,
      term_min: product.termMinimum || null,
      term_max: product.termMaximum || null,
      requirements: JSON.stringify(product.documentsRequired || []),
      active: product.isActive !== false
    }));
    
    console.log('📊 Sample transformed product:', transformedProducts[0]);
    console.log(`✅ Transformed ${transformedProducts.length} products`);
    
    // 3. Display sync summary
    const byCategory = transformedProducts.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📋 SYNC SUMMARY:');
    console.log('================');
    console.log(`Total products: ${transformedProducts.length}`);
    console.log('By category:');
    Object.entries(byCategory).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} products`);
    });
    
    const byCountry = transformedProducts.reduce((acc, p) => {
      acc[p.country] = (acc[p.country] || 0) + 1;
      return acc;
    }, {});
    
    console.log('By country:');
    Object.entries(byCountry).forEach(([country, count]) => {
      console.log(`  ${country}: ${country} products`);
    });
    
    // 4. Save to file for database import
    fs.writeFileSync('./transformed_products.json', JSON.stringify(transformedProducts, null, 2));
    console.log('\n✅ Products saved to transformed_products.json');
    console.log('✅ Ready for database import');
    
    return transformedProducts;
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    throw error;
  }
}

// Map product categories to local types
function mapCategoryToType(category) {
  const categoryMap = {
    'Working Capital': 'working_capital',
    'Term Loan': 'term_loan', 
    'Business Line of Credit': 'line_of_credit',
    'Equipment Financing': 'equipment_financing',
    'Invoice Factoring': 'factoring',
    'Asset-Based Lending': 'asset_based_lending',
    'SBA Loan': 'sba_loan',
    'Purchase Order Financing': 'purchase_order_financing'
  };
  
  return categoryMap[category] || 'other';
}

// Run sync
syncLenderProducts()
  .then(() => {
    console.log('🎉 Sync completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Sync failed:', error);
    process.exit(1);
  });

export { syncLenderProducts };