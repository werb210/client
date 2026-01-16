import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../state/useApplicationStore";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { WizardLayout } from "../components/WizardLayout";
import { theme } from "../styles/theme";
import {
  FundingIntent,
  getAllowedCategories,
  normalizeFundingIntent,
} from "../constants/wizard";

const PRODUCT_COUNTS: Record<string, number> = {
  "Working Capital": 1,
  "Equipment Financing": 6,
  "Line of Credit": 19,
};

const MATCH_BASELINES: Record<string, number> = {
  "Working Capital": 50,
  "Equipment Financing": 48,
  "Line of Credit": 44,
};

function toLower(value?: string) {
  return (value || "").toLowerCase();
}

function parseYearsInBusiness(value?: string) {
  const normalized = toLower(value);
  if (!normalized) return 0;
  if (normalized.includes("less than")) return 0.5;
  if (normalized.includes("1 to 3")) return 2;
  if (normalized.includes("over 3")) return 3;
  const numbers = normalized.match(/\d+/g);
  if (!numbers?.length) return 0;
  return Number(numbers[numbers.length - 1]);
}

function hasPositiveBalance(value?: string) {
  const normalized = toLower(value);
  if (!normalized) return false;
  if (normalized.includes("no")) return false;
  return true;
}

function clampMatch(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function Step2_Product() {
  const { app, update } = useApplicationStore();
  const navigate = useNavigate();

  const allowedCategoryNames = useMemo(
    () => getAllowedCategories(app.kyc.lookingFor),
    [app.kyc.lookingFor]
  );

  const categories = useMemo(() => {
    const purpose = toLower(app.kyc.purposeOfFunds);
    const hasWorkingCapitalPurpose =
      purpose.includes("working capital") || purpose.includes("cash flow");
    const hasEquipmentPurpose = purpose.includes("equipment");

    const hasAccountsReceivable = hasPositiveBalance(
      app.kyc.accountsReceivable
    );
    const hasFixedAssets = hasPositiveBalance(app.kyc.fixedAssets);
    const hasMonthlyRevenue = Boolean(app.kyc.monthlyRevenue);
    const yearsInBusiness = parseYearsInBusiness(app.kyc.salesHistory);

    const workingCapitalAvailable =
      hasWorkingCapitalPurpose || hasAccountsReceivable || hasMonthlyRevenue;
    const equipmentAvailable = hasEquipmentPurpose || hasFixedAssets;
    const lineOfCreditAvailable = yearsInBusiness >= 2 && hasMonthlyRevenue;

    const categoryDefinitions = [
      {
        name: "Working Capital",
        intent: FundingIntent.WORKING_CAPITAL,
        available: workingCapitalAvailable,
        criteria: [
          hasWorkingCapitalPurpose,
          hasAccountsReceivable,
          hasMonthlyRevenue,
        ],
      },
      {
        name: "Equipment Financing",
        intent: FundingIntent.EQUIPMENT,
        available: equipmentAvailable,
        criteria: [hasEquipmentPurpose, hasFixedAssets],
      },
      {
        name: "Line of Credit",
        intent: FundingIntent.WORKING_CAPITAL,
        available: lineOfCreditAvailable,
        criteria: [yearsInBusiness >= 2, hasMonthlyRevenue],
      },
    ];

    return categoryDefinitions
      .filter(
        (category) =>
          category.available && allowedCategoryNames.includes(category.name)
      )
      .map((category) => {
        const matches = category.criteria.filter(Boolean).length;
        const baseline = MATCH_BASELINES[category.name] ?? 40;
        const boost =
          category.criteria.length > 0
            ? (matches / category.criteria.length) * 12
            : 0;
        const matchScore = clampMatch(baseline + boost);
        return {
          name: category.name,
          matchScore,
          productsCount: PRODUCT_COUNTS[category.name] ?? 0,
        };
      });
  }, [allowedCategoryNames, app.kyc]);

  useEffect(() => {
    if (app.currentStep !== 2) {
      update({ currentStep: 2 });
    }
  }, [app.currentStep, update]);

  useEffect(() => {
    const normalizedIntent = normalizeFundingIntent(app.kyc.lookingFor);
    if (!normalizedIntent && app.productCategory) {
      update({ productCategory: null });
      return;
    }

    const current = categories.find(
      (category) => category.name === app.productCategory
    );
    if (app.productCategory && !current) {
      update({ productCategory: null });
      return;
    }

    if (categories.length === 1) {
      const onlyOption = categories[0].name;
      if (app.productCategory !== onlyOption) {
        update({ productCategory: onlyOption });
      }
    }
  }, [app.kyc.lookingFor, app.productCategory, categories, update]);

  function select(name: string) {
    update({ productCategory: name });
  }

  function goBack() {
    navigate("/apply/step-1");
  }

  function goNext() {
    if (!app.productCategory) return;
    navigate("/apply/step-3");
  }

  return (
    <WizardLayout>
      <StepHeader step={2} title="Choose Product Category" />

      <Card className="space-y-4">
        <div className="space-y-4">
          {categories.map((category) => {
            const isSelected = app.productCategory === category.name;
            return (
              <Card
                key={category.name}
                onClick={() => select(category.name)}
                style={{
                  borderColor: isSelected
                    ? "#22c55e"
                    : theme.colors.border,
                  boxShadow: isSelected
                    ? "0 0 0 2px rgba(34, 197, 94, 0.24)"
                    : "0 4px 16px rgba(15, 23, 42, 0.08)",
                  cursor: "pointer",
                  background: isSelected ? "rgba(34, 197, 94, 0.08)" : "white",
                }}
              >
                <div className="flex flex-col gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          fontSize: theme.typography.h2.fontSize,
                          fontWeight: theme.typography.h2.fontWeight,
                          color: theme.colors.textPrimary,
                        }}
                      >
                        {category.name}
                      </div>
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
                    <p
                      style={{
                        fontSize: "14px",
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {category.productsCount} products available (Match score{" "}
                      {category.matchScore}%)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        borderRadius: "999px",
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: "rgba(15, 23, 42, 0.06)",
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {category.matchScore}% Match
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
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
          disabled={!app.productCategory}
        >
          Continue →
        </Button>
      </div>
    </WizardLayout>
  );
}

export default Step2_Product;
