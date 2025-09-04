// ===========================
// FINAL VERIFICATION SCRIPT
// Paste this into browser console on Step-1 page
// ===========================

console.log('🚀 STARTING FINAL FIELD FIDELITY VERIFICATION');

// Step 1: Enable canon debug and localStorage monitoring
localStorage.setItem('bf:canon:debug','1');
const _set = localStorage.setItem.bind(localStorage);
localStorage.setItem = (k,v) => {
  try {
    console.log('[setItem]', k, JSON.parse(v));
  } catch {
    console.log('[setItem]', k, v);
  }
  return _set(k,v);
};

// Step 2: Install submission interceptor
(() => {
  const _f = window.fetch;
  window.fetch = async(u,o) => {
    if(String(u).endsWith('/v1/applications') && o?.method==='POST') {
      const b = JSON.parse(o.body||'{}');
      console.log('🚀 SUBMIT_KEYS', Object.keys(b).length);
      console.log('🚀 CANON_KEYS', Object.keys(b.application_canon||{}).length);
      console.log('🔍 HEADERS:', o.headers);
    }
    return _f(u,o);
  };
  console.log('✅ submit interceptor ON');
})();

// Step 3: Check current canonical state
const currentCanon = JSON.parse(localStorage.getItem('bf:canon:v1')||'{}');
console.log('📊 Current canonical state:', Object.keys(currentCanon).length, 'fields');
console.log('📋 Canon keys:', Object.keys(currentCanon));

// Step 4: Test field coverage
const formKeys = [
  'businessLocation', 'headquarters', 'headquartersState', 'industry', 'lookingFor', 'fundingAmount',
  'fundsPurpose', 'salesHistory', 'revenueLastYear', 'averageMonthlyRevenue', 'accountsReceivableBalance',
  'fixedAssetsValue', 'equipmentValue', 'selectedProductId', 'selectedProductName', 'selectedLenderName',
  'matchScore', 'selectedCategory', 'selectedCategoryName', 'businessName', 'businessAddress',
  'businessCity', 'businessState', 'businessZipCode', 'businessPhone', 'businessEmail', 'businessWebsite',
  'businessStartDate', 'businessStructure', 'employeeCount', 'estimatedYearlyRevenue', 'incorporationDate',
  'taxId', 'annualRevenue', 'monthlyExpenses', 'numberOfEmployees', 'totalAssets', 'totalLiabilities',
  'title', 'firstName', 'lastName', 'personalEmail', 'personalPhone', 'dateOfBirth', 'socialSecurityNumber',
  'ownershipPercentage', 'creditScore', 'personalAnnualIncome', 'applicantAddress', 'applicantCity',
  'applicantState', 'applicantPostalCode', 'yearsWithBusiness', 'previousLoans', 'bankruptcyHistory',
  'partnerFirstName', 'partnerLastName', 'partnerEmail', 'partnerPhone', 'partnerDateOfBirth',
  'partnerSinSsn', 'partnerOwnershipPercentage', 'partnerCreditScore', 'partnerPersonalAnnualIncome',
  'partnerAddress', 'partnerCity', 'partnerState', 'partnerPostalCode', 'uploadedDocuments',
  'bypassedDocuments', 'signedAt', 'documentId', 'signingUrl', 'applicationId', 'submissionStatus',
  'submittedAt', 'completed', 'communicationConsent', 'documentMaintenanceConsent'
];

const canonKeys = Object.keys(currentCanon);
const coverage = formKeys.filter(k => canonKeys.includes(k)).length;
const percentage = (coverage / formKeys.length) * 100;

console.log('📊 FIELD COVERAGE:');
console.log(`  • Form schema: ${formKeys.length} fields`);
console.log(`  • Canon state: ${canonKeys.length} fields`);
console.log(`  • Coverage: ${coverage}/${formKeys.length} (${percentage.toFixed(1)}%)`);

// Step 5: Test Step-2 business rules readiness
const step2Requirements = ['lookingFor', 'fundingAmount', 'businessLocation', 'fundsPurpose', 'accountsReceivableBalance'];
console.log('🎯 STEP-2 BUSINESS RULES:');
step2Requirements.forEach(key => {
  const value = currentCanon[key];
  const present = value !== undefined && value !== null && value !== '';
  console.log(`  • ${key}: ${present ? '✅' : '❌'} = ${JSON.stringify(value)}`);
});

// Step 6: CSP check
const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
console.log('🔒 CSP:', csp ? '✅ Present' : '❌ Missing');
if (csp) {
  console.log('  • Content:', csp.getAttribute('content').substring(0, 100) + '...');
}

// Step 7: Test sample data population
console.log('🧪 POPULATING SAMPLE DATA FOR TESTING...');
const sampleData = {
  businessLocation: 'US',
  headquarters: 'US',
  industry: 'manufacturing',
  lookingFor: 'capital',
  fundingAmount: 250000,
  fundsPurpose: 'equipment',
  salesHistory: '3+yr',
  revenueLastYear: 500000,
  averageMonthlyRevenue: 41667,
  accountsReceivableBalance: 75000,
  businessName: 'Test Canonical Corp',
  firstName: 'John',
  lastName: 'Doe'
};

const mergedCanon = { ...currentCanon, ...sampleData };
localStorage.setItem('bf:canon:v1', JSON.stringify(mergedCanon));

console.log('✅ Sample data populated. Canon now has', Object.keys(mergedCanon).length, 'fields');

console.log('🏁 VERIFICATION COMPLETE');
console.log('📋 NEXT STEPS:');
console.log('  1. Fill form fields and watch autosave logs');
console.log('  2. Navigate to /submit and click Submit Application');
console.log('  3. Check console for trace ID and payload analysis');
console.log('  4. Verify all headers are present in submit logs');

// Return summary for inspection
return {
  canonFields: Object.keys(currentCanon).length,
  sampleFields: Object.keys(mergedCanon).length,
  coverage: `${percentage.toFixed(1)}%`,
  step2Ready: step2Requirements.every(k => mergedCanon[k] != null),
  cspPresent: !!csp
};