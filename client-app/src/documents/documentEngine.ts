// @ts-nocheck
export function buildRequiredDocumentList(matchingProducts: unknown[]) {
  const docs = new Set<string>();

  // Always required
  docs.add("6 Months Bank Statements");

  matchingProducts.forEach((product) => {
    product.requiredDocuments.forEach((document: string) => docs.add(document));
  });

  return Array.from(docs);
}
