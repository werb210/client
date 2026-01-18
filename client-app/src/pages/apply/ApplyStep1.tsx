import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/client";

const provinces = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
];

export default function ApplyStep1() {
  const navigate = useNavigate();
  const [legalBusinessName, setLegalBusinessName] = useState("");
  const [operatingProvince, setOperatingProvince] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          source: "client",
          country: "CA",
          business: {
            legalName: legalBusinessName,
            operatingProvince,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to start application");
      }

      const data = await res.json();
      if (!data?.token) {
        throw new Error("Missing application token");
      }
      localStorage.setItem("applicationToken", data.token);
      navigate("/apply/step-2");
    } catch (err) {
      setError("We couldn't start your application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <div className="step">Step 1 of 4</div>
        <h2>Business identity</h2>
        <p>Tell us how your business is registered.</p>

        <label className="label" htmlFor="legalBusinessName">
          Legal business name
        </label>
        <input
          id="legalBusinessName"
          placeholder="Boreal Coffee Company"
          value={legalBusinessName}
          onChange={(e) => setLegalBusinessName(e.target.value)}
        />

        <label className="label" htmlFor="operatingProvince">
          Operating province
        </label>
        <select
          id="operatingProvince"
          value={operatingProvince}
          onChange={(e) => setOperatingProvince(e.target.value)}
        >
          <option value="">Select a province</option>
          {provinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>

        {error && <div className="error">{error}</div>}

        <button
          disabled={!legalBusinessName || !operatingProvince || isSubmitting}
          onClick={submit}
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
