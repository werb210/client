// Force clear all cached data to test fresh sync
console.log('🧹 Force clearing all cached data...');

// Clear IndexedDB cache
if ('indexedDB' in window) {
  indexedDB.deleteDatabase('keyval-store').then(() => {
    console.log('✅ IndexedDB cleared');
  });
}

// Clear localStorage
localStorage.clear();
console.log('✅ localStorage cleared');

// Clear sessionStorage  
sessionStorage.clear();
console.log('✅ sessionStorage cleared');

console.log('🔄 Please refresh the page to test fresh sync');