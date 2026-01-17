import { FundingIntent, normalizeFundingIntent } from "../constants/wizard";
import { getCountryCode } from "../utils/location";

export type NormalizedLenderProduct = {
  productId: string;
  category: string;
  minAmount: number;
  maxAmount: number;
  supportedCountries: string[];
  requiredDocs?: string[];
  businessQuestions?: string[];
  applicantQuestions?: string[];
};

export type EligibilityInput = {
  fundingIntent?: string;
  amountRequested?: number | string;
  businessLocation?: string;
  accountsReceivableBalance?: number | string;
};

export type EligibilityReasonSummary = {
  reason: string;
  count: number;
};

export type EligibilityCategorySummary = {
  name: string;
  productCount: number;
  minAmount: number;
  maxAmount: number;
  matchScore: number;
};

export type EligibilityResult = {
  eligibleProducts: NormalizedLenderProduct[];
  categories: EligibilityCategorySummary[];
  reasons: EligibilityReasonSummary[];
};

const REASONS = {
  amountBelowMin: "Requested amount below minimum",
  amountAboveMax: "Requested amount above maximum",
  unsupportedCountry: "Business location unsupported",
  factoringRequiresReceivables: "Factoring requires accounts receivable balance",
  filteredByIntent: "Filtered by funding intent",
};

function parseAmount(value?: number | string) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = value.toString().replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseAccountsReceivableBalance(value?: number | string) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const normalized = value.toString().toLowerCase();
  if (normalized.includes("no")) return 0;
  const matches = normalized.match(/\d+[\d,]*/g) || [];
  if (!matches.length) return 0;
  const numbers = matches
    .map((match) => Number.parseFloat(match.replace(/,/g, "")))
    .filter((num) => Number.isFinite(num));
  return numbers.length ? Math.max(...numbers) : 0;
}

function normalizeCountry(value?: string) {
  return getCountryCode(value).toUpperCase();
}

function applyFundingIntentGate(
  products: NormalizedLenderProduct[],
  fundingIntent?: string
) {
  const normalized = normalizeFundingIntent(fundingIntent);
  if (!normalized) {
    return { products, filteredCount: 0 };
  }

  if (normalized === FundingIntent.EQUIPMENT) {
    const filtered = products.filter(
      (product) => product.category === "Equipment Financing"
    );
    return { products: filtered, filteredCount: products.length - filtered.length };
  }

  if (normalized === FundingIntent.WORKING_CAPITAL) {
    const filtered = products.filter(
      (product) => product.category !== "Equipment Financing"
    );
    return { products: filtered, filteredCount: products.length - filtered.length };
  }

  return { products, filteredCount: 0 };
}

export function getEligibilityResult(
  products: NormalizedLenderProduct[],
  input: EligibilityInput,
  matchScores: Record<string, number> = {}
): EligibilityResult {
  const reasons = new Map<string, number>();
  const amountRequested = parseAmount(input.amountRequested);
  const accountsReceivableBalance = parseAccountsReceivableBalance(
    input.accountsReceivableBalance
  );
  const countryCode = normalizeCountry(input.businessLocation);

  const eligible = products.filter((product) => {
    const failures: string[] = [];

    if (amountRequested < product.minAmount) {
      failures.push(REASONS.amountBelowMin);
    }
    if (amountRequested > product.maxAmount) {
      failures.push(REASONS.amountAboveMax);
    }
    const supported = product.supportedCountries.map((c) => c.toUpperCase());
    if (!supported.includes(countryCode)) {
      failures.push(REASONS.unsupportedCountry);
    }
    if (product.category === "Factoring" && accountsReceivableBalance <= 0) {
      failures.push(REASONS.factoringRequiresReceivables);
    }

    if (failures.length) {
      failures.forEach((reason) =>
        reasons.set(reason, (reasons.get(reason) || 0) + 1)
      );
      return false;
    }

    return true;
  });

  const { products: gatedProducts, filteredCount } = applyFundingIntentGate(
    eligible,
    input.fundingIntent
  );

  if (filteredCount > 0) {
    reasons.set(
      REASONS.filteredByIntent,
      (reasons.get(REASONS.filteredByIntent) || 0) + filteredCount
    );
  }

  const grouped = new Map<string, EligibilityCategorySummary>();

  gatedProducts.forEach((product) => {
    const existing = grouped.get(product.category);
    if (!existing) {
      grouped.set(product.category, {
        name: product.category,
        productCount: 1,
        minAmount: product.minAmount,
        maxAmount: product.maxAmount,
        matchScore: Math.round(matchScores[product.category] ?? 50),
      });
    } else {
      grouped.set(product.category, {
        ...existing,
        productCount: existing.productCount + 1,
        minAmount: Math.min(existing.minAmount, product.minAmount),
        maxAmount: Math.max(existing.maxAmount, product.maxAmount),
      });
    }
  });

  const categories = Array.from(grouped.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const reasonSummary = Array.from(reasons.entries()).map(([reason, count]) => ({
    reason,
    count,
  }));

  return {
    eligibleProducts: gatedProducts,
    categories,
    reasons: reasonSummary,
  };
}
