import { useState } from "react";
import { updateApplication } from "../../services/applicationService";
import { getApplicationId } from "../../utils/applicationSession";

export default function ApplicationStep2() {
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");

  const submit = async () => {
    const applicationId = getApplicationId();

    if (!applicationId) {
      alert("No application in progress. Please start again.");
      window.location.href = "/apply/start";
      return;
    }

    await updateApplication({
      id: applicationId,
      amount,
      purpose,
    });

    window.location.href = "/apply/step-3";
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Funding Details</h1>

      <input
        placeholder="Amount Requested"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
      />

      <input
        placeholder="Purpose of Funds"
        value={purpose}
        onChange={(event) => setPurpose(event.target.value)}
      />

      <button onClick={() => void submit()} type="button">
        Continue
      </button>
    </div>
  );
}
