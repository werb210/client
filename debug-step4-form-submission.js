/**
 * DEBUG STEP 4 FORM SUBMISSION
 * Run this in browser console while on Step 4 to debug form submission
 */

console.log('🧪 Step 4 Form Submission Debug Active');

// Check current form values
function checkStep4FormValues() {
  console.log('\n📋 STEP 4 FORM VALUES CHECK');
  
  // Get form inputs
  const firstNameInput = document.querySelector('input[name="firstName"]');
  const lastNameInput = document.querySelector('input[name="lastName"]');
  const emailInput = document.querySelector('input[name="personalEmail"]');
  const phoneInput = document.querySelector('input[name="personalPhone"]');
  const titleInput = document.querySelector('input[name="title"]');
  
  console.log('📝 Form Input Values:');
  console.log('  firstName:', firstNameInput?.value);
  console.log('  lastName:', lastNameInput?.value);
  console.log('  personalEmail:', emailInput?.value);
  console.log('  personalPhone:', phoneInput?.value);
  console.log('  title:', titleInput?.value);
  
  // Check if inputs exist
  console.log('\n🔍 Input Element Check:');
  console.log('  firstName input exists:', !!firstNameInput);
  console.log('  lastName input exists:', !!lastNameInput);
  console.log('  personalEmail input exists:', !!emailInput);
  console.log('  personalPhone input exists:', !!phoneInput);
  console.log('  title input exists:', !!titleInput);
  
  // Check localStorage
  const formData = JSON.parse(localStorage.getItem('formData') || '{}');
  console.log('\n📱 localStorage formData:');
  console.log('  firstName:', formData.firstName);
  console.log('  lastName:', formData.lastName);
  console.log('  personalEmail:', formData.personalEmail);
  console.log('  personalPhone:', formData.personalPhone);
  console.log('  title:', formData.title);
  
  // Check if form is valid
  const hasRequiredFields = !!(firstNameInput?.value && lastNameInput?.value && emailInput?.value);
  console.log('\n✅ Form Ready for Submission:', hasRequiredFields);
  
  return {
    formInputs: {
      firstName: firstNameInput?.value,
      lastName: lastNameInput?.value,
      personalEmail: emailInput?.value,
      personalPhone: phoneInput?.value,
      title: titleInput?.value
    },
    localStorage: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      personalEmail: formData.personalEmail,
      personalPhone: formData.personalPhone,
      title: formData.title
    },
    isValid: hasRequiredFields
  };
}

// Auto-check form values every 3 seconds
setInterval(checkStep4FormValues, 3000);

// Manual function to call
window.checkStep4FormValues = checkStep4FormValues;

// Override form submission to see what data is being sent
const originalSubmit = HTMLFormElement.prototype.submit;
HTMLFormElement.prototype.submit = function() {
  console.log('\n🚀 STEP 4 FORM SUBMISSION INTERCEPTED');
  
  const formData = new FormData(this);
  console.log('📋 FormData being submitted:');
  for (let [key, value] of formData.entries()) {
    console.log(`  ${key}: ${value}`);
  }
  
  return originalSubmit.call(this);
};

console.log('💡 Step 4 form debugging enabled');
console.log('💡 Use checkStep4FormValues() to manually check form state');
console.log('💡 Form will be automatically checked every 3 seconds');

// Initial check
checkStep4FormValues();