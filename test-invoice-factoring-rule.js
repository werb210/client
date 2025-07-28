// Test Invoice Factoring exclusion rule
import fetch from 'node-fetch';

async function testInvoiceFactoringRule() {
  console.log('🧪 Testing Invoice Factoring exclusion rule...\n');

  // Test 1: With Account Receivables - should include Invoice Factoring
  console.log('Test 1: WITH Account Receivables (should include Invoice Factoring)');
  const withARParams = new URLSearchParams({
    country: 'canada',
    lookingFor: 'capital',
    fundingAmount: '$50000',
    accountsReceivableBalance: '100k-250k' // Has AR
  });

  try {
    const response1 = await fetch(`http://localhost:5000/api/loan-products/categories?${withARParams.toString()}`);
    const data1 = await response1.json();
    
    const hasInvoiceFactoring = data1.data.some(cat => 
      cat.category.toLowerCase().includes('invoice') || 
      cat.category.toLowerCase().includes('factoring')
    );
    
    console.log(`✅ Found categories: ${data1.data.map(c => c.category).join(', ')}`);
    console.log(`✅ Invoice Factoring included: ${hasInvoiceFactoring ? 'YES' : 'NO'}`);
    console.log(`✅ Total products: ${data1.totalProducts}\n`);
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
  }

  // Test 2: NO Account Receivables - should exclude Invoice Factoring
  console.log('Test 2: NO Account Receivables (should exclude Invoice Factoring)');
  const noARParams = new URLSearchParams({
    country: 'canada',
    lookingFor: 'capital',
    fundingAmount: '$50000',
    accountsReceivableBalance: 'none' // No AR
  });

  try {
    const response2 = await fetch(`http://localhost:5000/api/loan-products/categories?${noARParams.toString()}`);
    const data2 = await response2.json();
    
    const hasInvoiceFactoring = data2.data.some(cat => 
      cat.category.toLowerCase().includes('invoice') || 
      cat.category.toLowerCase().includes('factoring')
    );
    
    console.log(`✅ Found categories: ${data2.data.map(c => c.category).join(', ')}`);
    console.log(`✅ Invoice Factoring included: ${hasInvoiceFactoring ? 'NO (CORRECT)' : 'YES (EXCLUDED)'}`);
    console.log(`✅ Total products: ${data2.totalProducts}\n`);
    
    if (!hasInvoiceFactoring) {
      console.log('🎉 BUSINESS RULE WORKING: Invoice Factoring correctly excluded when no Account Receivables!');
    } else {
      console.log('⚠️  BUSINESS RULE NOT WORKING: Invoice Factoring should be excluded when no Account Receivables');
    }
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
  }
}

testInvoiceFactoringRule();