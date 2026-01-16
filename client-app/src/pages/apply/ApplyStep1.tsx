import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ApplyStep1() {
  const navigate = useNavigate();
  const [legalName, setLegalName] = useState("");
  const [country] = useState("CA");

  async function submit() {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        source: "client",
        country,
        productCategory: "term_loan",
        business: { legalName },
        applicant: {
          firstName: "Pending",
          lastName: "Pending",
          email: "pending@pending.com",
        },
        financialProfile: {},
        match: {},
      }),
    });

    const data = await res.json();
    localStorage.setItem("applicationId", data.id);
    navigate("/apply/step-2");
  }

  return (
    <div className="page">
      <div className="card">
        <h2>Business Information</h2>

        <input
          placeholder="Legal Business Name"
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
        />

        <button disabled={!legalName} onClick={submit}>
          Continue
        </button>
      </div>
    </div>
  );
}
