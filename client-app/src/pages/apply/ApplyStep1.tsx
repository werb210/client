import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/client";
import { getClientSessionAuthHeader } from "../../state/clientSession";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { components, layout, scrollToFirstError, tokens } from "@/styles";

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

  useEffect(() => {
    if (error) {
      scrollToFirstError();
    }
  }, [error]);

  async function submit() {
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
          ...getClientSessionAuthHeader(),
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
    <div style={layout.page}>
      <div style={layout.centerColumn}>
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.sm }}>
            <div style={components.form.eyebrow}>Step 1 of 4</div>
            <h2 style={components.form.sectionTitle}>Business identity</h2>
            <p style={components.form.subtitle}>
              Tell us how your business is registered.
            </p>

            <label style={components.form.label} htmlFor="legalBusinessName">
              Legal business name
            </label>
            <Input
              id="legalBusinessName"
              placeholder="Boreal Coffee Company"
              value={legalBusinessName}
              onChange={(e) => setLegalBusinessName(e.target.value)}
            />

            <label style={components.form.label} htmlFor="operatingProvince">
              Operating province
            </label>
            <Select
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
            </Select>

            {error && (
              <div style={components.form.errorText} data-error={true}>
                {error}
              </div>
            )}

            <Button
              disabled={!legalBusinessName || !operatingProvince || isSubmitting}
              onClick={submit}
              loading={isSubmitting}
            >
              Continue
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
