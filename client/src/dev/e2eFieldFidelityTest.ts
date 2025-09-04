// End-to-End Field Fidelity Test with One-Click Execution
export function runE2EFidelityTest() {
  console.log('🚀 STARTING E2E FIELD FIDELITY TEST');
  
  // Phase 1: Fill deterministic sample data across all steps
  const sampleData = {
    // Step 1 - Financial Profile
    businessLocation: 'US',
    headquarters: 'US', 
    headquartersState: 'CA',
    industry: 'manufacturing',
    lookingFor: 'capital',
    fundingAmount: 250000,
    fundsPurpose: 'equipment',
    salesHistory: '3+yr',
    revenueLastYear: 500000,
    averageMonthlyRevenue: 41667,
    accountsReceivableBalance: 75000,
    fixedAssetsValue: 200000,
    equipmentValue: 150000,
    
    // Step 3 - Business Details  
    businessName: 'Test Manufacturing Inc',
    businessAddress: '123 Factory St',
    businessCity: 'Los Angeles',
    businessState: 'CA',
    businessZipCode: '90210',
    businessPhone: '(555) 123-4567',
    businessEmail: 'info@testmfg.com',
    businessWebsite: 'https://testmfg.com',
    businessStartDate: '2020-01-01',
    businessStructure: 'llc',
    employeeCount: 15,
    estimatedYearlyRevenue: 600000,
    incorporationDate: '2020-01-15',
    taxId: '12-3456789',
    
    // Step 4 - Applicant Info
    title: 'CEO',
    firstName: 'John',
    lastName: 'Smith',
    personalEmail: 'john.smith@testmfg.com',
    personalPhone: '(555) 987-6543',
    dateOfBirth: '1980-05-15',
    socialSecurityNumber: '123-45-6789',
    ownershipPercentage: '100',
    creditScore: 'excellent_750_plus',
    personalAnnualIncome: '120000',
    applicantAddress: '456 Home Ave',
    applicantCity: 'Los Angeles',
    applicantState: 'CA',
    applicantPostalCode: '90211',
    yearsWithBusiness: '4',
    previousLoans: 'yes',
    bankruptcyHistory: 'no'
  };
  
  // Phase 2: Populate canonical store
  const existingCanon = JSON.parse(localStorage.getItem('bf:canon:v1') || '{}');
  const updatedCanon = { ...existingCanon, ...sampleData };
  localStorage.setItem('bf:canon:v1', JSON.stringify(updatedCanon));
  
  console.log('📊 Sample data populated:', Object.keys(sampleData).length, 'fields');
  
  // Phase 3: Wait for autosave debounce (200ms)
  return new Promise((resolve) => {
    setTimeout(() => {
      const finalCanon = JSON.parse(localStorage.getItem('bf:canon:v1') || '{}');
      console.log('📊 Final canonical state:', Object.keys(finalCanon).length, 'fields');
      
      // Phase 4: Simulate submit and capture payload
      captureSubmitPayload(finalCanon).then(resolve);
    }, 300); // 200ms debounce + 100ms buffer
  });
}

async function captureSubmitPayload(canon: Record<string, any>) {
  const traceId = crypto.randomUUID();
  const payload = {
    ...canon,
    application_canon: JSON.stringify(canon),
    application_canon_version: 'v1'
  };
  
  // Calculate payload metadata
  const payloadStr = JSON.stringify(payload);
  const payloadSize = new Blob([payloadStr]).size;
  const canonHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(canon)));
  const hashHex = Array.from(new Uint8Array(canonHash)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  console.log('🚀 SUBMIT PAYLOAD ANALYSIS:');
  console.log('  • Trace ID:', traceId);
  console.log('  • Payload size:', payloadSize, 'bytes');
  console.log('  • Canon SHA-256:', hashHex.substring(0, 16) + '...');
  console.log('  • Body keys:', Object.keys(payload).length);
  console.log('  • Canon keys:', Object.keys(canon).length);
  
  // Generate field coverage report
  generateFieldCoverageReport(canon);
  
  return {
    traceId,
    payloadSize,
    canonHash: hashHex,
    bodyKeys: Object.keys(payload).length,
    canonKeys: Object.keys(canon).length
  };
}

function generateFieldCoverageReport(canon: Record<string, any>) {
  // Import form schema keys (simplified for runtime)
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
    'applicantState', 'applicantPostalCode', 'yearsWithBusiness', 'previousLoans', 'bankruptcyHistory'
  ];
  
  const canonKeys = Object.keys(canon);
  const coverage = formKeys.filter(k => canonKeys.includes(k)).length;
  const percentage = (coverage / formKeys.length) * 100;
  
  console.log('📊 FIELD COVERAGE REPORT:');
  console.log(`  • Form schema: ${formKeys.length} fields`);
  console.log(`  • Canon state: ${canonKeys.length} fields`);
  console.log(`  • Coverage: ${coverage}/${formKeys.length} (${percentage.toFixed(1)}%)`);
  
  // Missing fields
  const missing = formKeys.filter(k => !canonKeys.includes(k));
  if (missing.length > 0) {
    console.log('  • Missing:', missing.slice(0, 5).join(', ') + (missing.length > 5 ? '...' : ''));
  }
}