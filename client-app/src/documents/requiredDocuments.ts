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
      const existing = docMap.get(entry.document_type);
      docMap.set(entry.document_type, {
        ...existing,
        ...entry,
        required: Boolean(existing?.required || entry.required),
      });
    });
  });

  return ensureAlwaysRequiredDocuments(Array.from(docMap.values()));
}

export function ensureAlwaysRequiredDocuments(
  requirements: LenderProductRequirement[]
) {
  const docMap = new Map(
    requirements.map((entry) => [entry.document_type, entry])
  );
  const alwaysRequired = ["bank_statements"];
  alwaysRequired.forEach((docType) => {
    const existing = docMap.get(docType);
    docMap.set(docType, {
      id: existing?.id ?? docType,
      document_type: docType,
      required: true,
      min_amount: existing?.min_amount ?? null,
      max_amount: existing?.max_amount ?? null,
    });
  });
  return Array.from(docMap.values());
}

export function mergeRequirementLists(
  ...lists: LenderProductRequirement[][]
) {
  const docMap = new Map<string, LenderProductRequirement>();
  lists.flat().forEach((entry) => {
    const existing = docMap.get(entry.document_type);
    docMap.set(entry.document_type, {
      ...existing,
      ...entry,
      required: Boolean(existing?.required || entry.required),
    });
  });
  return Array.from(docMap.values());
}
