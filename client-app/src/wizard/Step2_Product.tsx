import { useApplicationStore } from "../state/useApplicationStore";

function suggestCategory(kyc: any) {
  if (!kyc) return null;

  if (kyc.revenueType === "invoices") return "factoring";
  if (kyc.revenueType === "asset_based") return "line_of_credit";
  if (kyc.amount >= 250000) return "term_loan";

  return "working_capital";
}

export function Step2_Product() {
  const { app, update } = useApplicationStore();
  const suggested = suggestCategory(app.kyc);

  function select(cat: string) {
    update({ productCategory: cat });
    window.location.href = "/apply/step-3";
  }

  const categories = [
    ["line_of_credit", "Line Of Credit"],
    ["factoring", "Invoice Factoring"],
    ["working_capital", "Working Capital"],
    ["equipment_financing", "Equipment Financing"],
    ["purchase_order", "Purchase Order Financing"],
    ["term_loan", "Term Loan"],
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Step 2: Choose Product Category</h1>

      {categories.map(([value, label]) => (
        <div
          key={value}
          className={`border p-3 mb-2 ${
            suggested === value ? "bg-green-100" : ""
          }`}
        >
          <div className="flex justify-between">
            <div>{label}</div>
            <button
              className="bg-borealBlue text-white px-3 py-1"
              onClick={() => select(value)}
            >
              Select
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
