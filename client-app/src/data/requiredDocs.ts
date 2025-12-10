export const RequiredDocsByDefaultCategory = {
  line_of_credit: ["bank_statements_6m"],
  factoring: ["bank_statements_6m", "invoices"],
  term_loan: ["bank_statements_6m"],
  working_capital: ["bank_statements_6m"],
  purchase_order: ["bank_statements_6m", "purchase_orders"],
  equipment_financing: ["bank_statements_6m", "equipment_quote"],
};

export const DefaultDocLabels = {
  bank_statements_6m: "Last 6 Months Bank Statements",
  invoices: "Recent Invoices",
  purchase_orders: "Purchase Orders",
  equipment_quote: "Equipment Quote",
};
