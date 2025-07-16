/**
 * Extract Working Capital Matches for Canada $35K
 * Based on the actual API response data
 */

// Simulate the API response we received
const sampleData = `[{"id":"160cea3d-6e5c-4692-aa94-b25c2cf20161","name":"Purchase Order Financing","country":"CA","category":"Purchase Order Financing","min_amount":250000,"max_amount":5000000,"min_revenue":250000,"doc_requirements":["Bank Statements","Supplier Agreement","Sample Invoices","A/P (Accounts Payable)","A/R (Accounts Receivable)","Business License","Accountant Prepared Financial Statements","Tax Returns"],"tenant_id":"00000000-0000-0000-0000-000000000000","product_name":"Purchase Order Financing","lender_name":"Capitally","product_type":null,"geography":null,"industries":null,"description":"","video_url":null,"is_active":true,"created_at":"2025-07-09 17:07:16.705","updated_at":"2025-07-12 19:55:34.169561","deleted_at":null,"interest_rate_min":1.5,"interest_rate_max":2.5,"term_min":12,"term_max":12,"rate_type":"Fixed","rate_frequency":"Monthly","min_credit_score":null,"lender_id":null},{"id":"working-capital-loan-001","name":"Working Capital Loan","country":"US","category":"Working Capital"}`;

console.log("🔍 WORKING CAPITAL PRODUCTS FOR CANADA $35K");
console.log("============================================");

// Extract what we can see from the truncated response
console.log("📦 From the API response, I can see:");
console.log("1. Capitally - Purchase Order Financing");
console.log("   - Country: CA (Canada)");
console.log("   - Amount Range: $250,000 - $5,000,000");
console.log("   - ❌ NOT eligible for $35K (minimum is $250K)");
console.log("");

console.log("2. Working Capital Loan (US product visible in data)");
console.log("   - Country: US");
console.log("   - ❌ NOT eligible for Canada");
console.log("");

console.log("🤔 The response was truncated. Let me run a browser console script to get the full data...");
console.log("");
console.log("📋 BROWSER CONSOLE SCRIPT:");
console.log("Copy and paste this into your browser console to see ALL matching products:");
console.log("");
console.log(`
fetch('/api/public/lenders')
  .then(r => r.json())
  .then(data => {
    console.log('📦 Total Products:', data.products.length);
    
    // Filter for Working Capital in Canada for $35K
    const workingCapitalMatches = data.products.filter(p => {
      const isWorkingCapital = p.category === 'Working Capital';
      const isCanada = p.country === 'CA';
      const minOk = (p.min_amount || p.amountMin || 0) <= 35000;
      const maxOk = (p.max_amount || p.amountMax || 999999999) >= 35000;
      return isWorkingCapital && isCanada && minOk && maxOk;
    });
    
    console.log('\\n💼 WORKING CAPITAL PRODUCTS FOR CANADA $35K:');
    console.log('==============================================');
    workingCapitalMatches.forEach(p => {
      console.log(\`✅ \${p.name}\`);
      console.log(\`   Lender: \${p.lender_name}\`);
      console.log(\`   Range: $\${(p.min_amount || p.amountMin || 0).toLocaleString()} - $\${(p.max_amount || p.amountMax || 'unlimited')}\`);
      console.log(\`   Documents: \${(p.doc_requirements || p.requiredDocuments || []).join(', ')}\`);
      console.log('');
    });
    
    // Also check Business Line of Credit for comparison
    const lineOfCreditMatches = data.products.filter(p => {
      const isLineOfCredit = p.category?.includes('Line of Credit');
      const isCanada = p.country === 'CA';
      const minOk = (p.min_amount || p.amountMin || 0) <= 35000;
      const maxOk = (p.max_amount || p.amountMax || 999999999) >= 35000;
      return isLineOfCredit && isCanada && minOk && maxOk;
    });
    
    console.log('\\n🏦 BUSINESS LINE OF CREDIT FOR COMPARISON:');
    console.log('==========================================');
    lineOfCreditMatches.forEach(p => {
      console.log(\`✅ \${p.name}\`);
      console.log(\`   Lender: \${p.lender_name}\`);
      console.log(\`   Range: $\${(p.min_amount || p.amountMin || 0).toLocaleString()} - $\${(p.max_amount || p.amountMax || 'unlimited')}\`);
      console.log('');
    });
    
    console.log(\`\\n📊 SUMMARY:\`);
    console.log(\`Working Capital: \${workingCapitalMatches.length} products\`);
    console.log(\`Business Line of Credit: \${lineOfCreditMatches.length} products\`);
  })
  .catch(err => console.error('❌ Error:', err));
`);