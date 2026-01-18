import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/client";

export default function ApplyStep3() {
  const navigate = useNavigate();
  const applicationToken = localStorage.getItem("applicationToken");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
            applicant: {
              firstName,
              lastName,
              email,
              phone,
            },
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Unable to save applicant details");
      }

      navigate("/apply/step-4");
    } catch (err) {
      setError("We couldn't save your details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <div className="step">Step 3 of 4</div>
        <h2>Owner details</h2>
        <p>Tell us about the primary applicant.</p>

        <label className="label" htmlFor="firstName">
          First name
        </label>
        <input
          id="firstName"
          placeholder="Jordan"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <label className="label" htmlFor="lastName">
          Last name
        </label>
        <input
          id="lastName"
          placeholder="Lee"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <label className="label" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          type="email"
          placeholder="jordan@business.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="label" htmlFor="phone">
          Phone number
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="(555) 555-5555"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {error && <div className="error">{error}</div>}

        <button
          disabled={!firstName || !lastName || !email || !phone || isSubmitting}
          onClick={submit}
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
