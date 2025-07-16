/**
 * Extract the 2 Working Capital Product Names
 * Copy and paste this into browser console for exact product details
 */

fetch('/api/public/lenders')
  .then(response => response.json())
  .then(data => {
    if (data.success && data.products) {
      const workingCapitalProducts = data.products.filter(p => p.category === 'Working Capital');
      
      console.log('💼 WORKING CAPITAL PRODUCTS (2 total):');
      console.log('=====================================');
      
      workingCapitalProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Lender: ${product.lender_name}`);
        console.log(`   Country: ${product.country}`);
        console.log(`   Amount Range: $${(product.min_amount || 0).toLocaleString()} - $${(product.max_amount || 'unlimited').toLocaleString()}`);
        console.log(`   Documents Required: ${(product.doc_requirements || []).length} (${(product.doc_requirements || []).join(', ')})`);
        console.log('');
      });
      
      // Check which ones are eligible for Canada $35K
      const eligible = workingCapitalProducts.filter(p => {
        const isCanada = p.country === 'CA';
        const minOk = (p.min_amount || 0) <= 35000;
        const maxOk = (p.max_amount || 999999999) >= 35000;
        return isCanada && minOk && maxOk;
      });
      
      console.log(`🇨🇦 Eligible for Canada $35K: ${eligible.length} products`);
      eligible.forEach(p => {
        console.log(`   ✅ ${p.name} (${p.lender_name})`);
      });
      
    } else {
      console.error('❌ Failed to fetch products');
    }
  })
  .catch(error => console.error('❌ Error:', error));