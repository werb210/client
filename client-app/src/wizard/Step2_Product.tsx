import { useMemo } from "react";
import { useApplicationStore } from "../state/useApplicationStore";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ProgressPill } from "../components/ui/ProgressPill";

const CategoryLabels: Record<string, string> = {
  line_of_credit: "LOC",
  factoring: "Factoring",
  working_capital: "Working Capital",
  equipment_financing: "Equipment",
  purchase_order: "Purchase Order",
  term_loan: "Term Loan",
};

const ProductCategories = [
  "term_loan",
  "line_of_credit",
  "factoring",
  "equipment_financing",
];

const EmptyMatchLabelClass =
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-500";

export function Step2_Product() {
  const { app, update } = useApplicationStore();
  const categories = ProductCategories;

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
    window.location.href = "/apply/step-3";
  }

  if (categories.length === 0)
    return <div>No eligible products found. Adjust your inputs.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <StepHeader step={2} title="Select Product Category" />

      {categories.map((cat) => {
        const matchInfo =
          matchByCategory[cat] ?? ({ value: null, label: "—" } as const);
        return (
        <Card key={cat} className="mb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <div className="font-semibold">{CategoryLabels[cat] || cat}</div>
              <p className="text-sm text-slate-600">
                Learn how this option works for your business.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {matchInfo.value === null ? (
                <span className={EmptyMatchLabelClass}>{matchInfo.label}</span>
              ) : (
                <ProgressPill value={matchInfo.value} />
              )}
              <Button className="w-full md:w-auto" onClick={() => select(cat)}>
                Select
              </Button>
            </div>
          </div>
        </Card>
        );
      })}
    </div>
  );
}
