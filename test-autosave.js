/**
 * Test Autosave Functionality
 * Check if autosave is working in localStorage
 */

function testAutosave() {
  console.log('🔍 Testing Autosave Functionality\n');
  
  // Check localStorage for autosave data
  const autosaveKey = 'borealFinancialApplicationAutoSave';
  const savedData = localStorage.getItem(autosaveKey);
  
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      console.log('✅ Autosave data found in localStorage:');
      console.log('Key:', autosaveKey);
      console.log('Data size:', savedData.length, 'characters');
      console.log('Last saved:', parsed.lastSaved || 'Unknown');
      console.log('Current step:', parsed.currentStep || 'Unknown');
      console.log('Sample fields:', Object.keys(parsed).slice(0, 10).join(', '));
      
      // Check if data is recent
      if (parsed.lastSaved) {
        const saveTime = new Date(parsed.lastSaved);
        const now = new Date();
        const minutesAgo = Math.round((now.getTime() - saveTime.getTime()) / (1000 * 60));
        console.log('Data age:', minutesAgo, 'minutes ago');
        
        if (minutesAgo < 60) {
          console.log('✅ Data is recent (less than 1 hour old)');
        } else {
          console.log('⚠️ Data is older than 1 hour');
        }
      }
    } catch (error) {
      console.error('❌ Error parsing autosave data:', error);
    }
  } else {
    console.log('❌ No autosave data found in localStorage');
    console.log('Expected key:', autosaveKey);
  }
  
  // Check for any other Boreal-related localStorage items
  console.log('\n🔍 All localStorage items:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      console.log(`${key}: ${value ? value.length : 0} characters`);
    }
  }
  
  // Test autosave creation
  console.log('\n🧪 Testing autosave creation...');
  const testData = {
    currentStep: 1,
    businessLocation: 'canada',
    lookingFor: 'capital',
    fundingAmount: '40000',
    lastSaved: new Date().toISOString()
  };
  
  try {
    localStorage.setItem(autosaveKey, JSON.stringify(testData));
    console.log('✅ Test autosave data created successfully');
    
    // Verify it can be read back
    const retrieved = localStorage.getItem(autosaveKey);
    if (retrieved) {
      const parsed = JSON.parse(retrieved);
      console.log('✅ Test autosave data retrieved successfully');
      console.log('Test data:', parsed);
    }
  } catch (error) {
    console.error('❌ Error creating test autosave data:', error);
  }
}

// Run the test
testAutosave();