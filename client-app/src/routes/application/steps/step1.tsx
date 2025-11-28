import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplication } from "../../../state/application";

const Step1 = () => {
  const navigate = useNavigate();
  const { data, update } = useApplication();

  const [fundingAmount, setFundingAmount] = useState(
    data.kyc.fundingAmount ?? ""
  );
  const [fundingTimeline, setFundingTimeline] = useState(
    data.kyc.fundingTimeline
  );
  const [purpose, setPurpose] = useState(data.kyc.purpose);
  const [hasExistingLoans, setHasExistingLoans] = useState(
    data.kyc.hasExistingLoans
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};

    if (!fundingAmount || Number(fundingAmount) <= 0) {
      e.fundingAmount = "Funding amount is required";
    }
    if (!fundingTimeline) e.fundingTimeline = "Funding timeline required";
    if (!purpose) e.purpose = "Purpose is required";
    if (!hasExistingLoans) e.hasExistingLoans = "Choose yes or no";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;

    update({
      kyc: {
        fundingAmount: Number(fundingAmount),
        fundingTimeline,
        purpose,
        hasExistingLoans,
      },
    });

    navigate("/application/step-2");
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Step 1 — Funding Requirements</h1>

      {/* Funding Amount */}
      <div style={{ marginTop: "1.5rem" }}>
        <label>How much funding do you need?</label>
        <input
          type="number"
          value={fundingAmount}
          onChange={(e) => setFundingAmount(e.target.value)}
          placeholder="e.g., 150000"
          style={{ display: "block", marginTop: "0.5rem", width: "300px" }}
        />
        {errors.fundingAmount && (
          <p style={{ color: "red" }}>{errors.fundingAmount}</p>
        )}
      </div>

      {/* Funding Timeline */}
      <div style={{ marginTop: "1.5rem" }}>
        <label>When do you need the funds?</label>
        <select
          value={fundingTimeline}
          onChange={(e) => setFundingTimeline(e.target.value)}
          style={{ display: "block", marginTop: "0.5rem", width: "300px" }}
        >
          <option value="">Select...</option>
          <option value="immediately">Immediately</option>
          <option value="1-2 weeks">1–2 weeks</option>
          <option value="30 days">Within 30 days</option>
          <option value="2-3 months">2–3 months</option>
        </select>
        {errors.fundingTimeline && (
          <p style={{ color: "red" }}>{errors.fundingTimeline}</p>
        )}
      </div>

      {/* Purpose */}
      <div style={{ marginTop: "1.5rem" }}>
        <label>What is the purpose of funding?</label>
        <input
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="e.g., Working capital, equipment, etc."
          style={{ display: "block", marginTop: "0.5rem", width: "300px" }}
        />
        {errors.purpose && <p style={{ color: "red" }}>{errors.purpose}</p>}
      </div>

      {/* Existing Loans */}
      <div style={{ marginTop: "1.5rem" }}>
        <label>Do you currently have any active business loans?</label>
        <div style={{ marginTop: "0.5rem" }}>
          <label>
            <input
              type="radio"
              name="existingLoans"
              value="yes"
              checked={hasExistingLoans === "yes"}
              onChange={() => setHasExistingLoans("yes")}
            />
            Yes
          </label>

          <label style={{ marginLeft: "1.5rem" }}>
            <input
              type="radio"
              name="existingLoans"
              value="no"
              checked={hasExistingLoans === "no"}
              onChange={() => setHasExistingLoans("no")}
            />
            No
          </label>
        </div>
        {errors.hasExistingLoans && (
          <p style={{ color: "red" }}>{errors.hasExistingLoans}</p>
        )}
      </div>

      <button
        onClick={submit}
        style={{ marginTop: "2rem", padding: "1rem 2rem" }}
      >
        Continue
      </button>
    </main>
  );
};

export default Step1;
