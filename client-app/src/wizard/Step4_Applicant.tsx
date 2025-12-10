import { useApplicationStore } from "../state/useApplicationStore";
import { ProductSync } from "../lender/productSync";
import { filterProductsForCategory, compileQuestions } from "../lender/compile";
import { ClientAppAPI } from "../api/clientApp";

export function Step4_Applicant() {
  const { app, update } = useApplicationStore();

  const products = filterProductsForCategory(
    ProductSync.load(),
    app.productCategory!
  );

  const { applicantQuestions } = compileQuestions(products);

  const values = { ...app.applicant };

  function setField(key: string, value: any) {
    update({ applicant: { ...values, [key]: value } });
  }

  async function next() {
    await ClientAppAPI.update(app.applicationToken!, { applicant: values });
    window.location.href = "/apply/step-5";
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Applicant Information</h1>

      {applicantQuestions.map((q) => (
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
