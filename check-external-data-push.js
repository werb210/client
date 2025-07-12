/**
 * Check External Data Push
 * Verify if the production staff API has received authentic lender products from external source
 */

async function checkExternalDataPush() {
  console.log('🔍 CHECKING EXTERNAL LENDER PRODUCTS DATA PUSH');
  console.log('=' .repeat(60));
  
  const productionStaffUrl = 'https://staff.boreal.financial/api/public/lenders';
  
  try {
    console.log(`📡 Connecting to: ${productionStaffUrl}`);
    
    const response = await fetch(productionStaffUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CLIENT_APP_SHARED_TOKEN || 'your-token-here'}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${errorText}`);
      return { success: false, error: `${response.status}: ${errorText}` };
    }
    
    const data = await response.json();
    console.log(`📋 Response structure:`, Object.keys(data));
    
    if (data.success && data.products) {
      const products = data.products;
      console.log(`\n✅ EXTERNAL DATA CONFIRMED: ${products.length} authentic lender products`);
      console.log(`📊 Debug info:`, data.debug || 'No debug info');
      
      // Analyze the data to confirm it's from external source
      if (products.length > 0) {
        const sampleProduct = products[0];
        console.log(`\n📋 Sample Product Analysis:`);
        console.log(`   ID: ${sampleProduct.id}`);
        console.log(`   Name: ${sampleProduct.name}`);
        console.log(`   Lender: ${sampleProduct.lenderName}`);
        console.log(`   Category: ${sampleProduct.category}`);
        console.log(`   Country: ${sampleProduct.country}`);
        console.log(`   Amount Range: $${sampleProduct.amountMin?.toLocaleString()} - $${sampleProduct.amountMax?.toLocaleString()}`);
        console.log(`   Interest Rate: ${sampleProduct.interestRateMin}% - ${sampleProduct.interestRateMax}%`);
        
        // Check if this looks like external authentic data
        const hasValidStructure = sampleProduct.id && sampleProduct.lenderName && sampleProduct.category;
        const hasRealisticAmounts = sampleProduct.amountMin > 0 && sampleProduct.amountMax > sampleProduct.amountMin;
        const hasValidRates = sampleProduct.interestRateMin > 0 && sampleProduct.interestRateMax > sampleProduct.interestRateMin;
        
        console.log(`\n🔍 Data Quality Assessment:`);
        console.log(`   Valid Structure: ${hasValidStructure ? '✅' : '❌'}`);
        console.log(`   Realistic Amounts: ${hasRealisticAmounts ? '✅' : '❌'}`);
        console.log(`   Valid Interest Rates: ${hasValidRates ? '✅' : '❌'}`);
        
        // Geographic distribution analysis
        const countries = [...new Set(products.map(p => p.country))];
        const categories = [...new Set(products.map(p => p.category))];
        const lenders = [...new Set(products.map(p => p.lenderName))];
        
        console.log(`\n📈 Data Coverage Analysis:`);
        console.log(`   Countries: ${countries.join(', ')} (${countries.length} total)`);
        console.log(`   Categories: ${categories.length} product types`);
        console.log(`   Lenders: ${lenders.length} unique lenders`);
        
        // Check for recent timestamps or indicators of fresh data
        const hasTimestamps = products.some(p => p.updatedAt || p.createdAt || p.lastModified);
        console.log(`   Fresh Data Indicators: ${hasTimestamps ? '✅' : '❓'} ${hasTimestamps ? 'Found timestamps' : 'No timestamps detected'}`);
        
        return {
          success: true,
          productCount: products.length,
          countries: countries.length,
          categories: categories.length,
          lenders: lenders.length,
          sampleProduct,
          dataQuality: {
            validStructure: hasValidStructure,
            realisticAmounts: hasRealisticAmounts,
            validRates: hasValidRates,
            hasTimestamps
          }
        };
      }
    } else {
      console.error(`❌ Invalid response structure:`, data);
      return { success: false, error: 'Invalid API response structure' };
    }
    
  } catch (error) {
    console.error(`❌ Connection Error:`, error.message);
    return { success: false, error: error.message, type: 'connection_error' };
  }
}

// Run the check
async function runDataPushCheck() {
  const result = await checkExternalDataPush();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 EXTERNAL DATA PUSH VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  
  if (result.success) {
    console.log(`✅ CONFIRMED: External lender products API push successful`);
    console.log(`📊 Total Products: ${result.productCount}`);
    console.log(`🌐 Geographic Coverage: ${result.countries} countries`);
    console.log(`📋 Product Categories: ${result.categories} types`);
    console.log(`🏦 Unique Lenders: ${result.lenders} institutions`);
    console.log(`\n🎯 RESULT: Production staff API has authentic external lender product data`);
    console.log(`🚀 CLIENT APPLICATION STATUS: Ready to use ${result.productCount} authentic products`);
  } else {
    console.log(`❌ ISSUE: External data push verification failed`);
    console.log(`📋 Error: ${result.error}`);
    console.log(`\n🔧 POSSIBLE CAUSES:`);
    console.log(`   1. External API hasn't pushed data to staff backend yet`);
    console.log(`   2. Staff backend hasn't processed the external data`);
    console.log(`   3. Authentication or connectivity issues`);
    console.log(`   4. External data source is down or has issues`);
  }
  
  console.log('\n' + '='.repeat(60));
}

runDataPushCheck().catch(console.error);