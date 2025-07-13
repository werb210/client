/**
 * DEBUG STEP 4 FORM SUBMISSION
 * Run this in browser console while on Step 4 to debug form submission
 */

function checkStep4FormValues() {
  console.log('🔍 STEP 4 FORM DEBUG');
  console.log('===================');
  
  // Try to access React form state
  const forms = document.querySelectorAll('form');
  console.log('📝 Forms found:', forms.length);
  
  // Check all input fields
  const inputs = document.querySelectorAll('input, select, textarea');
  console.log('📋 Total form inputs:', inputs.length);
  
  // Check required fields specifically
  const requiredFields = [
    'input[name="applicantFirstName"]',
    'input[name="applicantLastName"]', 
    'input[name="applicantEmail"]',
    'input[name="applicantPhone"]',
    'input[name="applicantDateOfBirth"]',
    'input[name="applicantSSN"]'
  ];
  
  console.log('📊 Required Field Values:');
  requiredFields.forEach(selector => {
    const field = document.querySelector(selector);
    if (field) {
      console.log(`  ${selector}: "${field.value}" (${field.value ? 'FILLED' : 'EMPTY'})`);
    } else {
      console.log(`  ${selector}: FIELD NOT FOUND`);
    }
  });
  
  // Check continue button
  const continueButton = document.querySelector('button[type="submit"]');
  if (continueButton) {
    console.log('🔘 Continue button found:', continueButton.textContent);
    console.log('🔘 Button disabled?', continueButton.disabled);
  }
  
  // Check for error messages
  const errorMessages = document.querySelectorAll('[role="alert"], .text-red-500, .text-destructive');
  if (errorMessages.length > 0) {
    console.log('❌ Error messages found:');
    errorMessages.forEach((error, index) => {
      console.log(`  ${index + 1}: ${error.textContent}`);
    });
  } else {
    console.log('✅ No error messages visible');
  }
}

// Monitor button clicks
document.addEventListener('click', function(event) {
  if (event.target.type === 'submit' || event.target.textContent.includes('Continue')) {
    console.log('🖱️ SUBMIT/CONTINUE BUTTON CLICKED');
    console.log('🎯 Button text:', event.target.textContent);
    console.log('⏰ Click timestamp:', new Date().toISOString());
    
    // Check form state at click time
    setTimeout(() => {
      checkStep4FormValues();
    }, 100);
  }
});

console.log('🔍 Step 4 form debugging enabled. Click Continue button and check console output.');
console.log('📋 Run checkStep4FormValues() anytime to see current form state.');

// Make function globally available
window.checkStep4FormValues = checkStep4FormValues;