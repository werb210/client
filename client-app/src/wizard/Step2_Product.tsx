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

export function Step2_Product() {
  const { app, update } = useApplicationStore();
  const matchPercentages = app.matchPercentages ?? {};
  const categories = ["term_loan", "line_of_credit", "factoring", "equipment_financing"];

  function select(cat: string) {
    update({ productCategory: cat });
    window.location.href = "/apply/step-3";
  }

  if (categories.length === 0)
    return <div>No eligible products found. Adjust your inputs.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <StepHeader step={2} title="Select Product Category" />

      {categories.map((cat) => (
        <Card key={cat} className="mb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <div className="font-semibold">{CategoryLabels[cat] || cat}</div>
              <p className="text-sm text-slate-600">
                Learn how this option works for your business.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ProgressPill value={matchPercentages[cat] ?? 0} />
              <Button className="w-full md:w-auto" onClick={() => select(cat)}>
                Select
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
