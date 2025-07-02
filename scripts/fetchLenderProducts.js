/**
 * Fetch lender products from staff backend API and populate local database
 */

import { db } from '../server/storage.js';
import { lenderProducts } from '../shared/lenderSchema.js';

const STAFF_API_URL = 'https://staffportal.replit.app/api';

async function fetchLenderProducts() {
  console.log('🔄 Fetching lender products from staff backend...');
  
  try {
    const response = await fetch(`${STAFF_API_URL}/public/lenders`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Staff API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Staff API response received');
    
    // Handle different response formats
    let products = [];
    if (Array.isArray(data)) {
      products = data;
    } else if (data.products && Array.isArray(data.products)) {
      products = data.products;
    } else if (data.data && Array.isArray(data.data)) {
      products = data.data;
    } else {
      throw new Error('Invalid API response format - no products array found');
    }

    console.log(`📊 Found ${products.length} products to import`);
    
    if (products.length === 0) {
      console.log('⚠️  No products returned from staff API');
      return;
    }

    // Clear existing data
    console.log('🗑️  Clearing existing products...');
    await db.delete(lenderProducts);
    
    // Transform and insert products
    console.log('💾 Inserting products into database...');
    
    for (const product of products) {
      try {
        // Map API response to database schema
        const dbProduct = {
          name: product.product || product.name || 'Unknown Product',
          type: product.productCategory || product.category || product.type || 'Other',
          description: product.description || null,
          min_amount: product.minAmountUsd || product.minAmount || null,
          max_amount: product.maxAmountUsd || product.maxAmount || null,
          interest_rate_min: product.interestRateMin || null,
          interest_rate_max: product.interestRateMax || null,
          term_min: product.termMinMonths || product.termMin || null,
          term_max: product.termMaxMonths || product.termMax || null,
          requirements: product.requiredDocs ? JSON.stringify(product.requiredDocs) : null,
          video_url: product.videoUrl || null,
          active: product.isActive !== false // default to true unless explicitly false
        };

        await db.insert(lenderProducts).values(dbProduct);
        console.log(`  ✓ Inserted: ${dbProduct.name} (${dbProduct.type})`);
        
      } catch (insertError) {
        console.error(`  ❌ Failed to insert product:`, insertError.message);
        console.error(`  Product data:`, JSON.stringify(product, null, 2));
      }
    }

    // Verify insertion
    const result = await db.select().from(lenderProducts);
    console.log(`✅ Successfully imported ${result.length} products`);
    
    // Show summary by category
    const categories = {};
    result.forEach(product => {
      categories[product.type] = (categories[product.type] || 0) + 1;
    });
    
    console.log('📋 Products by category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} products`);
    });

    return result;
    
  } catch (error) {
    console.error('❌ Failed to fetch lender products:', error.message);
    
    if (error.message.includes('500')) {
      console.log('💡 This might indicate:');
      console.log('  - Staff backend is having issues');
      console.log('  - Database connection problems');
      console.log('  - API endpoint configuration issues');
    } else if (error.message.includes('404')) {
      console.log('💡 This might indicate:');
      console.log('  - API endpoint URL is incorrect');
      console.log('  - Staff backend is not deployed');
      console.log('  - Route not configured on staff side');
    }
    
    throw error;
  }
}

// Alternative endpoints to try if main endpoint fails
async function tryAlternativeEndpoints() {
  const endpoints = [
    `${STAFF_API_URL}/public/lenders`,
    `${STAFF_API_URL}/lenders`,
    `${STAFF_API_URL}/products`,
    `${STAFF_API_URL}/public/products`,
    'https://staff.replit.app/api/public/lenders',
    'https://staff.replit.app/api/lenders'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Trying endpoint: ${endpoint}`);
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success with endpoint: ${endpoint}`);
        console.log(`Response preview:`, JSON.stringify(data).slice(0, 200) + '...');
        return { endpoint, data };
      } else {
        console.log(`❌ ${endpoint}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
  
  throw new Error('All API endpoints failed');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchLenderProducts()
    .then(() => {
      console.log('🎉 Lender products fetch completed');
      process.exit(0);
    })
    .catch(async (error) => {
      console.log('🔍 Trying alternative endpoints...');
      try {
        const result = await tryAlternativeEndpoints();
        console.log('✅ Found working endpoint:', result.endpoint);
      } catch (altError) {
        console.error('❌ All endpoints failed');
      }
      process.exit(1);
    });
}

export { fetchLenderProducts };