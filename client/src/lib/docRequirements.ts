export type Requirement = { 
  id: string; 
  label: string; 
  optional?: boolean; 
};

export function buildRequirements(intake: any, step2: any): Requirement[] {
  const base: Requirement[] = [
    { id: 'bank_statements_3m', label: 'Bank Statements (last 3 months)' },
    { id: 'financials_y2', label: 'Financial Statements (last 2 years)' },
  ];
  
  const out = [...base];
  
  if (step2?.selectedCategory === 'invoice_factoring') {
    out.push({ id: 'ar_aging', label: 'A/R Aging Report' });
    out.push({ id: 'invoice_samples', label: 'Recent Invoice Samples' });
  }
  
  const amt = Number(intake?.fundingAmount ?? 0);
  if (amt >= 25000) {
    out.push({ id: 'personal_financial_stmt', label: 'Personal Financial Statement' });
  }
  
  return out;
}