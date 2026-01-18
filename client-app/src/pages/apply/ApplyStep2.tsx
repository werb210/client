import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/client";

export default function ApplyStep2() {
  const navigate = useNavigate();
  const applicationToken = localStorage.getItem("applicationToken");
  const [requestedAmount, setRequestedAmount] = useState("");
  const [useOfFunds, setUseOfFunds] = useState("");
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (!applicationToken) {
      setError("We couldn't find your application. Please start again.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/applications/${applicationToken}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            financialProfile: {
              requestedAmount: Number(requestedAmount),
              useOfFunds,
              annualRevenue: Number(annualRevenue),
            },
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Unable to save funding details");
      }

      navigate("/apply/step-3");
    } catch (err) {
      setError("We couldn't save your details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <div className="step">Step 2 of 4</div>
        <h2>Funding details</h2>
        <p>Share the funding amount and how you'll use it.</p>

        <label className="label" htmlFor="requestedAmount">
          Requested amount (CAD)
        </label>
        <input
          id="requestedAmount"
          type="number"
          min="0"
          placeholder="50000"
          value={requestedAmount}
          onChange={(e) => setRequestedAmount(e.target.value)}
        />

        <label className="label" htmlFor="useOfFunds">
          Use of funds
        </label>
        <textarea
          id="useOfFunds"
          placeholder="Payroll, inventory, equipment"
          value={useOfFunds}
          onChange={(e) => setUseOfFunds(e.target.value)}
        />

        <label className="label" htmlFor="annualRevenue">
          Annual revenue (CAD)
        </label>
        <input
          id="annualRevenue"
          type="number"
          min="0"
          placeholder="250000"
          value={annualRevenue}
          onChange={(e) => setAnnualRevenue(e.target.value)}
        />

        {error && <div className="error">{error}</div>}

        <button
          disabled={
            !requestedAmount || !useOfFunds || !annualRevenue || isSubmitting
          }
          onClick={submit}
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
