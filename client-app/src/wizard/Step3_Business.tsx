import { useApplicationStore } from "../state/useApplicationStore";
import { ProductSync } from "../lender/productSync";
import { filterProductsForCategory, compileQuestions } from "../lender/compile";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Validate } from "../utils/validate";

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
    const missing = businessQuestions.find((q) => !Validate.required(values[q]));
    if (missing) {
      alert(`Please complete: ${missing}`);
      return;
    }

    await ClientAppAPI.update(app.applicationToken!, { business: values });
    window.location.href = "/apply/step-4";
  }

  return (
    <div className="max-w-2xl mx-auto">
      <StepHeader step={3} title="Business Information" />

      {businessQuestions.map((q) => (
        <Card key={q} className="mb-3">
          <label className="block mb-1 font-medium">{q}</label>
          <Input
            value={values[q] || ""}
            onChange={(e: any) => setField(q, e.target.value)}
          />
        </Card>
      ))}

      <Button className="mt-4 w-full md:w-auto" onClick={next}>
        Continue
      </Button>
    </div>
  );
}
