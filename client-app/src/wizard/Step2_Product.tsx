import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getClientLenderProducts,
  getClientLenderProductRequirements,
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
  isAmountWithinRange,
  parseCurrencyAmount,
  type ActiveProduct,
} from "./productSelection";
import { formatCurrencyValue, getCountryCode } from "../utils/location";
import {
  filterRequirementsByAmount,
  formatDocumentLabel,
  normalizeRequirementList,
} from "./requirements";

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
  const [requirementsState, setRequirementsState] = useState<
    Record<string, { loading: boolean; error: string | null }>
  >({});
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
        selectedProduct.min_amount,
        selectedProduct.max_amount
      )
    : false;
  const amountError =
    selectedProduct && !amountValid
      ? `Requested amount must be between ${formatAmount(
          selectedProduct.min_amount,
          countryCode
        )} and ${formatAmount(selectedProduct.max_amount, countryCode)}.`
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
  const selectedRequirementStatus = app.selectedProductId
    ? requirementsState[app.selectedProductId]
    : undefined;
  const requirementsLoading = selectedRequirementStatus?.loading ?? false;
  const requirementsError = selectedRequirementStatus?.error ?? null;
  const requiredDocuments = useMemo(
    () => selectedRequirements.filter((entry) => entry.required),
    [selectedRequirements]
  );

  useEffect(() => {
    if (app.currentStep !== 2) {
      update({ currentStep: 2 });
    }
  }, [app.currentStep, update]);

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
        if (active) {
          setProducts(activeProducts);
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

  useEffect(() => {
    if (!app.selectedProductId) return;
    let active = true;

    async function loadRequirements(productId: string) {
      setRequirementsState((prev) => ({
        ...prev,
        [productId]: { loading: true, error: null },
      }));
      try {
        const response = await getClientLenderProductRequirements(productId);
        const normalized = normalizeRequirementList(response);
        if (normalized.length === 0) {
          if (active) {
            setRequirementsState((prev) => ({
              ...prev,
              [productId]: {
                loading: false,
                error:
                  "No document requirements were provided for the selected product.",
              },
            }));
          }
          return;
        }
        if (active) {
          update({
            productRequirements: {
              ...(app.productRequirements || {}),
              [productId]: normalized,
            },
          });
          setRequirementsState((prev) => ({
            ...prev,
            [productId]: { loading: false, error: null },
          }));
        }
      } catch (error) {
        console.error("Failed to load product requirements:", error);
        if (active) {
          setRequirementsState((prev) => ({
            ...prev,
            [productId]: {
              loading: false,
              error:
                "Unable to load document requirements. Please try again or select another product.",
            },
          }));
        }
      }
    }

    void loadRequirements(app.selectedProductId);

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
        product_type: product.product_type,
        lender_id: product.lender_id,
      },
      selectedProductId: product.id,
      selectedProductType: product.product_type,
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
      loadError ||
      requirementsLoading ||
      Boolean(requirementsError)
    ) {
      return;
    }
    navigate("/apply/step-3");
  }

  const noProducts = !isLoading && products.length === 0 && !loadError;

  return (
    <WizardLayout>
      <StepHeader step={2} title="Choose a Product" />

      <Card className="space-y-4">
        {loadError && <div style={emptyStateStyles}>{loadError}</div>}
        {!loadError && requirementsError && (
          <div style={emptyStateStyles}>{requirementsError}</div>
        )}
        {!loadError && noProducts && (
          <div style={emptyStateStyles}>No products available.</div>
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
            <div className="grid gap-4">
              {products.map((product) => {
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
                      borderColor: isSelected ? "#22c55e" : theme.colors.border,
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
                        <div style={{ fontSize: "14px", color: theme.colors.textSecondary }}>
                          Type: {product.product_type}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                          <span>
                            Min: {formatAmount(product.min_amount, countryCode)}
                          </span>
                          <span>
                            Max: {formatAmount(product.max_amount, countryCode)}
                          </span>
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
                                  border: "1px solid rgba(59, 130, 246, 0.3)",
                                }}
                              >
                                {requiredDocuments.length}
                              </span>
                              {requirementsLoading && (
                                <span style={{ fontSize: "12px" }}>
                                  Loading…
                                </span>
                              )}
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
                            {isSelected &&
                              !requirementsLoading &&
                              previewRequired.length === 0 && (
                                <div style={{ fontSize: "12px" }}>
                                  No required documents loaded yet.
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
        )}
      </Card>

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
            Boolean(requirementsError) ||
            requirementsLoading ||
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
