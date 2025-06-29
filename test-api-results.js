// Test script to fetch lender products API and output results
import fetch from 'node:fetch';

async function testLenderAPI() {
  console.log('=== LENDER PRODUCTS API TEST RESULTS ===\n');
  
  try {
    const startTime = Date.now();
    console.log('Testing endpoint: https://staffportal.replit.app/api/public/lenders');
    console.log('Request time:', new Date().toISOString());
    
    const response = await fetch('https://staffportal.replit.app/api/public/lenders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Boreal-Client/1.0'
      }
    });
    
    const endTime = Date.now();
    console.log('Response time:', (endTime - startTime) + 'ms');
    console.log('HTTP Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    console.log('\n=== RESPONSE HEADERS ===');
    for (const [key, value] of response.headers.entries()) {
      console.log(key + ':', value);
    }
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n=== API RESPONSE DATA ===');
      console.log('Response structure:', typeof data);
      console.log('Has products array:', Array.isArray(data.products));
      
      if (data.products) {
        console.log('Total products found:', data.products.length);
        
        if (data.products.length > 0) {
          console.log('\n=== PRODUCT ANALYSIS ===');
          
          // Analyze countries
          const countries = [...new Set(data.products.map(p => p.country || 'Unknown'))];
          console.log('Countries represented:', countries);
          
          // Analyze categories
          const categories = [...new Set(data.products.map(p => p.productType || 'Unknown'))];
          console.log('Product categories:', categories);
          
          // Analyze lenders
          const lenders = [...new Set(data.products.map(p => p.lenderName || 'Unknown'))];
          console.log('Unique lenders:', lenders.length);
          
          console.log('\n=== SAMPLE PRODUCTS ===');
          data.products.slice(0, 3).forEach((product, index) => {
            console.log(`\nProduct ${index + 1}:`);
            console.log('  ID:', product.id);
            console.log('  Type:', product.productType);
            console.log('  Lender:', product.lenderName);
            console.log('  Country:', product.country);
            console.log('  Amount Range: $' + (product.minAmount || 0).toLocaleString() + ' - $' + (product.maxAmount || 0).toLocaleString());
            console.log('  Interest Rate:', product.interestRate + '%');
            console.log('  Processing Time:', product.processingTime || 'N/A');
            console.log('  Industry:', product.industry || 'N/A');
            console.log('  Qualifications:', product.qualifications ? product.qualifications.join(', ') : 'N/A');
          });
          
          console.log('\n=== PRODUCTS BY COUNTRY ===');
          countries.forEach(country => {
            const countryProducts = data.products.filter(p => (p.country || 'Unknown') === country);
            console.log(`${country}: ${countryProducts.length} products`);
            countryProducts.forEach(p => {
              console.log(`  - ${p.productType} (${p.lenderName}) - ${p.interestRate}%`);
            });
          });
          
          console.log('\n=== COMPLETE RAW DATA ===');
          console.log(JSON.stringify(data, null, 2));
        } else {
          console.log('\n=== EMPTY DATABASE ===');
          console.log('No products found in database');
        }
      } else {
        console.log('\n=== UNEXPECTED RESPONSE FORMAT ===');
        console.log('Response does not contain products array');
        console.log('Full response:', JSON.stringify(data, null, 2));
      }
    } else {
      console.log('\n=== ERROR RESPONSE ===');
      const errorText = await response.text();
      console.log('Error body:', errorText);
    }
    
  } catch (error) {
    console.log('\n=== CONNECTION ERROR ===');
    console.log('Error type:', error.name);
    console.log('Error message:', error.message);
    console.log('Full error:', error);
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

testLenderAPI();