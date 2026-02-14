import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveClientSessionToken } from "../../state/clientSession";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { components, layout, scrollToFirstError, tokens } from "@/styles";
import { apiRequest } from "../../lib/api";

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

type Step1Values = {
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  industry: string;
  yearsInBusiness: string;
  monthlyRevenue: string;
  annualRevenue: string;
  arOutstanding: string;
  existingDebt: string;
  operatingProvince: string;
};

const initialValues: Step1Values = {
  companyName: "",
  fullName: "",
  email: "",
  phone: "",
  industry: "",
  yearsInBusiness: "",
  monthlyRevenue: "",
  annualRevenue: "",
  arOutstanding: "",
  existingDebt: "",
  operatingProvince: "",
};

export default function ApplyStep1() {
  const navigate = useNavigate();
  const token = getActiveClientSessionToken();
  const [formValues, setFormValues] = useState<Step1Values>(initialValues);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (error) {
      scrollToFirstError();
    }
  }, [error]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextResumeId = params.get("resume");

    if (!nextResumeId) return;

    setResumeId(nextResumeId);

    fetch(`/api/continuation/${nextResumeId}`)
      .then((res) => res.json())
      .then((data) => {
        setFormValues((current) => ({
          ...current,
          companyName: data.companyName ?? "",
          fullName: data.fullName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          industry: data.industry ?? "",
          yearsInBusiness: data.yearsInBusiness ?? "",
          monthlyRevenue: data.monthlyRevenue ?? "",
          annualRevenue: data.annualRevenue ?? "",
          arOutstanding: data.arOutstanding ?? "",
          existingDebt: data.existingDebt ?? "",
        }));

        if (data.email) {
          localStorage.setItem("boreal_email", data.email);
        }
      })
      .catch(() => {
        // no-op when continuation fetch fails
      });
  }, []);

  const canSubmit = useMemo(
    () => Boolean(formValues.companyName && formValues.email && formValues.operatingProvince),
    [formValues.companyName, formValues.email, formValues.operatingProvince]
  );

  async function submit() {
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        source: "client",
        country: "CA",
        business: {
          legalName: formValues.companyName,
          operatingProvince: formValues.operatingProvince,
          industry: formValues.industry,
          yearsInBusiness: formValues.yearsInBusiness,
        },
        contact: {
          name: formValues.fullName,
          email: formValues.email,
          phone: formValues.phone,
        },
        financialProfile: {
          monthlyRevenue: Number(formValues.monthlyRevenue || 0),
          annualRevenue: Number(formValues.annualRevenue || 0),
          arOutstanding: Number(formValues.arOutstanding || 0),
          existingDebt: Number(formValues.existingDebt || 0),
        },
      };

      if (resumeId) {
        payload.continuationId = resumeId;
      }

      const data = await apiRequest<{ token?: string }>("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!data?.token) {
        throw new Error("Missing application token");
      }
      localStorage.setItem("applicationToken", data.token);
      localStorage.setItem("boreal_email", formValues.email);
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
            <p style={components.form.subtitle}>Tell us how your business is registered.</p>

            {resumeId ? (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-4">
                We found an existing readiness profile. Continue your application below.
              </div>
            ) : null}

            <label style={components.form.label} htmlFor="companyName">
              Legal business name
            </label>
            <Input
              id="companyName"
              placeholder="Boreal Coffee Company"
              value={formValues.companyName}
              disabled={Boolean(resumeId)}
              onChange={(e) => setFormValues((prev) => ({ ...prev, companyName: e.target.value }))}
            />

            <label style={components.form.label} htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@business.com"
              value={formValues.email}
              disabled={Boolean(resumeId)}
              onChange={(e) => {
                const email = e.target.value;
                setFormValues((prev) => ({ ...prev, email }));
                localStorage.setItem("boreal_email", email);
              }}
            />

            <label style={components.form.label} htmlFor="operatingProvince">
              Operating province
            </label>
            <Select
              id="operatingProvince"
              value={formValues.operatingProvince}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, operatingProvince: e.target.value }))
              }
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

            <Button disabled={!canSubmit || isSubmitting} onClick={submit} loading={isSubmitting}>
              Continue
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
