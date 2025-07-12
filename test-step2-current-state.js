/**
 * Test Step 2 Current State - Browser Console Script
 * Run this in browser console to check what's happening on Step 2
 */

console.log('=== STEP 2 DIAGNOSTIC TEST ===');

// 1. Check if we're on Step 2
console.log('Current URL:', window.location.href);
console.log('Current path:', window.location.pathname);

// 2. Check if Step 2 component is mounted
const step2Elements = document.querySelectorAll('[class*="Step2"], [class*="step-2"]');
console.log('Step 2 elements found:', step2Elements.length);

// 3. Check for error messages
const errorElements = document.querySelectorAll('[class*="error"], [class*="amber"]');
console.log('Error/warning elements:', errorElements.length);
if (errorElements.length > 0) {
  errorElements.forEach((el, i) => {
    console.log(`Error element ${i}:`, el.textContent);
  });
}

// 4. Check for product cards
const productCards = document.querySelectorAll('[class*="Card"], [class*="card"]');
console.log('Product cards found:', productCards.length);

// 5. Check for funding range text
const fundingElements = Array.from(document.querySelectorAll('*')).filter(el => 
  el.textContent && el.textContent.includes('Funding Range')
);
console.log('Funding range elements:', fundingElements.length);
if (fundingElements.length > 0) {
  fundingElements.forEach((el, i) => {
    console.log(`Funding range ${i}:`, el.textContent);
  });
}

// 6. Check cache status in console logs
console.log('=== Looking for [STEP2] logs in console ===');
console.log('If you see [STEP2] Cache status logs above, that means the component is working');

// 7. Check IndexedDB cache directly
async function checkCache() {
  try {
    const request = indexedDB.open('lender-cache', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      const getRequest = store.get('products');
      
      getRequest.onsuccess = () => {
        const cached = getRequest.result;
        if (cached && cached.data) {
          console.log('✅ Cache has data:', cached.data.length, 'products');
          if (cached.data.length > 0) {
            const sample = cached.data[0];
            console.log('Sample product fields:', Object.keys(sample));
            console.log('Has minAmount:', sample.minAmount);
            console.log('Has maxAmount:', sample.maxAmount);
          }
        } else {
          console.log('❌ No cache data found');
        }
      };
    };
  } catch (e) {
    console.log('❌ Cache check error:', e.message);
  }
}

checkCache();

console.log('=== END DIAGNOSTIC ===');