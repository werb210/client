import { LenderProduct } from "./mockProducts";

export function compileQuestions(products: LenderProduct[]) {
  const business = new Set<string>();
  const applicant = new Set<string>();

  products.forEach((p) => {
    p.businessQuestions.forEach((q) => business.add(q));
    p.applicantQuestions.forEach((q) => applicant.add(q));
  });

  return {
    businessQuestions: Array.from(business),
    applicantQuestions: Array.from(applicant),
  };
}

export function compileDocs(products: LenderProduct[]) {
  const docs = new Set<string>();
  products.forEach((p) => p.requiredDocs.forEach((d) => docs.add(d)));
  return Array.from(docs);
}

export function filterProductsForCategory(all: LenderProduct[], category: string) {
  return all.filter((p) => p.category === category);
}

export function filterProductsForEligibility(all: LenderProduct[], kyc: any) {
  return all.filter((p) => {
    if (!p.supportedCountries.includes(kyc.country)) return false;
    if (kyc.amount < p.minAmount) return false;
    if (kyc.amount > p.maxAmount) return false;
    if (p.category === "Factoring" && !(kyc.accountsReceivableBalance > 0)) {
      return false;
    }
    return true;
  });
}
