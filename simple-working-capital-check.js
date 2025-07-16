/**
 * Simple Working Capital Products Check
 * Copy and paste this into browser console to see your matching products
 */

fetch('/api/public/lenders')
  .then(response => response.json())
  .then(data => {
    if (data.success && data.products) {
      console.log(`📦 Total Products: ${data.products.length}`);
      
      // Filter for Working Capital in Canada for $35K
      const matches = data.products.filter(p => {
        const isWorkingCapital = p.category?.includes('Working Capital');
        const isCanada = p.country === 'CA';
        const inRange = (p.amountMin || 0) <= 35000 && (p.amountMax || 999999999) >= 35000;
        
        if (isWorkingCapital && isCanada && inRange) {
          console.log(`✅ MATCH: ${p.name} (${p.lender_name}) - $${p.amountMin}-$${p.amountMax}`);
          console.log(`   Documents: ${(p.doc_requirements || p.requiredDocuments || []).join(', ')}`);
        }
        
        return isWorkingCapital && isCanada && inRange;
      });
      
      console.log(`\n💼 Working Capital Products for Canada $35K: ${matches.length}`);
      
      // Also check other capital categories that might match
      const otherCapital = data.products.filter(p => {
        const isCapital = p.category?.includes('Line of Credit') || p.category?.includes('Term Loan');
        const isCanada = p.country === 'CA';
        const inRange = (p.amountMin || 0) <= 35000 && (p.amountMax || 999999999) >= 35000;
        
        if (isCapital && isCanada && inRange) {
          console.log(`🏦 OTHER: ${p.name} (${p.category}) - ${p.lender_name}`);
        }
        
        return isCapital && isCanada && inRange;
      });
      
      console.log(`\n🏦 Other Capital Products: ${otherCapital.length}`);
    }
  })
  .catch(err => console.error('❌ Error:', err));