import { useState } from "react";

const products = [
  { name: "Working Capital", speed: "Fast", amount: "$10k - $250k", bestFor: "Day-to-day cash flow" },
  { name: "Equipment Financing", speed: "Medium", amount: "$25k - $1M", bestFor: "Asset purchases" },
  { name: "Expansion Term Loan", speed: "Medium", amount: "$50k - $2M", bestFor: "Growth initiatives" },
];

export default function ProductComparisonPopup() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="underline text-sm">
        Compare Products
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Product Comparison</h2>
              <button onClick={() => setOpen(false)} className="underline text-sm">
                Close
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border p-2 text-left">Product</th>
                    <th className="border p-2 text-left">Funding Speed</th>
                    <th className="border p-2 text-left">Typical Amount</th>
                    <th className="border p-2 text-left">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.name}>
                      <td className="border p-2">{product.name}</td>
                      <td className="border p-2">{product.speed}</td>
                      <td className="border p-2">{product.amount}</td>
                      <td className="border p-2">{product.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
