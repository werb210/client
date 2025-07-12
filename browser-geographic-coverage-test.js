/**
 * BROWSER CONSOLE TEST - Geographic Coverage Analysis
 * Run this in browser console to check what countries are funded
 */

async function analyzeGeographicCoverage() {
  console.log('🌍 GEOGRAPHIC COVERAGE ANALYSIS');
  console.log('='.repeat(50));

  try {
    // Fetch products from API
    const response = await fetch('/api/public/lenders');
    
    if (!response.ok) {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    const products = data.products || [];

    console.log(`📊 Total Products: ${products.length}`);
    console.log('');

    // Analyze all geographic-related fields
    const fieldAnalysis = {
      geography: new Set(),
      country: new Set(),
      region: new Set(),
      location: new Set(),
      geo: new Set()
    };

    // Sample products for detailed view
    const sampleProducts = products.slice(0, 5).map(product => ({
      name: product.name || product.lender || 'Unknown',
      lender: product.lender,
      geography: product.geography,
      country: product.country,
      region: product.region,
      location: product.location,
      geo: product.geo,
      allFields: Object.keys(product).filter(key => 
        key.toLowerCase().includes('geo') || 
        key.toLowerCase().includes('country') || 
        key.toLowerCase().includes('region') ||
        key.toLowerCase().includes('location')
      )
    }));

    // Collect all geographic data
    products.forEach(product => {
      // Geography field
      if (product.geography) {
        if (Array.isArray(product.geography)) {
          product.geography.forEach(g => fieldAnalysis.geography.add(g));
        } else {
          fieldAnalysis.geography.add(product.geography);
        }
      }

      // Country field
      if (product.country) {
        fieldAnalysis.country.add(product.country);
      }

      // Region field
      if (product.region) {
        fieldAnalysis.region.add(product.region);
      }

      // Location field
      if (product.location) {
        fieldAnalysis.location.add(product.location);
      }

      // Geo field
      if (product.geo) {
        fieldAnalysis.geo.add(product.geo);
      }
    });

    // Display findings
    console.log('🗺️ ALL GEOGRAPHIC FIELDS FOUND:');
    console.log('');

    Object.entries(fieldAnalysis).forEach(([fieldName, values]) => {
      if (values.size > 0) {
        console.log(`📍 ${fieldName.toUpperCase()} Field:`);
        [...values].sort().forEach(value => {
          const count = products.filter(p => {
            const fieldValue = p[fieldName];
            if (Array.isArray(fieldValue)) {
              return fieldValue.includes(value);
            }
            return fieldValue === value;
          }).length;
          console.log(`  ${value}: ${count} products`);
        });
        console.log('');
      }
    });

    console.log('📋 SAMPLE PRODUCTS (First 5):');
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Lender: ${product.lender}`);
      console.log(`   All Geographic Fields: ${product.allFields.join(', ') || 'None'}`);
      console.log(`   Geography: ${JSON.stringify(product.geography)}`);
      console.log(`   Country: ${product.country}`);
      console.log(`   Region: ${product.region}`);
      console.log('');
    });

    // Calculate country distribution
    const countryDistribution = {
      US: 0,
      CA: 0,
      'US/CA': 0,
      Other: 0,
      Unknown: 0
    };

    products.forEach(product => {
      let classified = false;

      // Check country field
      if (product.country) {
        if (product.country === 'US' || product.country === 'USA') {
          countryDistribution.US++;
          classified = true;
        } else if (product.country === 'CA' || product.country === 'Canada') {
          countryDistribution.CA++;
          classified = true;
        } else if (product.country === 'US/CA' || product.country === 'CA/US') {
          countryDistribution['US/CA']++;
          classified = true;
        } else {
          countryDistribution.Other++;
          classified = true;
        }
      }

      // Check geography field if country not found
      if (!classified && product.geography) {
        const geoArray = Array.isArray(product.geography) ? product.geography : [product.geography];
        
        if (geoArray.includes('US') && geoArray.includes('CA')) {
          countryDistribution['US/CA']++;
          classified = true;
        } else if (geoArray.includes('US')) {
          countryDistribution.US++;
          classified = true;
        } else if (geoArray.includes('CA')) {
          countryDistribution.CA++;
          classified = true;
        } else {
          countryDistribution.Other++;
          classified = true;
        }
      }

      if (!classified) {
        countryDistribution.Unknown++;
      }
    });

    console.log('📈 COUNTRY DISTRIBUTION:');
    Object.entries(countryDistribution).forEach(([country, count]) => {
      if (count > 0) {
        const percentage = ((count / products.length) * 100).toFixed(1);
        console.log(`  ${country}: ${count} products (${percentage}%)`);
      }
    });

    // Return summary for programmatic use
    return {
      totalProducts: products.length,
      geographicFields: Object.fromEntries(
        Object.entries(fieldAnalysis).map(([key, set]) => [key, [...set]])
      ),
      countryDistribution,
      sampleProducts
    };

  } catch (error) {
    console.log('❌ Error analyzing geographic coverage:', error.message);
    console.log('Error details:', error);
  }
}

// Instructions for use
console.log('📝 INSTRUCTIONS:');
console.log('Copy and paste this entire script into your browser console');
console.log('Then run: analyzeGeographicCoverage()');
console.log('');

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  analyzeGeographicCoverage();
}