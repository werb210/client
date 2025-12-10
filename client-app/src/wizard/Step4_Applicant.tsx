import { useApplicationStore } from "../state/useApplicationStore";
import { ProductSync } from "../lender/productSync";
import { filterProductsForCategory, compileQuestions } from "../lender/compile";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

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
    <div className="max-w-2xl mx-auto">
      <StepHeader step={4} title="Applicant Information" />

      {applicantQuestions.map((q) => (
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
