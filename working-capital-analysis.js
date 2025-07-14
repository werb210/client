/**
 * US Working Capital Products Analysis
 * Based on console logs from landing page
 */

// Products from console logs analysis
const allProducts = [
  { name: 'Working Capital Loan', maxAmount: 500000 },
  { name: 'Asset-Based Line of Credit', maxAmount: 2000000 },
  { name: 'Small Business Revolver - No Borrowing Base', maxAmount: 250000 },
  { name: 'LOC', maxAmount: 5000000 },
  { name: 'MCA', maxAmount: 1000000 },
  { name: 'MCA', maxAmount: 250000 },
  { name: 'MCA', maxAmount: 150000 },
  { name: 'MCA', maxAmount: 35000 },
  { name: 'Flexline', maxAmount: 500000 },
  { name: 'Flexline', maxAmount: 250000 },
  { name: 'Flexline', maxAmount: 149000 },
  { name: 'Flexline', maxAmount: 19000 },
  { name: 'Line of credit', maxAmount: 150000 },
  { name: 'Flex Line', maxAmount: 500000 },
  { name: 'Flex Line', maxAmount: 250000 },
  { name: 'Flex Line', maxAmount: 150000 },
  { name: 'Flex Line', maxAmount: 20000 },
  { name: 'Flex Line (Updated)', maxAmount: 246000 },
  { name: 'ABL Working Capital', maxAmount: 20000000 },
  { name: 'ABL Working Capital Revolver', maxAmount: 20000000 }
];

// Filter for working capital products
const workingCapitalProducts = allProducts.filter(product => {
  const name = product.name.toLowerCase();
  return name.includes('working capital') || 
         name.includes('line of credit') || 
         name.includes('flexline') ||
         name.includes('flex line') ||
         name.includes('loc') ||
         name.includes('revolver') ||
         name.includes('abl working') ||
         name.includes('mca'); // Merchant Cash Advance is often used for working capital
});

console.log('US Working Capital Products Analysis');
console.log('==================================');
console.log('Total working capital products:', workingCapitalProducts.length);
console.log('');

workingCapitalProducts.forEach((product, index) => {
  console.log(`${index + 1}. ${product.name} - $${product.maxAmount.toLocaleString()}`);
});

console.log('');
console.log('Summary:');
console.log('- Total products:', workingCapitalProducts.length);
console.log('- Highest amount: $' + Math.max(...workingCapitalProducts.map(p => p.maxAmount)).toLocaleString());
console.log('- Lowest amount: $' + Math.min(...workingCapitalProducts.map(p => p.maxAmount)).toLocaleString());