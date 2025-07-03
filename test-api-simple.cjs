// Simple test using built-in fetch
async function testAPI() {
  try {
    console.log('Testing staff API...');
    
    // Use dynamic import for node-fetch
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch('https://staffportal.replit.app/api/public/lenders');
    const data = await response.json();
    
    console.log('Total products:', data.products?.length || 0);
    
    if (data.products && data.products.length > 0) {
      // Show first few products with key fields
      console.log('\nFirst 3 products:');
      data.products.slice(0, 3).forEach((product, index) => {
        console.log(`${index + 1}. ${product.productName || product.name || 'UNNAMED'}`);
        console.log(`   Lender: ${product.lender_name || product.lenderName || 'UNKNOWN'}`);
        console.log(`   Country: ${product.country || 'UNDEFINED'}`);
        console.log(`   Geography: ${JSON.stringify(product.geography || 'UNDEFINED')}`);
        console.log('');
      });
      
      // Count by country
      const countryCount = {};
      data.products.forEach(p => {
        const country = p.country || 'UNDEFINED';
        countryCount[country] = (countryCount[country] || 0) + 1;
      });
      
      console.log('Country distribution:', countryCount);
      
      // Look for potential Canadian lenders
      const canadianLenders = data.products.filter(p => {
        const lender = (p.lender_name || p.lenderName || '').toLowerCase();
        return lender.includes('rbc') || lender.includes('td ') || lender.includes('bmo') || 
               lender.includes('scotia') || lender.includes('royal bank');
      });
      
      console.log(`\nFound ${canadianLenders.length} potential Canadian lenders:`);
      canadianLenders.forEach(p => {
        console.log(`- ${p.lender_name || p.lenderName} | Country: ${p.country || 'UNDEFINED'}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();