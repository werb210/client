type Intake = { fundingAmount?: number; country?: string; [k:string]: any; };
type Step2 = { selectedCategory?: string; selectedCategoryName?: string; [k:string]: any; };

export function readIntake(): Intake | null {
  try { return JSON.parse(localStorage.getItem('bf:intake') || 'null'); } catch { return null; }
}
export function readStep2(): Step2 | null {
  try { return JSON.parse(localStorage.getItem('bf:step2') || 'null'); } catch { return null; }
}

// Minimal rules: always require core docs; add category-specific docs + amount rules
export function buildRequirements() {
  const intake = readIntake() || {};
  const step2  = readStep2()  || {};
  const base = [
    'Bank Statements (3–6 months)',
    'Business Tax Returns (2–3 years)',
    'Financial Statements (P&L and Balance Sheet)',
    'Business Registration / License'
  ];
  const cat = (step2.selectedCategory || '').toLowerCase();
  const extra: string[] = [];
  if (cat.includes('invoice') || cat.includes('factoring')) {
    extra.push('A/R Aging', 'Invoice Samples');
  }
  if (cat.includes('equipment')) {
    extra.push('Equipment Quote');
  }
  if (cat.includes('term') || cat.includes('working') || cat.includes('line of credit')) {
    if ((intake.fundingAmount || 0) >= 25000) {
      extra.push('Personal Financial Statement', 'Personal Guarantee Authorization');
    }
  }
  const required = Array.from(new Set([...base, ...extra]));
  return { intake, step2, required };
}