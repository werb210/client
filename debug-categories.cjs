/**
 * Debug Categories - Count unique product categories in the database
 */

async function debugCategories() {
  console.log('🔍 Analyzing product categories from staff database...');
  
  try {
    const response = await fetch('https://staffportal.replit.app/api/public/lenders');
    const data = await response.json();
    
    console.log('📊 API Response Status:', response.status);
    console.log('📋 Total Products:', data.count || data.products?.length || 0);
    
    if (data.products && Array.isArray(data.products)) {
      // Extract unique categories
      const categories = [...new Set(data.products.map(p => p.category))];
      
      console.log('\n📈 PRODUCT CATEGORIES ANALYSIS:');
      console.log('Total unique categories:', categories.length);
      console.log('\nCategories found:');
      
      categories.forEach((cat, idx) => {
        const count = data.products.filter(p => p.category === cat).length;
        console.log(`${idx + 1}. ${cat} (${count} products)`);
      });
      
      console.log('\n📊 CATEGORY BREAKDOWN:');
      categories.sort().forEach(cat => {
        const products = data.products.filter(p => p.category === cat);
        console.log(`\n${cat}:`);
        products.forEach(p => {
          console.log(`  - ${p.name} (${p.lenderName}) - $${p.amountMin?.toLocaleString()}-$${p.amountMax?.toLocaleString()}`);
        });
      });
      
    } else {
      console.log('❌ No products array found in response');
    }
    
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
  }
}

debugCategories();