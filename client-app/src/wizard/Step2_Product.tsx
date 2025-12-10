import { useApplicationStore } from "../state/useApplicationStore";
import { ProductSync } from "../lender/productSync";
import { filterProductsForEligibility } from "../lender/compile";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

const CategoryLabels: Record<string, string> = {
  line_of_credit: "Line of Credit",
  factoring: "Invoice Factoring",
  working_capital: "Working Capital Loan",
  equipment_financing: "Equipment Financing",
  purchase_order: "Purchase Order Financing",
  term_loan: "Term Loan",
};

export function Step2_Product() {
  const { app, update } = useApplicationStore();

  const allProducts = ProductSync.load();
  const eligible = filterProductsForEligibility(allProducts, app.kyc);

  // Determine available categories from eligible products
  const categories = Array.from(
    new Set(eligible.map((p: any) => p.category))
  );

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
            <div className="font-semibold">{CategoryLabels[cat] || cat}</div>
            <Button className="w-full md:w-auto" onClick={() => select(cat)}>
              Select
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
