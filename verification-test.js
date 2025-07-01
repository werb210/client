// V2 Migration Verification Test Script
const tests = [
  {
    name: "App.tsx uses V2 Design System",
    test: () => {
      const fs = require('fs');
      const appContent = fs.readFileSync('client/src/App.tsx', 'utf8');
      return appContent.includes('v2-design-system') && 
             appContent.includes('AppShell') && 
             appContent.includes('MainLayout');
    }
  },
  {
    name: "Legacy components archived",
    test: () => {
      const fs = require('fs');
      return fs.existsSync('client/src/v2-legacy-archive/ComprehensiveApplication.tsx') &&
             fs.existsSync('client/src/v2-legacy-archive/Step3BusinessDetails.tsx') &&
             fs.existsSync('client/src/v2-legacy-archive/Step4ApplicantInfo.tsx');
    }
  },
  {
    name: "V2 Design System exists",
    test: () => {
      const fs = require('fs');
      return fs.existsSync('client/src/v2-design-system/AppShell.tsx') &&
             fs.existsSync('client/src/v2-design-system/MainLayout.tsx') &&
             fs.existsSync('client/src/v2-design-system/SideBySideLayout.tsx');
    }
  },
  {
    name: "ESLint migration rules exist",
    test: () => {
      const fs = require('fs');
      return fs.existsSync('client/.eslintrc.migration.json');
    }
  },
  {
    name: "V1 routes still accessible",
    test: () => {
      const fs = require('fs');
      return fs.existsSync('client/src/routes/Step1_FinancialProfile.tsx') &&
             fs.existsSync('client/src/routes/Step2_Recommendations.tsx') &&
             fs.existsSync('client/src/pages/SideBySideApplication.tsx');
    }
  }
];

console.log('🔍 V2 Migration Verification Results:\n');

tests.forEach(test => {
  try {
    const result = test.test();
    console.log(`${result ? '✅' : '❌'} ${test.name}`);
  } catch (error) {
    console.log(`❌ ${test.name} - Error: ${error.message}`);
  }
});

console.log('\n📊 Migration Summary:');
const passed = tests.filter(test => {
  try { return test.test(); } catch { return false; }
}).length;

console.log(`${passed}/${tests.length} tests passed`);

if (passed === tests.length) {
  console.log('✅ V2 Migration verification SUCCESSFUL');
} else {
  console.log('⚠️ Some migration issues detected');
}