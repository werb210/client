import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../state/useApplicationStore";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ProgressPill } from "../components/ui/ProgressPill";
import { WizardLayout } from "../components/WizardLayout";
import { theme } from "../styles/theme";

const PRODUCT_VISIBILITY_MAP = {
  Capital: [
    "Term Loan",
    "Line of Credit",
    "Factoring",
    "Purchase Order Financing",
  ],
  "Equipment Financing": ["Equipment Financing"],
  "Capital & Equipment": [
    "Term Loan",
    "Line of Credit",
    "Factoring",
    "Purchase Order Financing",
    "Equipment Financing",
  ],
} as const;

const lookingForLabelMap: Record<string, keyof typeof PRODUCT_VISIBILITY_MAP> =
  {
    capital: "Capital",
    equipment: "Equipment Financing",
    both: "Capital & Equipment",
  };

const productMatchKeys: Record<string, string> = {
  "Term Loan": "term_loan",
  "Line of Credit": "line_of_credit",
  Factoring: "factoring",
  "Purchase Order Financing": "po_financing",
  "Equipment Financing": "equipment_financing",
};

export function Step2_Product() {
  const { app, update } = useApplicationStore();
  const navigate = useNavigate();

  const categories = useMemo(() => {
    const rawSelection = app.kyc.lookingFor as string | undefined;
    const mappedSelection =
      (rawSelection && lookingForLabelMap[rawSelection]) ||
      (rawSelection &&
      Object.prototype.hasOwnProperty.call(PRODUCT_VISIBILITY_MAP, rawSelection)
        ? (rawSelection as keyof typeof PRODUCT_VISIBILITY_MAP)
        : undefined);
    return mappedSelection ? [...PRODUCT_VISIBILITY_MAP[mappedSelection]] : [];
  }, [app.kyc.lookingFor]);

  useEffect(() => {
    if (app.currentStep !== 2) {
      update({ currentStep: 2 });
    }
  }, [app.currentStep, update]);

  useEffect(() => {
    if (app.productCategory && !categories.includes(app.productCategory)) {
      update({ productCategory: null });
    }
  }, [app.productCategory, categories, update]);

  const matchByCategory = useMemo(() => {
    return categories.reduce(
      (acc, category) => {
        const matchKey = productMatchKeys[category];
        const rawValue = matchKey ? app.matchPercentages[matchKey] : undefined;
        if (typeof rawValue !== "number" || Number.isNaN(rawValue)) {
          acc[category] = { value: null, label: "—" };
          return acc;
        }

        const clamped = Math.max(0, Math.min(100, Math.round(rawValue)));
        acc[category] = { value: clamped, label: `${clamped}% match` };
        return acc;
      },
      {} as Record<string, { value: number | null; label: string }>
    );
  }, [app.matchPercentages, categories]);

  function select(cat: string) {
    update({ productCategory: cat });
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
          {categories.map((cat) => {
            const matchInfo =
              matchByCategory[cat] ?? ({ value: null, label: "—" } as const);
            const isSelected = app.productCategory === cat;
            return (
              <Card
                key={cat}
                onClick={() => select(cat)}
                style={{
                  borderColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.border,
                  boxShadow: isSelected
                    ? "0 0 0 2px rgba(37, 99, 235, 0.35)"
                    : "0 4px 16px rgba(15, 23, 42, 0.08)",
                  cursor: "pointer",
                }}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          fontSize: theme.typography.h2.fontSize,
                          fontWeight: theme.typography.h2.fontWeight,
                          color: theme.colors.textPrimary,
                        }}
                      >
                        {cat}
                      </div>
                      {isSelected && (
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background: "rgba(37, 99, 235, 0.12)",
                            color: theme.colors.textPrimary,
                            border: `1px solid ${theme.colors.primary}`,
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
                      Match score based on your financial profile.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {matchInfo.value === null ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          borderRadius: "999px",
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: "rgba(148, 163, 184, 0.2)",
                          color: theme.colors.textSecondary,
                        }}
                      >
                        {matchInfo.label}
                      </span>
                    ) : (
                      <ProgressPill value={matchInfo.value} />
                    )}
                    <Button
                      style={{ width: "100%", maxWidth: "160px" }}
                      onClick={(event) => {
                        event.stopPropagation();
                        select(cat);
                      }}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </Button>
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
