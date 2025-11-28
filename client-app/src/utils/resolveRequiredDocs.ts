import { LenderProduct, RequiredDoc } from "@/types/Documents";

export function resolveRequiredDocs(product: LenderProduct): RequiredDoc[] {
  if (!product) return [];

  // Sort by order field (defined on server)
  const sorted = [...product.requiredDocuments].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999)
  );

  return sorted.map((doc) => ({
    id: doc.id,
    category: doc.category,
    label: doc.label,
    description: doc.description ?? "",
    allowedMimeTypes: doc.allowedMimeTypes ?? [
      "application/pdf",
      "image/png",
      "image/jpeg",
    ],
    required: doc.required !== false,
    order: doc.order ?? 999,
  }));
}
