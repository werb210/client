/**
 * STEP 6 STATE VALIDATION TEST
 * Test what application state is available when reaching Step 6
 * Run this in browser console on Step 6 to see step1, step3, step4 data
 */

// console.log('🧪 Step 6 State Validation Test');

// Test the FormDataContext state
function testFormDataContext() {
  // console.log('🧪 Testing FormDataContext state access...');
  
  // Try to access React context (if available in console)
  const formDataElement = document.querySelector('[data-form-context]');
  if (formDataElement) {
    // console.log('✅ FormDataContext element found');
  } else {
    console.warn('❌ FormDataContext not accessible from console');
  }
  
  // Check localStorage backup
  const savedFormData = localStorage.getItem('formData');
  if (savedFormData) {
    try {
      const parsed = JSON.parse(savedFormData);
      // console.log('📦 localStorage formData:', {
        step1: parsed.step1 || 'undefined',
        step3: parsed.step3 || 'undefined', 
        step4: parsed.step4 || 'undefined',
        rawKeys: Object.keys(parsed).join(', ')
      });
      return parsed;
    } catch (e) {
      console.error('❌ Failed to parse localStorage formData');
    }
  } else {
    console.warn('❌ No formData in localStorage');
  }
  
  return null;
}

// Test application ID persistence
function testApplicationId() {
  // console.log('🧪 Testing Application ID persistence...');
  
  const appIdFromStorage = localStorage.getItem('applicationId');
  const currentPath = window.location.pathname;
  const urlMatch = currentPath.match(/\/apply\/step-6\/([^/]+)/);
  
  // console.log('📍 Current path:', currentPath);
  // console.log('📦 Application ID from localStorage:', appIdFromStorage);
  // console.log('🔗 Application ID from URL:', urlMatch ? urlMatch[1] : 'none');
  
  return {
    fromStorage: appIdFromStorage,
    fromUrl: urlMatch ? urlMatch[1] : null
  };
}

// Test step data structure expectations
function testStepDataStructure() {
  // console.log('🧪 Testing expected step data structure...');
  
  const formData = testFormDataContext();
  if (!formData) {
    console.warn('❌ No form data available to test structure');
    return false;
  }
  
  // Check step1 structure
  if (formData.step1) {
    // console.log('✅ step1 exists:', typeof formData.step1, Object.keys(formData.step1 || {}));
  } else {
    console.warn('❌ step1 missing or undefined');
  }
  
  // Check step3 structure  
  if (formData.step3) {
    // console.log('✅ step3 exists:', typeof formData.step3, Object.keys(formData.step3 || {}));
  } else {
    console.warn('❌ step3 missing or undefined');
  }
  
  // Check step4 structure
  if (formData.step4) {
    // console.log('✅ step4 exists:', typeof formData.step4, Object.keys(formData.step4 || {}));
  } else {
    console.warn('❌ step4 missing or undefined');
  }
  
  return {
    step1: !!formData.step1,
    step3: !!formData.step3,
    step4: !!formData.step4
  };
}

// Simulate Step 6 payload check manually
function simulateStep6PayloadCheck() {
  // console.log('🧪 Simulating Step 6 payload check...');
  
  const formData = testFormDataContext();
  if (!formData) {
    console.warn('❌ Cannot simulate - no form data available');
    return;
  }
  
  // Mimic the exact logging from Step6_SignNowIntegration.tsx
  // console.log("🔍 Checking application state before submission:");
  // console.log("Sending application payload", {
    step1: formData.step1,
    step3: formData.step3,
    step4: formData.step4,
  });
  
  // Check for undefined blocks and rehydrate if needed
  if (!formData.step1 || !formData.step3 || !formData.step4) {
    console.warn("⚠️ Missing step data blocks - attempting rehydration from localStorage");
    
    // This is what the real component would see
    const result = {
      hasMissingData: true,
      missing: {
        step1: !formData.step1,
        step3: !formData.step3,
        step4: !formData.step4
      }
    };
    
    // console.log('📊 Missing data analysis:', result);
    return result;
  } else {
    // console.log('✅ All step data blocks are present');
    return { hasMissingData: false };
  }
}

// Run comprehensive test
function runStep6StateTest() {
  // console.log('🧪 Running comprehensive Step 6 state test...');
  
  const applicationIds = testApplicationId();
  const stepStructure = testStepDataStructure();
  const payloadSimulation = simulateStep6PayloadCheck();
  
  // console.log('\n📊 Test Results Summary:');
  // console.log('Application ID availability:', applicationIds);
  // console.log('Step data structure:', stepStructure);
  // console.log('Payload simulation:', payloadSimulation);
  
  // Determine if state management is working
  const stateWorking = stepStructure.step1 && stepStructure.step3 && stepStructure.step4;
  
  if (stateWorking) {
    // console.log('✅ State management appears to be working correctly');
  } else {
    // console.log('❌ State management issue detected - step data missing');
    // console.log('💡 Recommendation: Check FormDataContext provider and step data persistence');
  }
  
  return {
    applicationIds,
    stepStructure,
    payloadSimulation,
    stateWorking
  };
}

// Auto-run if on Step 6
if (window.location.pathname.includes('step-6')) {
  // console.log('🎯 Detected Step 6 - running state test automatically');
  runStep6StateTest();
} else {
  // console.log('📍 Not on Step 6 - navigate to Step 6 and run: runStep6StateTest()');
}

// Expose functions globally
window.runStep6StateTest = runStep6StateTest;
window.testFormDataContext = testFormDataContext;
window.testApplicationId = testApplicationId;
window.simulateStep6PayloadCheck = simulateStep6PayloadCheck;

export { runStep6StateTest };