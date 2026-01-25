import { submitApplication } from "../../api/applications";
import type { ApplicationState } from "../../state/application";

export default function ReviewSubmit({ state }: { state: ApplicationState }) {
  async function onSubmit() {
    if (!state.selectedProduct) {
      throw new Error("Missing product");
    }

    await submitApplication({
      business_name: "Test Co",
      requested_amount: 100000,
      lender_id: state.selectedProduct.lender_id,
      product_id: state.selectedProduct.id,
    });
  }

  return <button onClick={onSubmit}>Submit</button>;
}
