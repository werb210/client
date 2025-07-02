/**
 * Import live lender products data into the database
 * Supports multiple data formats and sources
 */

import { createConnection } from '../server/database.js';
import { lenderProducts } from '../shared/lenderSchema.js';

async function importLiveData(dataSource) {
  console.log('🔄 Starting live data import...');
  
  const db = createConnection();
  let products = [];
  
  try {
    // Handle different data source types
    if (typeof dataSource === 'string') {
      if (dataSource.startsWith('http')) {
        // Fetch from URL
        console.log(`📡 Fetching data from: ${dataSource}`);
        const response = await fetch(dataSource);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        products = Array.isArray(data) ? data : data.products || data.data || [];
      } else {
        // Parse as JSON string
        console.log('📝 Parsing JSON data...');
        const data = JSON.parse(dataSource);
        products = Array.isArray(data) ? data : data.products || data.data || [];
      }
    } else if (Array.isArray(dataSource)) {
      // Direct array
      products = dataSource;
    } else if (dataSource.products) {
      // Object with products array
      products = dataSource.products;
    } else {
      throw new Error('Invalid data source format');
    }
    
    console.log(`📊 Found ${products.length} products to import`);
    
    if (products.length === 0) {
      throw new Error('No products found in data source');
    }
    
    // Clear existing data
    console.log('🗑️  Clearing existing products...');
    await db.delete(lenderProducts);
    
    // Import products with validation
    console.log('💾 Importing products...');
    let imported = 0;
    let skipped = 0;
    
    for (const product of products) {
      try {
        // Validate required fields
        const name = product.product || product.name || product.productName;
        const type = product.productCategory || product.category || product.type;
        
        if (!name || !type) {
          console.log(`⚠️  Skipping product with missing name or type:`, { name, type });
          skipped++;
          continue;
        }
        
        // Map to database schema
        const dbProduct = {
          name: name.trim(),
          type: type.trim(),
          description: product.description || product.desc || null,
          min_amount: parseFloat(product.minAmountUsd || product.minAmount || product.min_amount) || null,
          max_amount: parseFloat(product.maxAmountUsd || product.maxAmount || product.max_amount) || null,
          interest_rate_min: parseFloat(product.interestRateMin || product.rate_min) || null,
          interest_rate_max: parseFloat(product.interestRateMax || product.rate_max) || null,
          term_min: parseInt(product.termMinMonths || product.term_min) || null,
          term_max: parseInt(product.termMaxMonths || product.term_max) || null,
          requirements: product.requiredDocs || product.requirements || product.docs ? 
            JSON.stringify(product.requiredDocs || product.requirements || product.docs) : null,
          video_url: product.videoUrl || product.video || null,
          active: product.isActive !== false && product.active !== false
        };
        
        await db.insert(lenderProducts).values(dbProduct);
        imported++;
        
        if (imported % 10 === 0) {
          console.log(`  ✓ Imported ${imported} products...`);
        }
        
      } catch (error) {
        console.error(`  ❌ Failed to import product: ${error.message}`);
        console.error(`  Product data:`, product);
        skipped++;
      }
    }
    
    console.log(`✅ Import completed: ${imported} imported, ${skipped} skipped`);
    
    // Verify and summarize
    const result = await db.select().from(lenderProducts);
    console.log(`📋 Database now contains ${result.length} products`);
    
    // Show categories
    const categories = {};
    result.forEach(product => {
      categories[product.type] = (categories[product.type] || 0) + 1;
    });
    
    console.log('📊 Products by category:');
    Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} products`);
      });
    
    return {
      imported,
      skipped,
      total: result.length,
      categories
    };
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    throw error;
  }
}

// Example usage for different data sources
async function exampleUsage() {
  console.log('📚 Live data import examples:');
  console.log('');
  console.log('1. From JSON file:');
  console.log('   node scripts/importLiveData.js ./data/lenders.json');
  console.log('');
  console.log('2. From API endpoint:');
  console.log('   node scripts/importLiveData.js https://api.example.com/lenders');
  console.log('');
  console.log('3. From JSON string:');
  console.log('   node scripts/importLiveData.js \'[{"name":"Example","type":"loan"}]\'');
  console.log('');
  console.log('📋 Expected product format:');
  console.log(JSON.stringify({
    product: "Business Term Loan",
    productCategory: "term_loan",
    lender: "Example Bank",
    description: "Fixed-rate term loan for businesses",
    minAmountUsd: 10000,
    maxAmountUsd: 500000,
    interestRateMin: 5.5,
    interestRateMax: 12.5,
    termMinMonths: 12,
    termMaxMonths: 60,
    requiredDocs: ["bank_statements", "tax_returns"],
    isActive: true
  }, null, 2));
}

// Command line usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const dataArg = process.argv[2];
  
  if (!dataArg) {
    await exampleUsage();
    process.exit(0);
  }
  
  try {
    const result = await importLiveData(dataArg);
    console.log('🎉 Live data import successful!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Import failed:', error.message);
    process.exit(1);
  }
}

export { importLiveData };