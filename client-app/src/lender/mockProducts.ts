export const MockLenderProducts = [
  {
    id: "loc_1",
    category: "line_of_credit",
    minAmount: 10000,
    maxAmount: 250000,
    allowedCountries: ["canada", "usa"],
    requiredDocs: ["bank_statements_6m"],
    businessQuestions: ["businessAddress", "revenue"],
    applicantQuestions: ["firstName", "lastName", "email"],
  },
  {
    id: "fact_1",
    category: "factoring",
    minAmount: 5000,
    maxAmount: 500000,
    allowedCountries: ["canada"],
    requiredDocs: ["bank_statements_6m", "invoices"],
    businessQuestions: ["businessAddress", "revenue", "invoicesOutstanding"],
    applicantQuestions: ["firstName", "lastName"],
  },
  {
    id: "term_1",
    category: "term_loan",
    minAmount: 250000,
    maxAmount: 2000000,
    allowedCountries: ["usa"],
    requiredDocs: ["bank_statements_6m"],
    businessQuestions: ["businessAddress", "revenue", "yearsInBusiness"],
    applicantQuestions: ["firstName", "lastName", "email", "dob"],
  }
];

export type LenderProduct = typeof MockLenderProducts[number];
