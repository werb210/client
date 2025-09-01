export type Step2Selection = {
  selectedCategory: string;
  selectedCategoryName: string;
  selectedProductId?: string;
  selectedProductName?: string;
  selectedLenderName?: string;
  matchScore?: number;
};
const KEY = 'bf:step2';

export function saveStep2(sel: Step2Selection) {
  localStorage.setItem(KEY, JSON.stringify(sel));
  console.log('[Step2] saved', sel);
}
export function readStep2(): Step2Selection | null {
  const raw = localStorage.getItem(KEY);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}