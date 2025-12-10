import { useApplicationStore } from "../state/useApplicationStore";
import { ProductSync } from "../lender/productSync";
import { filterProductsForEligibility } from "../lender/compile";

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
    <div>
      <h1 className="text-xl font-bold mb-4">Select Product Category</h1>

      {categories.map((cat) => (
        <div key={cat} className="border p-4 mb-3 bg-white rounded">
          <div className="flex justify-between items-center">
            <div>{CategoryLabels[cat] || cat}</div>
            <button
              className="bg-borealBlue text-white px-3 py-1"
              onClick={() => select(cat)}
            >
              Select
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
