import { useApplicationStore } from "../state/useApplicationStore";
import { ProductSync } from "../lender/productSync";
import { filterProductsForCategory, compileQuestions } from "../lender/compile";
import { ClientAppAPI } from "../api/clientApp";

export function Step3_Business() {
  const { app, update } = useApplicationStore();

  const products = filterProductsForCategory(
    ProductSync.load(),
    app.productCategory!
  );

  const { businessQuestions } = compileQuestions(products);

  const values = { ...app.business };

  function setField(key: string, value: any) {
    update({ business: { ...values, [key]: value } });
  }

  async function next() {
    await ClientAppAPI.update(app.applicationToken!, { business: values });
    window.location.href = "/apply/step-4";
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Business Information</h1>

      {businessQuestions.map((q) => (
        <label key={q} className="block mb-2">
          {q}
          <input
            className="border p-2 w-full"
            value={values[q] || ""}
            onChange={(e) => setField(q, e.target.value)}
          />
        </label>
      ))}

      <button className="bg-borealBlue text-white p-2 mt-4" onClick={next}>
        Continue
      </button>
    </div>
  );
}
