// Debug script to check staff API data structure
const fetch = require('node-fetch');

async function checkStaffAPIData() {
  try {
    console.log('Fetching data from staff API...');
    const response = await fetch('https://staffportal.replit.app/api/public/lenders');
    const data = await response.json();
    
    console.log('\n=== RAW API STRUCTURE ===');
    console.log('Total products:', data.products?.length || 0);
    
    if (data.products && data.products.length > 0) {
      console.log('\nFirst product structure:');
      console.log(JSON.stringify(data.products[0], null, 2));
      
      // Check country distribution
      console.log('\n=== COUNTRY DISTRIBUTION ===');
      const countryGroups = {};
      data.products.forEach(product => {
        const country = product.country || 'UNDEFINED';
        countryGroups[country] = (countryGroups[country] || 0) + 1;
      });
      
      console.log('Country distribution:', countryGroups);
      
      // Check geography field (our normalized field)
      console.log('\n=== GEOGRAPHY FIELD CHECK ===');
      const hasGeography = data.products.some(p => p.geography && p.geography.length > 0);
      console.log('Products have geography field:', hasGeography);
      
      if (hasGeography) {
        const geographyGroups = {};
        data.products.forEach(product => {
          if (product.geography && Array.isArray(product.geography)) {
            product.geography.forEach(geo => {
              geographyGroups[geo] = (geographyGroups[geo] || 0) + 1;
            });
          }
        });
        console.log('Geography distribution:', geographyGroups);
      }
      
      // Check for Canadian lenders by name
      console.log('\n=== CANADIAN LENDER DETECTION ===');
      const canadianKeywords = ['RBC', 'TD', 'BMO', 'Scotia', 'CIBC', 'Royal Bank', 'Toronto Dominion'];
      const possibleCanadianProducts = data.products.filter(product => {
        const lenderName = product.lender_name || product.lenderName || '';
        return canadianKeywords.some(keyword => 
          lenderName.toLowerCase().includes(keyword.toLowerCase())
        );
      });
      
      console.log('Possible Canadian products by lender name:');
      possibleCanadianProducts.forEach(product => {
        console.log(`- ${product.lender_name || product.lenderName} | ${product.productName || product.name} | Country: ${product.country}`);
      });
    }
    
  } catch (error) {
    console.error('Error fetching staff API data:', error);
  }
}

checkStaffAPIData();