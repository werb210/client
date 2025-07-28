// Debug script to test amount filtering logic
console.log('=== AMOUNT FILTERING DEBUG ===');

// Mock Canadian products that should match $600K
const testProducts = [
  {
    name: 'Working Capital Loan',
    category: 'Working Capital',
    country: 'Canada',
    amount_min: 15000,
    amount_max: 800000
  },
  {
    name: 'Business Line of Credit', 
    category: 'Business Line of Credit',
    country: 'Canada',
    amount_min: 50000,
    amount_max: 2000000
  },
  {
    name: 'Growth Capital Term Loan',
    category: 'Term Loan',
    country: 'Canada',
    amount_min: 50000,
    amount_max: 2000000
  }
];

// Simulate the getAmountRange function
function getAmountRange(product) {
  return {
    min: product.amount_min ?? 
         product.amountMin ?? 
         product.fundingMin ?? 
         product.minAmount ?? 
         product.min_amount ?? 
         0,
    max: product.amount_max ?? 
         product.amountMax ?? 
         product.fundingMax ?? 
         product.maxAmount ?? 
         product.max_amount ?? 
         Infinity,
  };
}

const fundingAmount = 600000; // $600K Canadian request

console.log(`Testing $${fundingAmount.toLocaleString()} request against Canadian products:`);
console.log('');

testProducts.forEach(product => {
  const range = getAmountRange(product);
  const amountMatch = fundingAmount >= range.min && fundingAmount <= range.max;
  
  console.log(`${product.name}:`);
  console.log(`  Category: ${product.category}`);
  console.log(`  Raw: min=${product.amount_min}, max=${product.amount_max}`);
  console.log(`  Parsed: min=${range.min}, max=${range.max}`);
  console.log(`  $600K >= ${range.min} && $600K <= ${range.max} = ${amountMatch}`);
  console.log(`  Result: ${amountMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
  console.log('');
});

console.log('=== EXPECTED RESULTS ===');
console.log('Working Capital Loan: ✅ SHOULD MATCH ($15K-$800K contains $600K)');
console.log('Business Line of Credit: ✅ SHOULD MATCH ($50K-$2M contains $600K)');  
console.log('Growth Capital Term Loan: ✅ SHOULD MATCH ($50K-$2M contains $600K)');