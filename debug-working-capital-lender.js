// Debug script to find the specific Working Capital lender for Canadian $50K request
import fetch from 'node-fetch';

async function findWorkingCapitalLender() {
  try {
    console.log('🔍 Fetching all lender products from staff API...');
    
    const response = await fetch('https://staffportal.replit.app/api/public/lenders');
    const data = await response.json();
    
    console.log(`📊 API Response type: ${typeof data}`);
    console.log(`📊 Response keys: ${Object.keys(data)}`);
    
    // Handle different response formats
    const products = Array.isArray(data) ? data : (data.data || data.products || []);
    
    console.log(`📊 Total products received: ${products.length}`);
    
    // Filter for Canadian products matching the criteria
    const canadianProducts = products.filter(product => {
      const geography = product.geography || product.country;
      return geography === 'CA' || geography === 'Canada' || geography?.includes('CA');
    });
    
    console.log(`🇨🇦 Canadian products: ${canadianProducts.length}`);
    
    // Filter for working capital category
    const workingCapitalProducts = canadianProducts.filter(product => {
      const category = product.category || product.productCategory || product.product || product.type || '';
      return category.toLowerCase().includes('working') || 
             category.toLowerCase().includes('capital') ||
             category === 'working_capital' ||
             category === 'Working Capital';
    });
    
    console.log(`💰 Working Capital products in Canada: ${workingCapitalProducts.length}`);
    
    // Filter for $50K funding amount
    const matchingProducts = workingCapitalProducts.filter(product => {
      const minAmount = product.amountRange?.min || product.minAmountUsd || product.minAmount || 0;
      const maxAmount = product.amountRange?.max || product.maxAmountUsd || product.maxAmount || Infinity;
      return 50000 >= minAmount && 50000 <= maxAmount;
    });
    
    console.log(`✅ Products matching $50K: ${matchingProducts.length}`);
    
    if (matchingProducts.length > 0) {
      console.log('\n🏦 WORKING CAPITAL LENDER DETAILS:');
      matchingProducts.forEach((product, index) => {
        console.log(`\n--- Product ${index + 1} ---`);
        console.log(`Lender: ${product.lenderName || product.lender || product.institution || 'Unknown'}`);
        console.log(`Product: ${product.productName || product.product || product.category || 'Working Capital'}`);
        console.log(`Geography: ${product.country || product.geography || 'Unknown'}`);
        console.log(`Amount Range: $${product.amountRange?.min?.toLocaleString() || 'Unknown'} - $${product.amountRange?.max?.toLocaleString() || 'Unknown'}`);
        console.log(`Terms: ${product.termMonths || product.terms || 'Unknown'} months`);
        console.log(`Interest Rate: ${product.interestRateMin || product.rate || 'Unknown'}%`);
      });
    } else {
      console.log('❌ No Working Capital products found matching criteria');
      
      console.log('\n🔍 All Canadian products for debugging:');
      canadianProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.lender || product.institution || product.name || 'Unknown'} - ${product.product || product.productCategory || product.type || 'Unknown'} (${product.geography || product.country})`);
        
        // Show all product properties for the first few
        if (index < 3) {
          console.log(`   Raw product data:`, JSON.stringify(product, null, 2));
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching lender data:', error.message);
  }
}

findWorkingCapitalLender();