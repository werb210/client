// Export complete lender database with documents for each product
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://staffportal.replit.app/api';

async function fetchAllLenderProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/public/lenders`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const products = Array.isArray(data) ? data : data.products || [];
    
    console.log('=== COMPLETE LENDER PRODUCTS DATABASE ===');
    console.log(`Total Products: ${products.length}`);
    console.log('Source: Staff Backend Database (Real Data)');
    console.log('');

    // Group by country
    const byCountry = {};
    products.forEach(product => {
      const geography = product.geography || ['Unknown'];
      // The product type is in the 'category' field and also parsed from description
      const productType = product.category || parseProductTypeFromDescription(product.description) || 'undefined';
      
      const countries = Array.isArray(geography) ? geography : [geography];
      countries.forEach(country => {
        if (!byCountry[country]) byCountry[country] = {};
        if (!byCountry[country][productType]) {
          byCountry[country][productType] = [];
        }
        byCountry[country][productType].push(product);
      });
    });

    // Display by country and category
    Object.keys(byCountry).sort().forEach(country => {
      console.log(`🌍 COUNTRY: ${country}`);
      console.log('='.repeat(60));
      
      Object.keys(byCountry[country]).sort().forEach(category => {
        console.log(`\n📊 CATEGORY: ${category.toUpperCase().replace('_', ' ')}`);
        console.log('-'.repeat(40));
        
        byCountry[country][category].forEach((product, idx) => {
          console.log(`\n${idx + 1}. ${product.productName || 'Unnamed Product'}`);
          console.log(`   Lender: ${product.lenderName || 'Unknown Lender'}`);
          console.log(`   Product ID: ${product.id || 'N/A'}`);
          
          // Amount range is in the amountRange object
          const minAmount = product.amountRange ? parseFloat(product.amountRange.min) : 0;
          const maxAmount = product.amountRange ? parseFloat(product.amountRange.max) : 0;
          console.log(`   Amount Range: $${minAmount.toLocaleString()} - $${maxAmount.toLocaleString()}`);
          
          // Product type is in category field
          const productType = product.category || parseProductTypeFromDescription(product.description) || 'undefined';
          console.log(`   Product Type: ${productType}`);
          
          const geography = product.geography || ['Unknown'];
          console.log(`   Geography: ${Array.isArray(geography) ? geography.join(', ') : geography}`);
          
          console.log(`   Active: Yes`); // Assume active since it's in the API
          
          // Parse additional data from description
          const parsedData = parseDescriptionData(product.description);
          
          if (parsedData.interestRate) {
            console.log(`   Interest Rate: ${parsedData.interestRate}`);
          }
          
          if (parsedData.terms) {
            console.log(`   Terms: ${parsedData.terms}`);
          }
          
          // Min revenue from requirements
          const minRevenue = product.requirements && product.requirements.minMonthlyRevenue 
            ? parseFloat(product.requirements.minMonthlyRevenue) 
            : null;
          if (minRevenue) {
            console.log(`   Min Monthly Revenue: $${minRevenue.toLocaleString()}`);
          }
          
          // Industries from requirements
          const industries = product.requirements && product.requirements.industries;
          if (industries && industries.length > 0) {
            console.log(`   Target Industries: ${industries.join(', ')}`);
          }
          
          // Show raw documents from description
          if (parsedData.documents) {
            console.log(`   Documents Listed: ${parsedData.documents}`);
          }
          
          console.log(`   Full Description: ${product.description || 'No description'}`);
          
          // Required documents for this specific product type
          console.log(`   📄 REQUIRED DOCUMENTS:`);
          const docs = getDocumentsForProductType(productType);
          docs.forEach(doc => console.log(`     • ${doc}`));
        });
      });
      console.log('\n' + '='.repeat(60) + '\n');
    });

    // Summary statistics
    console.log('📈 DATABASE SUMMARY STATISTICS');
    console.log('='.repeat(40));
    console.log(`Total Products: ${products.length}`);
    
    const countryStats = {};
    const categoryStats = {};
    const lenderStats = {};
    
    products.forEach(product => {
      const geography = product.geography || ['Unknown'];
      const productType = product.category || parseProductTypeFromDescription(product.description) || 'undefined';
      const lenderName = product.lenderName || 'Unknown Lender';
      
      const countries = Array.isArray(geography) ? geography : [geography];
      countries.forEach(country => {
        countryStats[country] = (countryStats[country] || 0) + 1;
      });
      categoryStats[productType] = (categoryStats[productType] || 0) + 1;
      lenderStats[lenderName] = (lenderStats[lenderName] || 0) + 1;
    });
    
    console.log('\n📍 Products by Country:');
    Object.entries(countryStats).sort().forEach(([country, count]) => {
      console.log(`  ${country}: ${count} products`);
    });
    
    console.log('\n📊 Products by Category:');
    Object.entries(categoryStats).sort().forEach(([category, count]) => {
      console.log(`  ${category}: ${count} products`);
    });
    
    console.log('\n🏦 Products by Lender:');
    Object.entries(lenderStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([lender, count]) => {
        console.log(`  ${lender}: ${count} products`);
      });

    // Amount range analysis
    const amounts = products.map(p => ({ 
      min: p.amountRange ? parseFloat(p.amountRange.min) : 0, 
      max: p.amountRange ? parseFloat(p.amountRange.max) : 0
    }));
    const minAmount = Math.min(...amounts.map(a => a.min));
    const maxAmount = Math.max(...amounts.map(a => a.max));
    
    console.log('\n💰 Funding Range Analysis:');
    console.log(`  Minimum loan amount: $${minAmount.toLocaleString()}`);
    console.log(`  Maximum loan amount: $${maxAmount.toLocaleString()}`);
    
    // Find products that match common scenarios
    console.log('\n🎯 COMMON SCENARIO MATCHES:');
    console.log('-'.repeat(30));
    
    const scenarios = [
      { name: '$40K Working Capital (US)', amount: 40000, type: ['working_capital', 'term_loan'], country: 'US' },
      { name: '$100K Equipment Financing (CA)', amount: 100000, type: ['equipment_financing'], country: 'CA' },
      { name: '$250K Term Loan (US)', amount: 250000, type: ['term_loan'], country: 'US' }
    ];
    
    scenarios.forEach(scenario => {
      const matches = products.filter(p => 
        p.geography.includes(scenario.country) &&
        scenario.type.includes(p.productType) &&
        scenario.amount >= p.minAmount &&
        scenario.amount <= p.maxAmount
      );
      
      console.log(`\n${scenario.name}:`);
      console.log(`  Found ${matches.length} matching products`);
      matches.slice(0, 3).forEach(match => {
        console.log(`    • ${match.productName} (${match.lenderName})`);
      });
    });

  } catch (error) {
    console.error('❌ Error fetching lender products:', error.message);
    console.error('This indicates the staff backend API is not accessible');
  }
}

function parseProductTypeFromDescription(description) {
  if (!description) return null;
  const match = description.match(/^(\w+)/);
  return match ? match[1] : null;
}

function parseDescriptionData(description) {
  if (!description) return {};
  
  const result = {};
  
  // Parse interest rate
  const rateMatch = description.match(/Rate: ([\d.]+)% - ([\d.]+)%/);
  if (rateMatch) {
    result.interestRate = `${rateMatch[1]}% - ${rateMatch[2]}%`;
  }
  
  // Parse terms
  const termMatch = description.match(/(\d+)-(\d+) months/);
  if (termMatch) {
    result.terms = `${termMatch[1]}-${termMatch[2]} months`;
  }
  
  // Parse documents
  const docsMatch = description.match(/Docs: (.+)$/);
  if (docsMatch) {
    result.documents = docsMatch[1];
  }
  
  return result;
}

function getDocumentsForProductType(productType) {
  const baseDocuments = [
    'Bank Statements (Last 6 months)',
    'Business Tax Returns (2-3 years)', 
    'Financial Statements (P&L and Balance Sheet)',
    'Business License or Registration',
    'Articles of Incorporation/Organization'
  ];

  const typeSpecificDocs = {
    'term_loan': [
      'Business Plan with Use of Funds',
      'Personal Financial Statement',
      'Personal Tax Returns (2 years)',
      'Collateral Documentation (if secured)',
      'Business Debt Schedule'
    ],
    'working_capital': [
      'Accounts Receivable Aging Report',
      'Inventory Reports and Valuation',
      'Recent Invoice Samples',
      'Cash Flow Projections (6-12 months)',
      'Supplier Payment Terms'
    ],
    'line_of_credit': [
      'Accounts Receivable Aging Report', 
      'Cash Flow Projections',
      'Asset/Equipment List (if applicable)',
      'Personal Guarantee Documentation',
      'Credit References'
    ],
    'equipment_financing': [
      'Equipment Quote or Purchase Invoice',
      'Equipment Specifications and Photos',
      'Insurance Documentation',
      'UCC Filing Documents (if required)',
      'Installation/Delivery Contracts'
    ],
    'invoice_factoring': [
      'Invoice Samples (90 days)',
      'Customer Credit Reports',
      'Accounts Receivable Aging Report',
      'Customer Payment History',
      'Customer Concentration Analysis'
    ],
    'purchase_order_financing': [
      'Purchase Order Documentation',
      'Customer Credit Information',
      'Supplier Contracts and Terms',
      'Historical Performance Data',
      'Customer Payment Terms'
    ],
    'asset_based_lending': [
      'Asset Appraisals (Current)',
      'Insurance Documentation',
      'UCC Search Results',
      'Collateral Documentation',
      'Environmental Assessment (if required)'
    ],
    'sba_loan': [
      'SBA Form 1919 (Borrower Information)',
      'Personal History Statement (SBA Form 912)',
      'Resume and Business References',
      'Environmental Assessment (if required)',
      'SBA Form 413 (Personal Financial Statement)'
    ]
  };

  return [...baseDocuments, ...(typeSpecificDocs[productType] || [])];
}

// Execute the export
fetchAllLenderProducts();