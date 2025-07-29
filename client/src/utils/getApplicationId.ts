/**
 * Utility for consistent application ID retrieval across the client application
 * Prioritizes URL parameters, then localStorage/sessionStorage
 */

export function getApplicationId(): string | null {
  // First check URL parameters (highest priority for SMS links)
  const urlParams = new URLSearchParams(window.location.search);
  const urlAppId = urlParams.get('app') || urlParams.get('id') || urlParams.get('applicationId');
  
  if (urlAppId) {
    console.log('🔍 [getApplicationId] Found in URL params:', urlAppId);
    return urlAppId;
  }
  
  // Then check localStorage and sessionStorage
  const localStorageId = localStorage.getItem('applicationId');
  const sessionStorageId = sessionStorage.getItem('applicationId');
  
  const storageId = localStorageId || sessionStorageId;
  
  if (storageId) {
    console.log('🔍 [getApplicationId] Found in storage:', storageId);
    return storageId;
  }
  
  console.log('🔍 [getApplicationId] No application ID found');
  return null;
}

/**
 * Store application ID in both localStorage and sessionStorage for maximum persistence
 */
export function storeApplicationId(applicationId: string): void {
  console.log('💾 [storeApplicationId] Storing application ID:', applicationId);
  localStorage.setItem('applicationId', applicationId);
  sessionStorage.setItem('applicationId', applicationId);
}

/**
 * Clear application ID from storage (used when starting new application)
 */
export function clearApplicationId(): void {
  console.log('🗑️ [clearApplicationId] Clearing stored application ID');
  localStorage.removeItem('applicationId');
  sessionStorage.removeItem('applicationId');
}