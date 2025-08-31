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
export function saveStep2(v: Step2Selection) {
  localStorage.setItem(K_STEP2, JSON.stringify(v));
  // simple runtime handshake other steps can read
  (window as any).__step2 = v;
}