/**
 * STEP 6 SIGNNOW LOOPBACK TEST
 * Complete signature workflow validation to identify 92.3% failure
 * Date: July 7, 2025
 */

async function runStep6LoopbackTest() {
  console.log('🔏 STEP 6 SIGNNOW LOOPBACK TEST');
  console.log('Testing complete signature workflow with diagnostic verification');
  
  const testResults = {
    testId: `step6-loopback-${Date.now()}`,
    startTime: new Date().toISOString(),
    formDataValidation: {},
    signingPayload: null,
    fieldAnalysis: {},
    signNowIntegration: {},
    issues: [],
    successMetrics: {}
  };
  
  try {
    // Step 1: Form Data Validation
    console.log('\n📋 STEP 1: FORM DATA VALIDATION');
    const formData = JSON.parse(localStorage.getItem('boreal-application-form') || '{}');
    
    if (Object.keys(formData).length === 0) {
      console.log('❌ No form data found - application not started');
      testResults.issues.push('No form data in localStorage');
      return testResults;
    }
    
    console.log('✅ Form data found:', Object.keys(formData).length, 'fields');
    testResults.formDataValidation.fieldsFound = Object.keys(formData).length;
    
    // Step 2: Critical Field Verification
    console.log('\n🔍 STEP 2: CRITICAL FIELD VERIFICATION');
    
    const criticalFields = {
      businessDetails: ['operatingName', 'legalName', 'businessStreetAddress', 'businessCity'],
      applicantInfo: ['firstName', 'lastName', 'personalEmail', 'ownershipPercentage'],
      financialProfile: ['businessLocation', 'industry', 'fundingAmount'],
      lenderSelection: ['selectedLenderName', 'selectedProductName']
    };
    
    const fieldStatus = {};
    let criticalFieldsPresent = 0;
    let totalCriticalFields = 0;
    
    Object.entries(criticalFields).forEach(([category, fields]) => {
      fieldStatus[category] = {};
      fields.forEach(field => {
        totalCriticalFields++;
        const isPresent = formData[field] !== undefined && formData[field] !== null && formData[field] !== '';
        fieldStatus[category][field] = isPresent;
        if (isPresent) criticalFieldsPresent++;
        console.log(`${isPresent ? '✅' : '❌'} ${category}.${field}:`, formData[field]);
      });
    });
    
    testResults.formDataValidation.criticalFieldsPresent = criticalFieldsPresent;
    testResults.formDataValidation.totalCriticalFields = totalCriticalFields;
    testResults.formDataValidation.criticalFieldsRate = (criticalFieldsPresent / totalCriticalFields * 100).toFixed(1);
    
    console.log(`📊 Critical fields: ${criticalFieldsPresent}/${totalCriticalFields} (${testResults.formDataValidation.criticalFieldsRate}%)`);
    
    // Step 3: Partner Fields Analysis (Critical Test)
    console.log('\n👥 STEP 3: PARTNER FIELDS ANALYSIS');
    
    const ownership = parseInt(formData.ownershipPercentage) || 100;
    const shouldHavePartner = ownership < 100;
    
    const partnerFields = [
      'partnerFirstName', 'partnerLastName', 'partnerEmail', 'partnerPhone',
      'partnerOwnershipPercentage', 'partnerCreditScore'
    ];
    
    const partnerFieldsPresent = partnerFields.filter(field => 
      formData[field] !== undefined && formData[field] !== null && formData[field] !== ''
    );
    
    testResults.fieldAnalysis.ownershipPercentage = ownership;
    testResults.fieldAnalysis.shouldHavePartnerFields = shouldHavePartner;
    testResults.fieldAnalysis.partnerFieldsFound = partnerFieldsPresent.length;
    testResults.fieldAnalysis.partnerFieldsList = partnerFieldsPresent;
    
    console.log('Ownership percentage:', ownership + '%');
    console.log('Should have partner fields:', shouldHavePartner);
    console.log('Partner fields found:', partnerFieldsPresent.length);
    
    if (shouldHavePartner && partnerFieldsPresent.length === 0) {
      console.log('❌ CRITICAL ISSUE: Ownership < 100% but no partner fields');
      testResults.issues.push('Partner fields missing despite ownership < 100%');
    } else if (shouldHavePartner && partnerFieldsPresent.length > 0) {
      console.log('✅ Partner fields correctly included');
      partnerFieldsPresent.forEach(field => {
        console.log(`  ${field}:`, formData[field]);
      });
    }
    
    // Step 4: Signing Payload Construction
    console.log('\n📝 STEP 4: SIGNING PAYLOAD CONSTRUCTION');
    
    const signingPayload = {
      businessDetails: {
        operatingName: formData.operatingName || formData.businessName,
        legalName: formData.legalName,
        businessStreetAddress: formData.businessStreetAddress || formData.businessAddress,
        businessCity: formData.businessCity,
        businessState: formData.businessState,
        businessPostalCode: formData.businessPostalCode,
        businessPhone: formData.businessPhone,
        employeeCount: formData.employeeCount,
        businessWebsite: formData.businessWebsite,
        businessStartDate: formData.businessStartDate,
        businessStructure: formData.businessStructure
      },
      applicantInfo: {
        title: formData.title,
        firstName: formData.firstName,
        lastName: formData.lastName,
        personalEmail: formData.personalEmail,
        personalPhone: formData.personalPhone,
        dateOfBirth: formData.dateOfBirth,
        socialSecurityNumber: formData.socialSecurityNumber,
        ownershipPercentage: formData.ownershipPercentage,
        creditScore: formData.creditScore,
        personalAnnualIncome: formData.personalAnnualIncome,
        applicantAddress: formData.applicantAddress,
        applicantCity: formData.applicantCity,
        applicantState: formData.applicantState,
        applicantPostalCode: formData.applicantPostalCode,
        yearsWithBusiness: formData.yearsWithBusiness,
        previousLoans: formData.previousLoans,
        bankruptcyHistory: formData.bankruptcyHistory
      },
      partnerInfo: shouldHavePartner ? {
        partnerFirstName: formData.partnerFirstName,
        partnerLastName: formData.partnerLastName,
        partnerEmail: formData.partnerEmail,
        partnerPhone: formData.partnerPhone,
        partnerDateOfBirth: formData.partnerDateOfBirth,
        partnerSinSsn: formData.partnerSinSsn,
        partnerOwnershipPercentage: formData.partnerOwnershipPercentage,
        partnerCreditScore: formData.partnerCreditScore,
        partnerPersonalAnnualIncome: formData.partnerPersonalAnnualIncome,
        partnerAddress: formData.partnerAddress,
        partnerCity: formData.partnerCity,
        partnerState: formData.partnerState,
        partnerPostalCode: formData.partnerPostalCode
      } : null,
      financialProfile: {
        businessLocation: formData.businessLocation,
        headquarters: formData.headquarters,
        industry: formData.industry,
        lookingFor: formData.lookingFor,
        fundingAmount: formData.fundingAmount,
        fundsPurpose: formData.fundsPurpose,
        salesHistory: formData.salesHistory,
        revenueLastYear: formData.revenueLastYear,
        averageMonthlyRevenue: formData.averageMonthlyRevenue,
        accountsReceivableBalance: formData.accountsReceivableBalance,
        fixedAssetsValue: formData.fixedAssetsValue,
        equipmentValue: formData.equipmentValue
      },
      lenderSelection: {
        selectedProductId: formData.selectedProductId,
        selectedProductName: formData.selectedProductName,
        selectedLenderName: formData.selectedLenderName,
        matchScore: formData.matchScore,
        selectedCategory: formData.selectedCategory,
        selectedCategoryName: formData.selectedCategoryName
      },
      documentInfo: {
        uploadedDocuments: formData.uploadedDocuments || [],
        bypassedDocuments: formData.bypassedDocuments || false
      }
    };
    
    testResults.signingPayload = signingPayload;
    
    // Step 5: Field Count Analysis
    console.log('\n📊 STEP 5: FIELD COUNT ANALYSIS');
    
    let totalFields = 0;
    let populatedFields = 0;
    let nullFields = [];
    
    function analyzeSection(section, sectionName) {
      if (!section) return;
      
      Object.entries(section).forEach(([key, value]) => {
        totalFields++;
        if (value !== null && value !== undefined && value !== '') {
          populatedFields++;
        } else {
          nullFields.push(`${sectionName}.${key}`);
        }
      });
    }
    
    analyzeSection(signingPayload.businessDetails, 'businessDetails');
    analyzeSection(signingPayload.applicantInfo, 'applicantInfo');
    analyzeSection(signingPayload.partnerInfo, 'partnerInfo');
    analyzeSection(signingPayload.financialProfile, 'financialProfile');
    analyzeSection(signingPayload.lenderSelection, 'lenderSelection');
    
    testResults.fieldAnalysis.totalFields = totalFields;
    testResults.fieldAnalysis.populatedFields = populatedFields;
    testResults.fieldAnalysis.nullFields = nullFields;
    testResults.fieldAnalysis.fieldCompletionRate = (populatedFields / totalFields * 100).toFixed(1);
    
    console.log('Total fields in payload:', totalFields);
    console.log('Populated fields:', populatedFields);
    console.log('Field completion rate:', testResults.fieldAnalysis.fieldCompletionRate + '%');
    
    if (nullFields.length > 0) {
      console.log('Null/empty fields:', nullFields.length);
      nullFields.forEach(field => console.log(`  ❌ ${field}`));
    }
    
    // Step 6: SignNow Integration Test
    console.log('\n🔏 STEP 6: SIGNNOW INTEGRATION TEST');
    
    if (window.location.pathname.includes('step-6') || window.location.pathname.includes('signature')) {
      console.log('✅ Currently on Step 6 signature page');
      testResults.signNowIntegration.onSignaturePage = true;
      
      // Check for iframe or embedded content
      const iframe = document.querySelector('iframe');
      const signNowContainer = document.querySelector('[class*="signnow"], [id*="signnow"]');
      
      if (iframe) {
        console.log('✅ SignNow iframe detected');
        console.log('Iframe src:', iframe.src);
        testResults.signNowIntegration.iframeDetected = true;
        testResults.signNowIntegration.iframeSrc = iframe.src;
      } else {
        console.log('⚠️ No SignNow iframe detected');
        testResults.signNowIntegration.iframeDetected = false;
      }
      
      if (signNowContainer) {
        console.log('✅ SignNow container detected');
        testResults.signNowIntegration.containerDetected = true;
      }
      
    } else {
      console.log('ℹ️ Not currently on Step 6 - navigate to signature step for full test');
      testResults.signNowIntegration.onSignaturePage = false;
    }
    
    // Step 7: Success Metrics Calculation
    console.log('\n📈 STEP 7: SUCCESS METRICS CALCULATION');
    
    const expectedFields = 58;
    const fieldSuccessRate = (populatedFields / expectedFields * 100).toFixed(1);
    const criticalFieldsSuccess = testResults.formDataValidation.criticalFieldsRate;
    const partnerFieldsSuccess = shouldHavePartner ? (partnerFieldsPresent.length > 0 ? 100 : 0) : 100;
    
    testResults.successMetrics = {
      expectedFields,
      actualFields: totalFields,
      populatedFields,
      fieldSuccessRate: parseFloat(fieldSuccessRate),
      criticalFieldsSuccess: parseFloat(criticalFieldsSuccess),
      partnerFieldsSuccess,
      overallSuccess: ((parseFloat(fieldSuccessRate) + parseFloat(criticalFieldsSuccess) + partnerFieldsSuccess) / 3).toFixed(1)
    };
    
    console.log('Expected fields:', expectedFields);
    console.log('Actual fields:', totalFields);
    console.log('Field success rate:', fieldSuccessRate + '%');
    console.log('Critical fields success:', criticalFieldsSuccess + '%');
    console.log('Partner fields success:', partnerFieldsSuccess + '%');
    console.log('Overall success rate:', testResults.successMetrics.overallSuccess + '%');
    
    // Step 8: Issue Summary
    if (testResults.issues.length > 0) {
      console.log('\n⚠️ ISSUES IDENTIFIED:');
      testResults.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    } else {
      console.log('\n✅ NO CRITICAL ISSUES IDENTIFIED');
    }
    
    // Step 9: 92.3% Analysis
    console.log('\n🎯 92.3% SUCCESS RATE ANALYSIS');
    const successRate = parseFloat(testResults.successMetrics.overallSuccess);
    
    if (successRate >= 92.3) {
      console.log(`✅ SUCCESS RATE ACHIEVED: ${successRate}% >= 92.3%`);
      testResults.successMetrics.achievedTarget = true;
    } else {
      console.log(`❌ SUCCESS RATE BELOW TARGET: ${successRate}% < 92.3%`);
      console.log('Areas needing improvement:');
      
      if (testResults.successMetrics.fieldSuccessRate < 92.3) {
        console.log(`  - Field completion: ${testResults.successMetrics.fieldSuccessRate}%`);
      }
      if (testResults.successMetrics.criticalFieldsSuccess < 92.3) {
        console.log(`  - Critical fields: ${testResults.successMetrics.criticalFieldsSuccess}%`);
      }
      if (partnerFieldsSuccess < 100 && shouldHavePartner) {
        console.log(`  - Partner fields: ${partnerFieldsSuccess}%`);
      }
      
      testResults.successMetrics.achievedTarget = false;
    }
    
    console.log('\n🔄 STEP 6 SIGNNOW LOOPBACK TEST COMPLETE');
    console.log('Test results available in testResults object');
    
    return testResults;
    
  } catch (error) {
    console.error('❌ Step 6 loopback test error:', error);
    testResults.issues.push(`Test execution error: ${error.message}`);
    return testResults;
  }
}

// Make function globally available
if (typeof window !== 'undefined') {
  window.runStep6LoopbackTest = runStep6LoopbackTest;
}

console.log('🔏 Step 6 SignNow Loopback Test Ready');
console.log('Run: runStep6LoopbackTest() to execute comprehensive validation');