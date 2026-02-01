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
import {
  createLinkedApplication,
  LinkedApplicationStore,
} from "../applications/linkedApplications";
import { ClientProfileStore } from "../state/clientProfiles";
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
import { Checkbox } from "../components/ui/Checkbox";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { components, layout, tokens } from "@/styles";

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
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [closingError, setClosingError] = useState<string | null>(null);
  const [closingBusy, setClosingBusy] = useState(false);
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
            !activeProducts.some(
              (product) => product.id === app.selectedProductId
            )
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
    const category = product.product_type ?? product.name;
    update({
      productCategory: category,
      selectedProduct: {
        id: product.id,
        name: product.name,
        product_type: category,
        lender_id: product.lender_id,
      },
      selectedProductId: product.id,
      selectedProductType: category,
      documents: {},
      documentsDeferred: false,
    });
  }

  function goBack() {
    navigate("/apply/step-1");
  }

  function goNext() {
    if (!selectedProduct || !amountValid || loadError) {
      return;
    }
    if (
      isEquipmentIntent &&
      app.requires_closing_cost_funding &&
      app.applicationToken &&
      !LinkedApplicationStore.has(app.applicationToken)
    ) {
      setClosingError(null);
      setShowClosingModal(true);
      return;
    }
    navigate("/apply/step-3");
  }

  async function confirmClosingCosts() {
    if (!app.applicationToken) {
      setClosingError("Missing application token. Please restart your application.");
      return;
    }
    setClosingBusy(true);
    setClosingError(null);
    try {
      const token = await createLinkedApplication(
        app.applicationToken,
        app.kyc,
        "closing_costs"
      );
      update({
        linkedApplicationTokens: [
          token,
          ...(app.linkedApplicationTokens || []),
        ],
      });
      if (app.kyc?.phone) {
        ClientProfileStore.upsertProfile(app.kyc.phone, token);
      }
      setShowClosingModal(false);
      navigate("/apply/step-3");
    } catch (error) {
      console.error("Failed to create linked application:", error);
      setClosingError("Unable to create the linked application. Try again.");
    } finally {
      setClosingBusy(false);
    }
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

      <Card style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg }}>
        {isLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm }}>
            <Spinner />
            <span style={components.form.helperText}>Loading product options…</span>
          </div>
        )}
        {categorySummaries.length > 0 && (
          <div
            style={{
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: tokens.radii.lg,
              padding: tokens.spacing.md,
              background: "rgba(11, 42, 74, 0.06)",
            }}
          >
            <div style={components.form.eyebrow}>Product categories</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: tokens.spacing.sm,
                marginTop: tokens.spacing.sm,
              }}
            >
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
                    style={{
                      borderRadius: tokens.radii.md,
                      border: `1px solid ${tokens.colors.border}`,
                      background: tokens.colors.surface,
                      padding: tokens.spacing.sm,
                      display: "flex",
                      flexDirection: "column",
                      gap: tokens.spacing.xs,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 600, color: tokens.colors.primary }}>
                        {summary.category}
                      </div>
                      <span style={components.form.helperText}>
                        {summary.matchingCount} match{summary.matchingCount === 1 ? "" : "es"}
                      </span>
                    </div>
                    <div style={components.form.helperText}>
                      Range: {formatAmount(summary.minAmount, countryCode)} to{" "}
                      {formatAmount(summary.maxAmount, countryCode)} · {summary.totalCount} total
                    </div>
                    {(amountTooLow || amountTooHigh) && (
                      <div style={{ ...components.form.helperText, color: tokens.colors.warning }}>
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
        {loadError && (
          <Card variant="muted">
            <EmptyState>{loadError}</EmptyState>
          </Card>
        )}
        {!loadError && noProducts && (
          <Card variant="muted">
            <EmptyState>
              No products match your location and requested amount. Review the
              category ranges above for alternatives.
            </EmptyState>
          </Card>
        )}
        {!loadError && !noProducts && (
          <div style={layout.stack}>
            <div
              style={{
                border: `1px solid ${tokens.colors.border}`,
                borderRadius: tokens.radii.md,
                padding: tokens.spacing.md,
                background: tokens.colors.background,
                fontSize: tokens.typography.body.fontSize,
                color: tokens.colors.textSecondary,
              }}
            >
              Requested amount:{" "}
              <span style={{ color: tokens.colors.textPrimary, fontWeight: 600 }}>
                {amountDisplay}
              </span>
              {amountError && (
                <div style={components.form.errorText}>{amountError}</div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg }}>
              {groupedProducts.map((group) => (
                <div key={group.lenderId} style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.sm }}>
                  <div
                    style={{
                      fontSize: "13px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: tokens.colors.textSecondary,
                      fontWeight: 600,
                    }}
                  >
                    {group.lenderName}
                  </div>
                  <div style={{ display: "grid", gap: tokens.spacing.md }}>
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
                              ? tokens.colors.success
                              : tokens.colors.border,
                            boxShadow: isSelected
                              ? "0 0 0 2px rgba(22, 163, 74, 0.24)"
                              : tokens.shadows.card,
                            cursor: "pointer",
                            background: isSelected
                              ? "rgba(22, 163, 74, 0.08)"
                              : tokens.colors.surface,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: tokens.spacing.md,
                            }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.xs }}>
                              <div
                                style={{
                                  fontSize: tokens.typography.h2.fontSize,
                                  fontWeight: tokens.typography.h2.fontWeight,
                                  color: tokens.colors.textPrimary,
                                }}
                              >
                                {product.name}
                              </div>
                              {product.product_type && (
                                <div style={components.form.helperText}>
                                  Type: {product.product_type}
                                </div>
                              )}
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: tokens.spacing.sm,
                                  fontSize: tokens.typography.helper.fontSize,
                                  color: tokens.colors.textSecondary,
                                }}
                              >
                                <span>Country: {product.country}</span>
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
                                <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.xs }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.xs }}>
                                    <span style={{ fontWeight: 600 }}>
                                      Documents Required
                                    </span>
                                    <span
                                      style={{
                                        padding: "2px 8px",
                                        borderRadius: tokens.radii.pill,
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        background: "rgba(11, 42, 74, 0.12)",
                                        color: tokens.colors.primary,
                                        border: "1px solid rgba(11, 42, 74, 0.3)",
                                      }}
                                    >
                                      {requiredDocuments.length}
                                    </span>
                                  </div>
                                  {showPreview && (
                                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                                      {previewRequired.map((entry) => (
                                        <li key={entry.id}>
                                          {formatDocumentLabel(entry.document_type)}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  {isSelected && previewRequired.length === 0 && (
                                    <div style={components.form.helperText}>
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
                                gap: tokens.spacing.xs,
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
                                    borderRadius: tokens.radii.pill,
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    background: "rgba(22, 163, 74, 0.12)",
                                    color: "#15803d",
                                    border: "1px solid rgba(22, 163, 74, 0.35)",
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
        <Card>
          <div style={{ display: "flex", alignItems: "flex-start", gap: tokens.spacing.sm }}>
            <Checkbox
              checked={Boolean(app.requires_closing_cost_funding)}
              onChange={(event) =>
                update({ requires_closing_cost_funding: event.target.checked })
              }
            />
            <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.xs }}>
              <div style={{ fontWeight: 600, color: tokens.colors.primary }}>
                Need closing cost or deposit funding?
              </div>
              <div style={components.form.helperText}>
                Select this if you want a linked application for closing costs.
              </div>
            </div>
          </div>
        </Card>
      )}

      <div style={{ ...layout.stickyCta, marginTop: tokens.spacing.lg }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: tokens.spacing.sm }}>
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
      </div>

      {showClosingModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: tokens.spacing.md,
            zIndex: 50,
          }}
        >
          <div
            style={{
              ...components.card.base,
              maxWidth: "520px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: tokens.spacing.sm,
            }}
          >
            <h2 style={components.form.sectionTitle}>
              Create a linked closing cost application?
            </h2>
            <p style={components.form.subtitle}>
              We will create a second application tied to this one for closing
              costs or equipment deposits. It stays linked in your client portal
              so the team can review both together.
            </p>
            {closingError && (
              <div style={components.form.errorText}>{closingError}</div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: tokens.spacing.sm }}>
              <Button
                variant="secondary"
                style={{ width: "100%" }}
                onClick={() => setShowClosingModal(false)}
                disabled={closingBusy}
              >
                Not now
              </Button>
              <Button
                style={{ width: "100%" }}
                onClick={confirmClosingCosts}
                disabled={closingBusy}
                loading={closingBusy}
              >
                Create linked application
              </Button>
            </div>
          </div>
        </div>
      )}
    </WizardLayout>
  );
}

export default Step2_Product;
