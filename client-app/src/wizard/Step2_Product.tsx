import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../state/useApplicationStore";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ProgressPill } from "../components/ui/ProgressPill";
import { WizardLayout } from "../components/WizardLayout";

const CategoryLabels: Record<string, string> = {
  working_capital: "Working Capital",
  line_of_credit: "Line of Credit",
  equipment_financing: "Equipment Financing",
  purchase_order_financing: "Purchase Order Financing",
  term_loan: "Term Loan",
};

const ProductCategories = [
  "working_capital",
  "line_of_credit",
  "equipment_financing",
  "purchase_order_financing",
  "term_loan",
];

const CapitalCategories = [
  "working_capital",
  "line_of_credit",
  "purchase_order_financing",
  "term_loan",
];

const EmptyMatchLabelClass =
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-500";

export function Step2_Product() {
  const { app, update } = useApplicationStore();
  const navigate = useNavigate();
  const categories = useMemo(() => {
    const lookingFor = app.kyc.lookingFor || "";
    if (lookingFor === "Capital") {
      return CapitalCategories;
    }
    if (lookingFor === "Equipment Financing") {
      return ["equipment_financing"];
    }
    if (
      lookingFor === "Both Capital & Equipment" ||
      lookingFor === "Both Capital and Equipment"
    ) {
      return ProductCategories;
    }
    return CapitalCategories;
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
        const rawValue = app.matchPercentages[category];
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
        {categories.length === 0 ? (
          <div>
            <h2 className="text-lg font-semibold text-borealBlue">
              No eligible products found
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Adjust your inputs and try again.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((cat) => {
              const matchInfo =
                matchByCategory[cat] ?? ({ value: null, label: "—" } as const);
              const isSelected = app.productCategory === cat;
              return (
                <Card
                  key={cat}
                  className={`transition ${
                    isSelected ? "ring-2 ring-borealAccent" : ""
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-semibold text-borealBlue">
                          {CategoryLabels[cat] || cat}
                        </div>
                        {isSelected && (
                          <span className="boreal-badge-selected text-xs font-semibold px-2.5 py-1 rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        Match score based on your financial profile.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {matchInfo.value === null ? (
                        <span className={EmptyMatchLabelClass}>
                          {matchInfo.label}
                        </span>
                      ) : (
                        <ProgressPill value={matchInfo.value} />
                      )}
                      <Button
                        className="w-full md:w-auto"
                        onClick={() => select(cat)}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button
          className="w-full sm:w-auto boreal-button-secondary"
          onClick={goBack}
        >
          ← Back
        </Button>
        <Button
          className="w-full sm:w-auto"
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
