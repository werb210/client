/**
 * Environment Variable Debug Check
 * Run this in browser console to verify VITE_API_BASE_URL
 */

console.log('🌍 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('🔍 Expected: https://staff.boreal.financial/api');
console.log('📊 All Vite env vars:', import.meta.env);

// Test SignNow URL construction
const testApplicationId = "12345678-1234-5678-9abc-123456789012";
const signNowUrl = `${import.meta.env.VITE_API_BASE_URL}/applications/${testApplicationId}/signnow`;
console.log('📡 Constructed SignNow URL:', signNowUrl);
console.log('✅ Expected format: https://staff.boreal.financial/api/applications/[uuid]/signnow');