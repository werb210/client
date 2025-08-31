import { getIntake, getStep2 } from './appState';

export const buildRequirements = () => {
  const step1 = getIntake();   // fundingAmount, country, etc.
  const step2 = getStep2();    // selectedCategory, selectedCategoryName, ...

  const base = ['bank_statements', 'financial_statements']; // always
  const byCategory: Record<string, string[]> = {
    invoice_factoring: ['ar_aging', 'invoice_samples'],
    equipment_financing: ['equipment_quote'],
    term_loan: [],
    line_of_credit: [],
    working_capital: [],
    purchase_order_financing: ['purchase_orders']
  };

  const extras = byCategory[step2?.categoryId || ''] || [];
  return [...base, ...extras];
};