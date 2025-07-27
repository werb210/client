/**
 * TEST MODE CREATION FOR LIVE APPLICANTS
 * Creates test environment for real user validation
 * Created: January 27, 2025
 */

console.log('🧪 CREATING TEST MODE FOR LIVE APPLICANTS');
console.log('=========================================');

class TestModeCreator {
  constructor() {
    this.testModeConfig = {
      enabled: true,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      features: {
        testData: true,
        debugPanel: true,
        mockResponses: true,
        realTimeValidation: true
      }
    };
    
    this.results = {
      envConfig: false,
      testRoutes: false,
      mockData: false,
      debugTools: false
    };
  }

  // Create test mode environment configuration
  createTestEnvironment() {
    console.log('\n🌍 CREATING TEST ENVIRONMENT CONFIGURATION');
    console.log('--------------------------------------------');
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Create test mode environment file
      const testEnvContent = `# TEST MODE CONFIGURATION
# Enable test mode for live applicant validation
VITE_TEST_MODE=true
VITE_TEST_MODE_VERSION=1.0.0

# Test mode features
VITE_ENABLE_DEBUG_PANEL=true
VITE_ENABLE_MOCK_RESPONSES=true
VITE_ENABLE_TEST_DATA=true
VITE_ENABLE_VALIDATION_LOGGING=true

# Test user identification
VITE_TEST_USER_PREFIX=test_
VITE_TEST_EMAIL_DOMAIN=test.example.com

# Test mode API behavior
VITE_TEST_MODE_FALLBACK=true
VITE_TEST_MODE_DELAY=100

# Debug and monitoring
VITE_CONSOLE_LOGGING=verbose
VITE_PERFORMANCE_MONITORING=true
`;
      
      fs.writeFileSync(path.join(__dirname, '../.env.test'), testEnvContent);
      
      console.log('✅ Test environment configuration created');
      console.log('✅ Debug panel enabled for test mode');
      console.log('✅ Mock responses configured');
      console.log('✅ Validation logging activated');
      
      this.results.envConfig = true;
      return true;
      
    } catch (error) {
      console.log(`❌ Test environment creation failed: ${error.message}`);
      return false;
    }
  }

  // Create test mode routes and components
  createTestRoutes() {
    console.log('\n🛣️ CREATING TEST MODE ROUTES');
    console.log('-----------------------------');
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Create test mode component
      const testModeComponent = `import React from 'react';

export const TestModeIndicator = () => {
  const isTestMode = import.meta.env.VITE_TEST_MODE === 'true';
  
  if (!isTestMode) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 z-50">
      🧪 TEST MODE ACTIVE - For validation purposes only
    </div>
  );
};

export const TestModePanel = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const isTestMode = import.meta.env.VITE_TEST_MODE === 'true';
  
  if (!isTestMode) return null;
  
  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg z-50"
      >
        🔧 Test Tools
      </button>
      
      {isOpen && (
        <div className="fixed bottom-16 right-4 bg-white border shadow-lg rounded-lg p-4 z-50 max-w-sm">
          <h3 className="font-bold mb-2">Test Mode Tools</h3>
          
          <div className="space-y-2">
            <button 
              onClick={() => window.location.href = '/dev/recommendation-debug'}
              className="block w-full text-left px-2 py-1 hover:bg-gray-100"
            >
              📊 Recommendation Debug
            </button>
            
            <button 
              onClick={() => window.location.href = '/dev/document-mapping'}
              className="block w-full text-left px-2 py-1 hover:bg-gray-100"
            >
              📄 Document Mapping
            </button>
            
            <button 
              onClick={() => console.log('Application State:', window.formDataState)}
              className="block w-full text-left px-2 py-1 hover:bg-gray-100"
            >
              🔍 View App State
            </button>
            
            <button 
              onClick={() => localStorage.clear()}
              className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-red-600"
            >
              🗑️ Clear Test Data
            </button>
          </div>
        </div>
      )}
    </>
  );
};`;
      
      const testDir = path.join(__dirname, '../client/src/components/test');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(testDir, 'TestModeComponents.tsx'), testModeComponent);
      
      console.log('✅ Test mode components created');
      console.log('✅ Test mode indicator implemented');
      console.log('✅ Test tools panel available');
      
      this.results.testRoutes = true;
      return true;
      
    } catch (error) {
      console.log(`❌ Test routes creation failed: ${error.message}`);
      return false;
    }
  }

  // Create test mode mock data
  createTestMockData() {
    console.log('\n📋 CREATING TEST MODE MOCK DATA');
    console.log('--------------------------------');
    
    try {
      const mockTestData = {
        testApplications: [
          {
            id: 'test-app-001',
            businessName: 'Test Tech Solutions',
            contact: 'John Test',
            email: 'john@test.example.com',
            amount: 75000,
            category: 'Working Capital',
            status: 'test_submitted'
          },
          {
            id: 'test-app-002', 
            businessName: 'Demo Manufacturing Co',
            contact: 'Jane Demo',
            email: 'jane@test.example.com',
            amount: 250000,
            category: 'Equipment Financing',
            status: 'test_in_review'
          }
        ],
        testDocuments: [
          { type: 'bank_statements', fileName: 'test_bank_nov_2024.pdf', size: 156700 },
          { type: 'financial_statements', fileName: 'test_financials_2024.pdf', size: 189300 },
          { type: 'business_license', fileName: 'test_license.pdf', size: 89500 }
        ],
        testLenders: [
          { name: 'Test Bank A', rate: '8.5%', terms: '5 years', category: 'Term Loans' },
          { name: 'Test Credit Union', rate: '9.2%', terms: '3 years', category: 'Working Capital' },
          { name: 'Demo Finance Co', rate: '12.1%', terms: '2 years', category: 'Equipment' }
        ],
        testValidationRules: {
          skipEmailValidation: true,
          allowTestDomains: true,
          mockApiResponses: true,
          enableDebugLogging: true
        }
      };
      
      const fs = require('fs');
      const path = require('path');
      
      fs.writeFileSync(
        path.join(__dirname, '../client/src/data/testModeData.json'),
        JSON.stringify(mockTestData, null, 2)
      );
      
      console.log('✅ Test application data created');
      console.log('✅ Test document templates available');
      console.log('✅ Test lender data configured');
      console.log('✅ Test validation rules set');
      
      this.results.mockData = true;
      return true;
      
    } catch (error) {
      console.log(`❌ Test mock data creation failed: ${error.message}`);
      return false;
    }
  }

  // Create test mode debug tools
  createDebugTools() {
    console.log('\n🔧 CREATING TEST MODE DEBUG TOOLS');
    console.log('----------------------------------');
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Create test mode utilities
      const testModeUtils = `/**
 * Test Mode Utilities
 * Debugging and validation tools for test mode
 */

export class TestModeUtils {
  static isTestMode() {
    return import.meta.env.VITE_TEST_MODE === 'true';
  }
  
  static generateTestEmail(name = 'user') {
    const timestamp = Date.now();
    return \`test.\${name}.\${timestamp}@test.example.com\`;
  }
  
  static generateTestApplicationId() {
    return \`test-\${Date.now()}-\${Math.random().toString(36).substring(2, 8)}\`;
  }
  
  static logTestEvent(event, data) {
    if (!this.isTestMode()) return;
    
    console.log(\`[TEST MODE] \${event}:\`, data);
    
    // Store test events for analysis
    const testEvents = JSON.parse(localStorage.getItem('testModeEvents') || '[]');
    testEvents.push({
      timestamp: new Date().toISOString(),
      event,
      data
    });
    localStorage.setItem('testModeEvents', JSON.stringify(testEvents));
  }
  
  static getTestEvents() {
    return JSON.parse(localStorage.getItem('testModeEvents') || '[]');
  }
  
  static clearTestData() {
    localStorage.removeItem('testModeEvents');
    localStorage.removeItem('applicationId');
    localStorage.removeItem('uploadedFiles');
    localStorage.removeItem('formDataState');
    console.log('[TEST MODE] Test data cleared');
  }
  
  static validateTestApplication(applicationData) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    // Test-specific validations
    if (!applicationData.businessName?.startsWith('Test') && 
        !applicationData.businessName?.startsWith('Demo')) {
      validation.warnings.push('Business name should start with "Test" or "Demo" in test mode');
    }
    
    if (!applicationData.email?.includes('test.example.com')) {
      validation.warnings.push('Email should use test.example.com domain in test mode');
    }
    
    return validation;
  }
  
  static getMockApiResponse(endpoint, method = 'GET') {
    const mockResponses = {
      'POST /api/public/applications': {
        success: true,
        applicationId: this.generateTestApplicationId(),
        status: 'test_created'
      },
      'POST /api/public/upload': {
        success: true,
        documentId: \`test-doc-\${Date.now()}\`,
        status: 'test_uploaded'
      },
      'PATCH /api/public/applications/finalize': {
        success: true,
        status: 'test_submitted',
        submittedAt: new Date().toISOString()
      }
    };
    
    const key = \`\${method} \${endpoint}\`;
    return mockResponses[key] || { success: true, testMode: true };
  }
}

// Make utilities available globally in test mode
if (TestModeUtils.isTestMode()) {
  window.testModeUtils = TestModeUtils;
  console.log('[TEST MODE] Debug utilities loaded');
}`;
      
      const utilsDir = path.join(__dirname, '../client/src/utils');
      if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(utilsDir, 'testModeUtils.ts'), testModeUtils);
      
      console.log('✅ Test mode utilities created');
      console.log('✅ Debug logging configured');
      console.log('✅ Mock API responses available');
      console.log('✅ Test validation tools ready');
      
      this.results.debugTools = true;
      return true;
      
    } catch (error) {
      console.log(`❌ Debug tools creation failed: ${error.message}`);
      return false;
    }
  }

  // Generate test mode summary
  generateTestModeSummary() {
    console.log('\n=========================================');
    console.log('📋 TEST MODE CREATION SUMMARY');
    console.log('=========================================');
    
    const creationActions = [
      { name: 'Environment Configuration', result: this.results.envConfig },
      { name: 'Test Routes & Components', result: this.results.testRoutes },
      { name: 'Mock Data Creation', result: this.results.mockData },
      { name: 'Debug Tools Setup', result: this.results.debugTools }
    ];
    
    creationActions.forEach((action, index) => {
      const status = action.result ? '✅ COMPLETED' : '❌ FAILED';
      console.log(`${index + 1}. ${status} ${action.name}`);
    });
    
    const successCount = creationActions.filter(a => a.result).length;
    const totalCount = creationActions.length;
    
    console.log(`\n📊 Creation Result: ${successCount}/${totalCount} actions completed`);
    
    if (successCount === totalCount) {
      console.log('\n🎉 TEST MODE SUCCESSFULLY CREATED!');
      console.log('✅ Environment configuration ready');
      console.log('✅ Test components and routes available');
      console.log('✅ Mock data and validation tools prepared');
      console.log('✅ Debug utilities and logging active');
      console.log('\n🧪 READY FOR LIVE APPLICANT TESTING');
    } else {
      console.log('\n⚠️ Some test mode creation failed - review setup');
    }
    
    console.log('\n📋 Test Mode Features:');
    console.log('   🌍 Environment: .env.test configuration');
    console.log('   🧪 Indicator: Yellow banner shows test mode active');
    console.log('   🔧 Tools Panel: Debug tools accessible via floating button');
    console.log('   📋 Mock Data: Test applications and documents available');
    console.log('   🔍 Debug Utils: Logging, validation, and analysis tools');
    console.log('   🗑️ Cleanup: Easy test data clearing functionality');
    
    console.log('\n🚀 How to Enable Test Mode:');
    console.log('   1. Copy .env.test to .env.local');
    console.log('   2. Restart the application');
    console.log('   3. Yellow test mode banner will appear');
    console.log('   4. Use floating "Test Tools" button for debug access');
    
    return {
      success: successCount === totalCount,
      completed: successCount,
      total: totalCount,
      config: this.testModeConfig,
      details: this.results
    };
  }

  // Execute test mode creation
  async createTestMode() {
    console.log('🚀 Starting test mode creation...\n');
    
    this.createTestEnvironment();
    this.createTestRoutes();
    this.createTestMockData();
    this.createDebugTools();
    
    return this.generateTestModeSummary();
  }
}

// Execute test mode creation
const testModeCreator = new TestModeCreator();
testModeCreator.createTestMode().then(results => {
  console.log('\n🎯 Test mode creation completed!');
  
  // Make results available globally
  if (typeof window !== 'undefined') {
    window.testModeResults = results;
  }
}).catch(error => {
  console.error('❌ Test mode creation failed:', error);
});