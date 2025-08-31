// Lightweight storage helpers used by Steps 2, 3, and 5

export type Intake = {
  amountRequested: number;
  country: 'US' | 'CA';
  industry?: string;
  structure?: 'llc' | 'corp' | 'partnership' | 'sole_prop';
};

export type Step2Selection = {
  categoryId: 'term_loan' | 'line_of_credit' | 'equipment_financing' | 'invoice_factoring' | 'purchase_order_financing' | 'working_capital';
  categoryLabel: string;
  matchScore?: number;
};

const K_INTAKE = 'bf:intake';
const K_STEP2  = 'bf:step2';

export function getIntake(): Intake | null {
  try { return JSON.parse(localStorage.getItem(K_INTAKE) || 'null'); } catch { return null; }
}
export function saveIntake(v: Intake) { localStorage.setItem(K_INTAKE, JSON.stringify(v)); }

export function getStep2(): Step2Selection | null {
  try { return JSON.parse(localStorage.getItem(K_STEP2) || 'null'); } catch { return null; }
}
export const saveStep2 = (sel: {
  selectedCategory: string;
  selectedCategoryName: string;
  selectedProductId?: string;
  selectedProductName?: string;
  selectedLenderName?: string;
  matchScore?: number;
}) => {
  localStorage.setItem('bf:step2', JSON.stringify(sel));
  (window as any).__app = (window as any).__app || { state: {} };
  (window as any).__app.state.step2 = sel;
};