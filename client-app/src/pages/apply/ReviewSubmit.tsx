import { submitApplication } from "../../api/applications";
import type { ApplicationState } from "../../state/application";
import { useState } from "react";

export default function ReviewSubmit({ state }: { state: ApplicationState }) {
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (submitting) return;

    setSubmitting(true);

    if (!state.selectedProduct) {
      setSubmitting(false);
      throw new Error("Missing product");
    }

    try {
      await submitApplication({
        business_name: "Test Co",
        requested_amount: 100000,
        lender_id: state.selectedProduct.lender_id,
        product_id: state.selectedProduct.id,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button onClick={onSubmit} disabled={submitting}>
      {submitting ? "Submitting..." : "Submit"}
    </button>
  );
}
