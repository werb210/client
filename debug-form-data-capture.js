/**
 * DEBUG FORM DATA CAPTURE
 * Run this in browser console to see if form data is actually being captured
 * Tests the real issue: are the form fields empty when submitted?
 */

console.log('🧪 Form Data Capture Debug Active');

// Function to check current form values
window.checkCurrentFormValues = function() {
  console.log('\n📋 FORM DATA CAPTURE ANALYSIS');
  
  // Check form inputs on current page
  const inputs = document.querySelectorAll('input, select, textarea');
  console.log(`Found ${inputs.length} form inputs on page`);
  
  inputs.forEach((input, index) => {
    if (input.name || input.id) {
      console.log(`  Input ${index}: ${input.name || input.id} = "${input.value}"`);
    }
  });
  
  // Check localStorage
  const formData = JSON.parse(localStorage.getItem('formData') || '{}');
  console.log('\n📱 localStorage formData:', formData);
  
  // Check specific critical fields
  console.log('\n🔍 Critical Field Check:');
  console.log('  - fundingAmount:', formData.fundingAmount);
  console.log('  - operatingName:', formData.operatingName);
  console.log('  - firstName:', formData.firstName);
  console.log('  - personalEmail:', formData.personalEmail);
  
  // Check if we're on Step 4
  const path = window.location.pathname;
  console.log(`\n📍 Current path: ${path}`);
  
  if (path.includes('step-4')) {
    // Check Step 4 specific form
    const firstNameInput = document.querySelector('input[name="firstName"]');
    const emailInput = document.querySelector('input[name="personalEmail"]');
    
    console.log('\n📝 Step 4 Form Fields:');
    console.log('  - firstName input value:', firstNameInput?.value);
    console.log('  - personalEmail input value:', emailInput?.value);
  }
};

// Override form submission to capture data
const originalSubmit = HTMLFormElement.prototype.submit;
HTMLFormElement.prototype.submit = function() {
  console.log('\n🚀 FORM SUBMISSION INTERCEPTED');
  console.log('Form data being submitted:');
  
  const formData = new FormData(this);
  for (let [key, value] of formData.entries()) {
    console.log(`  ${key}: ${value}`);
  }
  
  return originalSubmit.call(this);
};

console.log('💡 Form data capture debugging enabled');
console.log('💡 Use checkCurrentFormValues() to inspect current form state');
console.log('💡 Form submissions will be logged automatically');

// Auto-check form values every 5 seconds
setInterval(() => {
  const path = window.location.pathname;
  if (path.includes('step-4')) {
    const firstNameInput = document.querySelector('input[name="firstName"]');
    const emailInput = document.querySelector('input[name="personalEmail"]');
    
    if (firstNameInput && firstNameInput.value) {
      console.log('✅ Step 4 firstName has value:', firstNameInput.value);
    }
    if (emailInput && emailInput.value) {
      console.log('✅ Step 4 email has value:', emailInput.value);
    }
  }
}, 5000);