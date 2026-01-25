import { parseCurrencyAmount } from "./productSelection";

export type RequirementsContext = {
  amountRequested?: string | number | null;
  productType?: string | null;
};

export type ConditionalRequirement = {
  label: string;
  documents: string[];
  applies: boolean;
};

export type NormalizedRequirements = {
  required: string[];
  optional: string[];
  conditional: ConditionalRequirement[];
};

function toArray(value: unknown) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function extractDocuments(entry: any): string[] {
  const candidates = [
    entry?.documents,
    entry?.docs,
    entry?.requiredDocs,
    entry?.document_categories,
    entry?.documentCategories,
  ];
  for (const candidate of candidates) {
    const docs = toArray(candidate)
      .filter((doc) => typeof doc === "string")
      .map((doc) => doc.trim())
      .filter(Boolean);
    if (docs.length) return docs;
  }
  if (typeof entry === "string") return [entry];
  if (Array.isArray(entry)) {
    return entry.filter((doc) => typeof doc === "string");
  }
  return [];
}

function matchesProductType(
  productType: string | null | undefined,
  condition: string | string[] | undefined
) {
  if (!condition) return true;
  if (!productType) return false;
  if (Array.isArray(condition)) {
    return condition.map((value) => value.toLowerCase()).includes(productType.toLowerCase());
  }
  return condition.toLowerCase() === productType.toLowerCase();
}

function parseConditionNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

function shouldApplyCondition(entry: any, context: RequirementsContext) {
  const amount = parseCurrencyAmount(context.amountRequested ?? 0);
  const minAmount =
    parseConditionNumber(entry?.min_amount) ?? parseConditionNumber(entry?.amount_min);
  const maxAmount =
    parseConditionNumber(entry?.max_amount) ?? parseConditionNumber(entry?.amount_max);
  const productTypeCondition =
    entry?.product_type ?? entry?.product_types ?? entry?.productType;

  if (typeof minAmount === "number" && amount < minAmount) return false;
  if (typeof maxAmount === "number" && amount > maxAmount) return false;
  if (!matchesProductType(context.productType, productTypeCondition)) return false;
  return true;
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function normalizeRequirements(
  raw: any,
  context: RequirementsContext
): NormalizedRequirements {
  const data = raw?.data ?? raw ?? {};
  const required = toArray(data.required ?? data.requiredDocs ?? data.required_docs)
    .filter((doc) => typeof doc === "string") as string[];
  const optional = toArray(data.optional ?? data.optionalDocs ?? data.optional_docs)
    .filter((doc) => typeof doc === "string") as string[];

  const conditionalRaw = toArray(
    data.conditional ?? data.conditionalDocs ?? data.conditional_docs
  );
  const conditional = conditionalRaw
    .map((entry: any) => {
      const documents = extractDocuments(entry);
      const label =
        entry?.label ||
        entry?.condition ||
        entry?.description ||
        "Conditional documents";
      return {
        label,
        documents,
        applies: shouldApplyCondition(entry, context),
      } as ConditionalRequirement;
    })
    .filter((entry) => entry.documents.length > 0);

  return {
    required: unique(required),
    optional: unique(optional),
    conditional,
  };
}

export function getRequiredDocuments(requirements: NormalizedRequirements) {
  const conditionalRequired = requirements.conditional
    .filter((entry) => entry.applies)
    .flatMap((entry) => entry.documents);
  return unique([...requirements.required, ...conditionalRequired]);
}
