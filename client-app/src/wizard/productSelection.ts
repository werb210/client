import type { ClientLenderProduct } from "../api/lenders";
import { getCountryCode, type BusinessLocation } from "../utils/location";

export type ActiveProduct = ClientLenderProduct & { status?: string };
export type LenderGroup = {
  lenderId: string;
  lenderName: string;
  products: ActiveProduct[];
};

export function filterActiveProducts(products: ActiveProduct[]) {
  return products.filter(
    (product) => (product.status || "").toLowerCase() === "active"
  );
}

export function parseCurrencyAmount(value?: string | number | null) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = value.toString().replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function isAmountWithinRange(
  amount: number,
  minAmount?: number | null,
  maxAmount?: number | null
) {
  if (Number.isNaN(amount) || amount <= 0) return false;
  if (typeof minAmount === "number" && amount < minAmount) return false;
  if (typeof maxAmount === "number" && amount > maxAmount) return false;
  return true;
}

export function normalizeCountryCode(value?: string | BusinessLocation | null) {
  if (!value) return "";
  const trimmed = value.toString().trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return getCountryCode(value as BusinessLocation).toUpperCase();
}

export function matchesCountry(
  productCountry: string | undefined,
  applicantCountry: string
) {
  if (!productCountry) return true;
  const normalizedProduct = normalizeCountryCode(productCountry);
  if (!normalizedProduct) return true;
  return normalizedProduct === normalizeCountryCode(applicantCountry);
}

export function filterProductsForApplicant(
  products: ActiveProduct[],
  applicantCountry: string,
  amountRequested: number
) {
  return products.filter((product) => {
    const matchesLocation = matchesCountry(product.country, applicantCountry);
    const matchesAmount = isAmountWithinRange(
      amountRequested,
      product.amount_min,
      product.amount_max
    );
    return matchesLocation && matchesAmount;
  });
}

export function groupProductsByLender(products: ActiveProduct[]): LenderGroup[] {
  const grouped = new Map<string, LenderGroup>();
  products.forEach((product) => {
    const existing = grouped.get(product.lender_id);
    const lenderName =
      product.lender_name?.trim() || `Lender ${product.lender_id}`;
    const entry = existing || {
      lenderId: product.lender_id,
      lenderName,
      products: [],
    };
    entry.products.push(product);
    grouped.set(product.lender_id, entry);
  });

  return Array.from(grouped.values())
    .map((group) => ({
      ...group,
      products: [...group.products].sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    }))
    .sort((a, b) => a.lenderName.localeCompare(b.lenderName));
}
