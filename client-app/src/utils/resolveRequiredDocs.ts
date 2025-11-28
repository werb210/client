/**
 * From the server, each product includes:
 *
 * {
 *   id: "uuid",
 *   name: "Factoring",
 *   requiredDocuments: [
 *      { category: "bank_statements", label: "6 Months Bank Statements" },
 *      { category: "void_cheque", label: "Void Cheque" },
 *      ...
 *   ]
 * }
 */

export interface RequiredDoc {
  category: string;
  label: string;
}

export interface ProductConfig {
  id: string;
  name: string;
  requiredDocuments: RequiredDoc[];
}

export function resolveRequiredDocs(product: ProductConfig): RequiredDoc[] {
  if (!product || !product.requiredDocuments) return [];
  return product.requiredDocuments;
}
