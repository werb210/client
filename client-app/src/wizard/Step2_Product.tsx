import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getClientLenderProducts,
  type ClientLenderProduct,
  type LenderProductRequirement,
} from "../api/lenders";
import { useApplicationStore } from "../state/useApplicationStore";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { WizardLayout } from "../components/WizardLayout";
import { theme } from "../styles/theme";
import {
  filterActiveProducts,
  filterProductsForApplicant,
  groupProductsByLender,
  isAmountWithinRange,
  matchesCountry,
  parseCurrencyAmount,
  type ActiveProduct,
} from "./productSelection";
import { formatCurrencyValue, getCountryCode } from "../utils/location";
import {
  filterRequirementsByAmount,
  formatDocumentLabel,
  normalizeRequirementList,
} from "./requirements";
import { getEligibilityResult } from "../lender/eligibility";
import type { NormalizedLenderProduct } from "../lender/eligibility";

const emptyStateStyles = {
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.layout.radius,
  padding: theme.spacing.md,
  background: "rgba(220, 38, 38, 0.08)",
  color: theme.colors.textPrimary,
  fontSize: "14px",
};

function formatAmount(amount: number | null | undefined, countryCode: string) {
  if (typeof amount !== "number") return "N/A";
  return formatCurrencyValue(String(amount), countryCode) || amount.toString();
}

export function Step2_Product() {
  const { app, update } = useApplicationStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ActiveProduct[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const countryCode = useMemo(
    () => getCountryCode(app.kyc.businessLocation),
    [app.kyc.businessLocation]
  );

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === app.selectedProductId),
    [app.selectedProductId, products]
  );
  const amountValue = useMemo(
    () => parseCurrencyAmount(app.kyc.fundingAmount),
    [app.kyc.fundingAmount]
  );
  const amountValid = selectedProduct
      ? isAmountWithinRange(
        amountValue,
        selectedProduct.amount_min,
        selectedProduct.amount_max
      )
    : false;
  const amountError =
    selectedProduct && !amountValid
      ? `Requested amount must be between ${formatAmount(
          selectedProduct.amount_min,
          countryCode
        )} and ${formatAmount(selectedProduct.amount_max, countryCode)}.`
      : null;
  const amountDisplay = app.kyc.fundingAmount
    ? formatCurrencyValue(String(amountValue), countryCode) ||
      app.kyc.fundingAmount
    : "Not provided";
  const selectedRequirements = useMemo(() => {
    if (!app.selectedProductId) return [];
    const cached = app.productRequirements?.[app.selectedProductId] || [];
    return filterRequirementsByAmount(cached, app.kyc.fundingAmount);
  }, [app.kyc.fundingAmount, app.productRequirements, app.selectedProductId]);
  const requiredDocuments = useMemo(
    () => selectedRequirements.filter((entry) => entry.required),
    [selectedRequirements]
  );
  const isEquipmentIntent = useMemo(() => {
    const intent = (app.kyc.lookingFor || "").toLowerCase();
    return (
      intent.includes("equipment") ||
      (selectedProduct?.product_type || "").toLowerCase().includes("equipment")
    );
  }, [app.kyc.lookingFor, selectedProduct?.product_type]);

  const normalizedProducts = useMemo(() => {
    return products.map((product) => ({
      productId: product.id,
      category: product.product_type ?? product.name,
      minAmount: product.amount_min ?? 0,
      maxAmount: product.amount_max ?? 0,
      supportedCountries: product.country ? [product.country] : [],
      requiredDocs: normalizeRequirementList(
        product.required_documents ?? []
      ).map((entry) => entry.document_type),
    })) as NormalizedLenderProduct[];
  }, [products]);

  const eligibility = useMemo(() => {
    return getEligibilityResult(
      normalizedProducts,
      {
        fundingIntent: app.kyc.lookingFor,
        amountRequested: app.kyc.fundingAmount,
        businessLocation: app.kyc.businessLocation,
        accountsReceivableBalance: app.kyc.accountsReceivable,
      },
      app.matchPercentages
    );
  }, [
    app.kyc.accountsReceivable,
    app.kyc.businessLocation,
    app.kyc.fundingAmount,
    app.kyc.lookingFor,
    app.matchPercentages,
    normalizedProducts,
  ]);

  const categorySummaries = useMemo(() => {
    const relevant = products.filter((product) =>
      matchesCountry(product.country, countryCode)
    );
    const grouped = new Map<string, ActiveProduct[]>();
    relevant.forEach((product) => {
      const key = product.product_type ?? product.name;
      const list = grouped.get(key) || [];
      list.push(product);
      grouped.set(key, list);
    });
    return Array.from(grouped.entries())
      .map(([category, list]) => {
        const amounts = list
          .map((product) => ({
            min: product.amount_min ?? 0,
            max: product.amount_max ?? 0,
          }))
          .filter((range) => range.min || range.max);
        const min = Math.min(...amounts.map((range) => range.min || 0));
        const max = Math.max(...amounts.map((range) => range.max || 0));
        const matchingCount = list.filter((product) =>
          isAmountWithinRange(
            amountValue,
            product.amount_min,
            product.amount_max
          )
        ).length;
        return {
          category,
          totalCount: list.length,
          matchingCount,
          minAmount: Number.isFinite(min) ? min : 0,
          maxAmount: Number.isFinite(max) ? max : 0,
        };
      })
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [amountValue, countryCode, products]);

  useEffect(() => {
    if (app.currentStep !== 2) {
      update({ currentStep: 2 });
    }
  }, [app.currentStep, update]);

  useEffect(() => {
    if (!normalizedProducts.length) return;
    update({
      eligibleProducts: eligibility.eligibleProducts,
      eligibleCategories: eligibility.categories,
      eligibilityReasons: eligibility.reasons,
    });
  }, [eligibility, normalizedProducts.length, update]);

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await getClientLenderProducts();
        const activeProducts = filterActiveProducts(
          rows as ActiveProduct[]
        ).sort((a, b) => a.name.localeCompare(b.name));
        const requirementsMap = Object.fromEntries(
          activeProducts.map((product) => [
            product.id,
            normalizeRequirementList(product.required_documents ?? []),
          ])
        );
        if (active) {
          setProducts(activeProducts);
          if (Object.keys(requirementsMap).length > 0) {
            update({
              productRequirements: {
                ...(app.productRequirements || {}),
                ...requirementsMap,
              },
            });
          }
          if (
            app.selectedProductId &&
            !activeProducts.some((product) => product.id === app.selectedProductId)
          ) {
            update({
              selectedProduct: undefined,
              selectedProductId: undefined,
              selectedProductType: undefined,
              documents: {},
              documentsDeferred: false,
            });
          }
        }
      } catch (error) {
        console.error("Failed to load lender products:", error);
        if (active) {
          setLoadError(
            "Unable to load lender products. Please refresh or try again later."
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [app.selectedProductId, update]);

  function select(product: ClientLenderProduct) {
    update({
      productCategory: null,
      selectedProduct: {
        id: product.id,
        name: product.name,
        product_type: product.product_type ?? product.name,
        lender_id: product.lender_id,
      },
      selectedProductId: product.id,
      selectedProductType: product.product_type ?? product.name,
      documents: {},
      documentsDeferred: false,
    });
  }

  function goBack() {
    navigate("/apply/step-1");
  }

  function goNext() {
    if (
      !selectedProduct ||
      !amountValid ||
      loadError
    ) {
      return;
    }
    navigate("/apply/step-3");
  }

  const filteredProducts = useMemo(
    () => filterProductsForApplicant(products, countryCode, amountValue),
    [amountValue, countryCode, products]
  );
  const groupedProducts = useMemo(
    () => groupProductsByLender(filteredProducts),
    [filteredProducts]
  );
  const noProducts = !isLoading && filteredProducts.length === 0 && !loadError;

  useEffect(() => {
    if (
      app.selectedProductId &&
      !filteredProducts.some((product) => product.id === app.selectedProductId)
    ) {
      update({
        selectedProduct: undefined,
        selectedProductId: undefined,
        selectedProductType: undefined,
        documents: {},
        documentsDeferred: false,
      });
    }
  }, [app.selectedProductId, filteredProducts, update]);

  return (
    <WizardLayout>
      <StepHeader step={2} title="Product Category Selection" />

      <Card className="space-y-4">
        {categorySummaries.length > 0 && (
          <div
            style={{
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.layout.radius,
              padding: theme.spacing.md,
              background: "rgba(59, 130, 246, 0.08)",
            }}
          >
            <div className="text-sm uppercase tracking-[0.18em] text-slate-400">
              Product categories
            </div>
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              {categorySummaries.map((summary) => {
                const amountTooLow =
                  amountValue > 0 && summary.matchingCount === 0 &&
                  amountValue < summary.minAmount;
                const amountTooHigh =
                  amountValue > 0 && summary.matchingCount === 0 &&
                  amountValue > summary.maxAmount;
                return (
                  <div
                    key={summary.category}
                    className="rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-borealBlue">
                        {summary.category}
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {summary.matchingCount} match{summary.matchingCount === 1 ? "" : "es"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Range: {formatAmount(summary.minAmount, countryCode)} to{" "}
                      {formatAmount(summary.maxAmount, countryCode)} · {summary.totalCount} total
                    </div>
                    {(amountTooLow || amountTooHigh) && (
                      <div className="text-xs text-amber-700 mt-2">
                        {amountTooLow && "Requested amount is below the minimum for this category."}
                        {amountTooHigh && "Requested amount is above the maximum for this category."}
                        <div>
                          Try between {formatAmount(summary.minAmount, countryCode)} and{" "}
                          {formatAmount(summary.maxAmount, countryCode)}.
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {loadError && <div style={emptyStateStyles}>{loadError}</div>}
        {!loadError && noProducts && (
          <div style={emptyStateStyles}>
            No products match your location and requested amount. Review the
            category ranges above for alternatives.
          </div>
        )}
        {!loadError && !noProducts && (
          <div className="space-y-4">
            <div
              style={{
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.layout.radius,
                padding: theme.spacing.md,
                background: theme.colors.background,
                fontSize: "14px",
                color: theme.colors.textSecondary,
              }}
            >
              Requested amount:{" "}
              <span style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>
                {amountDisplay}
              </span>
              {amountError && (
                <div style={{ color: "#dc2626", marginTop: theme.spacing.xs }}>
                  {amountError}
                </div>
              )}
            </div>
            <div className="space-y-6">
              {groupedProducts.map((group) => (
                <div key={group.lenderId} className="space-y-3">
                  <div
                    style={{
                      fontSize: "13px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: theme.colors.textSecondary,
                      fontWeight: 600,
                    }}
                  >
                    {group.lenderName}
                  </div>
                  <div className="grid gap-4">
                    {group.products.map((product) => {
                      const isSelected = product.id === app.selectedProductId;
                      const previewRequirements =
                        app.productRequirements?.[product.id] || [];
                      const previewRequired = filterRequirementsByAmount(
                        previewRequirements as LenderProductRequirement[],
                        app.kyc.fundingAmount
                      ).filter((entry) => entry.required);
                      const showPreview = isSelected && previewRequired.length > 0;
                      return (
                        <Card
                          key={product.id}
                          onClick={() => select(product)}
                          style={{
                            borderColor: isSelected
                              ? "#22c55e"
                              : theme.colors.border,
                            boxShadow: isSelected
                              ? "0 0 0 2px rgba(34, 197, 94, 0.24)"
                              : "0 4px 16px rgba(15, 23, 42, 0.08)",
                            cursor: "pointer",
                            background: isSelected
                              ? "rgba(34, 197, 94, 0.08)"
                              : "white",
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div
                                style={{
                                  fontSize: theme.typography.h2.fontSize,
                                  fontWeight: theme.typography.h2.fontWeight,
                                  color: theme.colors.textPrimary,
                                }}
                              >
                                {product.name}
                              </div>
                              {product.product_type && (
                                <div
                                  style={{
                                    fontSize: "14px",
                                    color: theme.colors.textSecondary,
                                  }}
                                >
                                  Type: {product.product_type}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                                <span>
                                  Country: {product.country}
                                </span>
                                <span>
                                  Min: {formatAmount(product.amount_min, countryCode)}
                                </span>
                                <span>
                                  Max: {formatAmount(product.amount_max, countryCode)}
                                </span>
                                {product.term && <span>Term: {product.term}</span>}
                                {product.rate && <span>Rate: {product.rate}</span>}
                              </div>
                              {isSelected && (
                                <div className="space-y-2 text-sm text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <span style={{ fontWeight: 600 }}>
                                      Documents Required
                                    </span>
                                    <span
                                      style={{
                                        padding: "2px 8px",
                                        borderRadius: "999px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        background: "rgba(59, 130, 246, 0.12)",
                                        color: "#1d4ed8",
                                        border:
                                          "1px solid rgba(59, 130, 246, 0.3)",
                                      }}
                                    >
                                      {requiredDocuments.length}
                                    </span>
                                  </div>
                                  {showPreview && (
                                    <ul className="list-disc pl-5 space-y-1">
                                      {previewRequired.map((entry) => (
                                        <li key={entry.id}>
                                          {formatDocumentLabel(entry.document_type)}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  {isSelected && previewRequired.length === 0 && (
                                    <div style={{ fontSize: "12px" }}>
                                      No required documents listed for this product.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: theme.spacing.xs,
                              }}
                            >
                              <input
                                type="radio"
                                checked={isSelected}
                                onChange={() => select(product)}
                                aria-label={`Select ${product.name}`}
                              />
                              {isSelected && (
                                <span
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: "999px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    background: "rgba(34, 197, 94, 0.12)",
                                    color: "#15803d",
                                    border: "1px solid rgba(34, 197, 94, 0.35)",
                                  }}
                                >
                                  Selected
                                </span>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {isEquipmentIntent && (
        <Card className="mt-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={Boolean(app.requires_closing_cost_funding)}
              onChange={(event) =>
                update({ requires_closing_cost_funding: event.target.checked })
              }
            />
            <div className="space-y-1 text-sm text-slate-600">
              <div className="font-semibold text-borealBlue">
                Need closing cost or deposit funding?
              </div>
              <div>
                Select this if you want a linked application for closing costs.
              </div>
            </div>
          </div>
        </Card>
      )}

      <div
        className="flex flex-col sm:flex-row gap-3"
        style={{ marginTop: theme.spacing.lg }}
      >
        <Button
          variant="secondary"
          style={{ width: "100%", maxWidth: "160px" }}
          onClick={goBack}
        >
          ← Back
        </Button>
        <Button
          style={{ width: "100%", maxWidth: "200px" }}
          onClick={goNext}
          disabled={
            !selectedProduct ||
            !amountValid ||
            Boolean(loadError) ||
            noProducts
          }
        >
          Continue →
        </Button>
      </div>
    </WizardLayout>
  );
}

export default Step2_Product;
