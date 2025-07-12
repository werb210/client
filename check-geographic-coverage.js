/**
 * Geographic Coverage Analysis
 * Check what countries are actually funded in the lender product database
 */

async function analyzeGeographicCoverage() {
  console.log('🌍 GEOGRAPHIC COVERAGE ANALYSIS');
  console.log('=' .repeat(50));

  try {
    // Fetch products from staff API
    const response = await fetch('/api/public/lenders');
    
    if (!response.ok) {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    const products = data.products || [];

    console.log(`📊 Total Products: ${products.length}`);
    console.log('');

    // Analyze geographic fields
    const geographySet = new Set();
    const countrySet = new Set();
    const regionSet = new Set();

    const sampleProducts = [];

    products.forEach((product, index) => {
      // Collect geography data
      if (product.geography) {
        if (Array.isArray(product.geography)) {
          product.geography.forEach(g => geographySet.add(g));
        } else {
          geographySet.add(product.geography);
        }
      }

      if (product.country) {
        countrySet.add(product.country);
      }

      if (product.region) {
        regionSet.add(product.region);
      }

      // Sample first 5 products for detailed view
      if (index < 5) {
        sampleProducts.push({
          name: product.name || product.lender,
          geography: product.geography,
          country: product.country,
          region: product.region,
          lender: product.lender
        });
      }
    });

    // Display findings
    console.log('🗺️ GEOGRAPHIC FIELDS FOUND:');
    console.log('');

    console.log('📍 Geography Field Values:');
    if (geographySet.size > 0) {
      [...geographySet].sort().forEach(geo => {
        const count = products.filter(p => 
          (Array.isArray(p.geography) && p.geography.includes(geo)) ||
          p.geography === geo
        ).length;
        console.log(`  ${geo}: ${count} products`);
      });
    } else {
      console.log('  No geography field found');
    }

    console.log('');
    console.log('🌎 Country Field Values:');
    if (countrySet.size > 0) {
      [...countrySet].sort().forEach(country => {
        const count = products.filter(p => p.country === country).length;
        console.log(`  ${country}: ${count} products`);
      });
    } else {
      console.log('  No country field found');
    }

    console.log('');
    console.log('🏠 Region Field Values:');
    if (regionSet.size > 0) {
      [...regionSet].sort().forEach(region => {
        const count = products.filter(p => p.region === region).length;
        console.log(`  ${region}: ${count} products`);
      });
    } else {
      console.log('  No region field found');
    }

    console.log('');
    console.log('📋 SAMPLE PRODUCTS (First 5):');
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Lender: ${product.lender}`);
      console.log(`   Geography: ${JSON.stringify(product.geography)}`);
      console.log(`   Country: ${product.country}`);
      console.log(`   Region: ${product.region}`);
      console.log('');
    });

    // Geographic distribution analysis
    console.log('📈 GEOGRAPHIC DISTRIBUTION:');
    const usProducts = products.filter(p => 
      p.country === 'US' || 
      p.country === 'USA' ||
      (Array.isArray(p.geography) && p.geography.includes('US')) ||
      p.geography === 'US'
    ).length;

    const caProducts = products.filter(p => 
      p.country === 'CA' || 
      p.country === 'Canada' ||
      (Array.isArray(p.geography) && p.geography.includes('CA')) ||
      p.geography === 'CA'
    ).length;

    const multiCountry = products.filter(p => 
      p.country === 'US/CA' || 
      p.country === 'CA/US' ||
      (Array.isArray(p.geography) && p.geography.includes('US') && p.geography.includes('CA'))
    ).length;

    console.log(`  🇺🇸 US Products: ${usProducts}`);
    console.log(`  🇨🇦 CA Products: ${caProducts}`);
    console.log(`  🌎 Multi-Country: ${multiCountry}`);
    console.log(`  ❓ Unknown/Other: ${products.length - usProducts - caProducts - multiCountry}`);

    return {
      totalProducts: products.length,
      geographyValues: [...geographySet],
      countryValues: [...countrySet],
      regionValues: [...regionSet],
      distribution: {
        us: usProducts,
        ca: caProducts,
        multiCountry: multiCountry,
        unknown: products.length - usProducts - caProducts - multiCountry
      }
    };

  } catch (error) {
    console.log('❌ Error analyzing geographic coverage:', error.message);
  }
}

// Auto-run when script loads
analyzeGeographicCoverage();