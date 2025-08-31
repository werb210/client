// Unified form data handling for all steps
export type UnifiedFormData = {
  step1?: any;
  step2?: any;
  step3?: any;
  step4?: any;
  step5?: any;
  step6?: any;
  step7?: any;
  [key: string]: any;
};

const FORM_KEY = 'bf:unified-form';

export function saveFormData(step: string, data: any): void {
  try {
    const existing = getFormData();
    const updated = { ...existing, [step]: data };
    const jsonStr = JSON.stringify(updated);
    sessionStorage.setItem(FORM_KEY, jsonStr);
    localStorage.setItem(FORM_KEY, jsonStr);
  } catch (e) {
    console.error('Failed to save form data:', e);
  }
}

export function getFormData(): UnifiedFormData {
  try {
    const data = sessionStorage.getItem(FORM_KEY) || localStorage.getItem(FORM_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function getStepData(step: string): any {
  return getFormData()[step] || {};
}

export function clearFormData(): void {
  try {
    sessionStorage.removeItem(FORM_KEY);
    localStorage.removeItem(FORM_KEY);
  } catch (e) {
    console.error('Failed to clear form data:', e);
  }
}

// Legacy compatibility - map to existing storage keys
export function saveIntake(data: any): void {
  saveFormData('step1', data);
  // Also save to legacy key for compatibility
  try {
    sessionStorage.setItem('bf:intake', JSON.stringify(data));
    localStorage.setItem('bf:intake', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save legacy intake:', e);
  }
}

export function loadIntake(): any {
  // Try new unified format first, fallback to legacy
  const step1Data = getStepData('step1');
  if (step1Data && Object.keys(step1Data).length > 0) return step1Data;
  
  try {
    const legacy = sessionStorage.getItem('bf:intake') || localStorage.getItem('bf:intake');
    return legacy ? JSON.parse(legacy) : null;
  } catch {
    return null;
  }
}

// injected: local-first products fetch
import { getProducts, loadSelectedCategories } from "../api/products";
/* injected load on mount (pseudo):
useEffect(() => { (async () => {
  const cats = loadSelectedCategories();
  const products = await getProducts({ useCacheFirst: true });
  // apply category filter if present
  const selected = cats && cats.length ? products.filter(p => cats.includes((p.category||"").toLowerCase())) : products;
  setState({ products: selected });
})(); }, []);
*/
