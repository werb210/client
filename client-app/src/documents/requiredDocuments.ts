import type { NormalizedLenderProduct } from "../lender/eligibility";
import type { LenderProductRequirement } from "../wizard/requirements";
import { filterRequirementsByAmount, normalizeRequirementList } from "../wizard/requirements";

type RequirementSource =
  | NormalizedLenderProduct
  | {
      requiredDocs?: string[];
      required_documents?: unknown;
      product_type?: string;
      name?: string;
      category?: string;
    };

export function aggregateRequiredDocuments(
  products: RequirementSource[],
  selectedCategory: string,
  amountRequested?: string | number | null
) {
  const docMap = new Map<string, LenderProductRequirement>();
  const categoryNormalized = selectedCategory?.trim();

  const filtered = categoryNormalized
    ? products.filter((product) => {
        const category =
          (product as NormalizedLenderProduct).category ||
          (product as any).product_type ||
          (product as any).name ||
          "";
        return category === categoryNormalized;
      })
    : products;

  filtered.forEach((product) => {
    const rawDocs =
      (product as NormalizedLenderProduct).requiredDocs ||
      (product as any).required_documents ||
      [];
    const normalized = normalizeRequirementList(rawDocs);
    const applicable = filterRequirementsByAmount(
      normalized,
      amountRequested ?? 0
    );
    applicable.forEach((entry) => {
      docMap.set(entry.document_type, {
        ...entry,
        required: true,
      });
    });
  });

  return Array.from(docMap.values());
}
