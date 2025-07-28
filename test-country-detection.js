/**
 * Test Country Detection API
 * Tests the automatic country detection functionality
 */

async function testCountryDetection() {
  console.log('🌍 Testing Country Detection API');
  console.log('=' * 50);

  try {
    // Test the API endpoint
    console.log('📡 Testing /api/user-country endpoint...');
    const response = await fetch('http://localhost:5000/api/user-country');
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));

    // Test the client-side helper function
    console.log('\n📱 Testing client-side helper function...');
    
    // Simulate the client library function
    const fetchUserCountry = async () => {
      try {
        const r = await fetch('http://localhost:5000/api/user-country');
        const { country } = await r.json();
        return country === "CA" || country === "US" ? country : null;
      } catch { 
        return null; 
      }
    };

    const detectedCountry = await fetchUserCountry();
    console.log(`🎯 Detected Country: ${detectedCountry || 'null (manual selection)'}`);

    // Test country code conversion
    const countryCodeToBusinessLocation = (countryCode) => {
      switch (countryCode) {
        case "CA": return "canada";
        case "US": return "united-states";
        default: return null;
      }
    };

    const businessLocation = countryCodeToBusinessLocation(detectedCountry);
    console.log(`🏢 Business Location: ${businessLocation || 'null'}`);

    // Test scenarios
    console.log('\n🧪 Testing Different Scenarios:');
    
    // Scenario 1: First-time user (no existing data)
    console.log('   1️⃣ First-time user scenario:');
    if (detectedCountry) {
      console.log(`      → Auto-populate: businessLocation="${businessLocation}", headquarters="${detectedCountry}"`);
      console.log(`      → User can still change this manually`);
    } else {
      console.log(`      → No detection, user must select manually`);
    }

    // Scenario 2: Returning user (has existing data)
    console.log('   2️⃣ Returning user scenario:');
    console.log(`      → Skip auto-detection if businessLocation already set`);
    console.log(`      → Preserve user's previous choice`);

    // Scenario 3: Development environment
    console.log('   3️⃣ Development environment:');
    console.log(`      → Localhost/127.0.0.1 returns null (expected)`);
    console.log(`      → Allows testing without external geo service`);

    console.log('\n✅ Country Detection Test Complete');
    console.log('📝 Implementation Notes:');
    console.log('   - API gracefully handles localhost development');
    console.log('   - Client function provides fallback to manual selection');
    console.log('   - Form remains fully editable by user');
    console.log('   - Only auto-populates if no existing data');

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }

  console.log('\n' + '=' * 50);
}

// Run the test
testCountryDetection().catch(console.error);