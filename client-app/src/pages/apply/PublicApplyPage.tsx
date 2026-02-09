import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPublicApplication } from "../../api/applications";

type FieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "select"
  | "url"
  | "textarea";

type FieldConfig = {
  name: keyof ApplicationFormValues;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

export type ApplicationFormValues = {
  business_legal_name: string;
  operating_name: string;
  business_address: string;
  years_in_business: string;
  start_date: string;
  business_structure: string;
  industry: string;
  requested_amount: string;
  use_of_funds: string;
  product_category: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;
};

export type PublicApplicationPayload = {
  business_legal_name: string;
  operating_name: string;
  business_address: string;
  start_date: string;
  business_structure: string;
  industry: string;
  requested_amount: number;
  use_of_funds: string;
  product_category: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website_url?: string;
  startup_flag: boolean;
  terms_accepted_at: string;
  communications_consent_at: string;
  client_ip: string;
};

const productCategories = [
  "Working Capital",
  "Equipment Financing",
  "Startup",
  "Expansion",
  "Bridge",
];

const businessStructures = [
  "Sole Proprietorship",
  "Partnership",
  "Corporation",
  "LLC",
  "Nonprofit",
];

const industries = [
  "Retail",
  "Construction",
  "Hospitality",
  "Healthcare",
  "Professional Services",
  "Other",
];

export const applicationFields: FieldConfig[] = [
  {
    name: "business_legal_name",
    label: "Business legal name",
    type: "text",
    required: true,
  },
  {
    name: "operating_name",
    label: "Operating name",
    type: "text",
    required: true,
  },
  {
    name: "business_address",
    label: "Business address",
    type: "textarea",
    required: true,
  },
  {
    name: "years_in_business",
    label: "Years in business",
    type: "number",
    placeholder: "e.g., 3",
  },
  {
    name: "start_date",
    label: "Business start date",
    type: "date",
  },
  {
    name: "business_structure",
    label: "Business structure",
    type: "select",
    required: true,
    options: businessStructures,
  },
  {
    name: "industry",
    label: "Industry",
    type: "select",
    required: true,
    options: industries,
  },
  {
    name: "requested_amount",
    label: "Requested amount",
    type: "number",
    required: true,
    placeholder: "e.g., 50000",
  },
  {
    name: "use_of_funds",
    label: "Use of funds",
    type: "textarea",
    required: true,
  },
  {
    name: "product_category",
    label: "Product category",
    type: "select",
    required: true,
    options: productCategories,
  },
  {
    name: "contact_name",
    label: "Contact name",
    type: "text",
    required: true,
  },
  {
    name: "contact_email",
    label: "Contact email",
    type: "email",
    required: true,
  },
  {
    name: "contact_phone",
    label: "Contact phone",
    type: "tel",
    required: true,
  },
  {
    name: "website_url",
    label: "Website URL (optional)",
    type: "url",
    placeholder: "https://",
  },
];

const baseFieldNames = applicationFields
  .filter((field) => field.required)
  .map((field) => field.name)
  .filter((field) => field !== "years_in_business" && field !== "start_date");

export const initialValues: ApplicationFormValues = {
  business_legal_name: "",
  operating_name: "",
  business_address: "",
  years_in_business: "",
  start_date: "",
  business_structure: "",
  industry: "",
  requested_amount: "",
  use_of_funds: "",
  product_category: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  website_url: "",
};

export function validateApplication(values: ApplicationFormValues) {
  const errors: Record<string, string> = {};

  for (const field of baseFieldNames) {
    if (!values[field]?.trim()) {
      errors[field] = "Required";
    }
  }

  const hasYears = Number(values.years_in_business) > 0;
  const hasStartDate = Boolean(values.start_date);
  if (!hasYears && !hasStartDate) {
    errors.years_in_business = "Provide years in business or a start date";
    errors.start_date = "Provide years in business or a start date";
  }

  if (values.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact_email)) {
    errors.contact_email = "Enter a valid email";
  }

  if (values.requested_amount && Number(values.requested_amount) <= 0) {
    errors.requested_amount = "Enter a positive amount";
  }

  return errors;
}

function deriveStartDate(values: ApplicationFormValues, now = new Date()) {
  if (values.start_date) {
    return values.start_date;
  }

  const years = Number(values.years_in_business);
  if (!Number.isFinite(years) || years <= 0) {
    return "";
  }

  const startYear = now.getFullYear() - Math.floor(years);
  return `${startYear}-01-01`;
}

function deriveYearsInBusiness(values: ApplicationFormValues, now = new Date()) {
  if (values.years_in_business) {
    return Number(values.years_in_business);
  }

  if (!values.start_date) {
    return 0;
  }

  const startYear = new Date(values.start_date).getFullYear();
  return Math.max(0, now.getFullYear() - startYear);
}

export function buildPublicApplicationPayload(
  values: ApplicationFormValues,
  meta: { clientIp: string; termsAcceptedAt: string; communicationsAcceptedAt: string },
  now = new Date()
): PublicApplicationPayload {
  const startDate = deriveStartDate(values, now);
  const normalizedYears = deriveYearsInBusiness(values, now);
  const productCategory = values.product_category.trim();
  const websiteUrl = values.website_url.trim();

  return {
    business_legal_name: values.business_legal_name.trim(),
    operating_name: values.operating_name.trim(),
    business_address: values.business_address.trim(),
    start_date: startDate || `${now.getFullYear()}-01-01`,
    business_structure: values.business_structure.trim(),
    industry: values.industry.trim(),
    requested_amount: Number(values.requested_amount),
    use_of_funds: values.use_of_funds.trim(),
    product_category: productCategory,
    contact_name: values.contact_name.trim(),
    contact_email: values.contact_email.trim(),
    contact_phone: values.contact_phone.trim(),
    website_url: websiteUrl || undefined,
    startup_flag: productCategory.toLowerCase() === "startup" && normalizedYears <= 2,
    terms_accepted_at: meta.termsAcceptedAt,
    communications_consent_at: meta.communicationsAcceptedAt,
    client_ip: meta.clientIp,
  };
}

export function isSubmissionReady(
  values: ApplicationFormValues,
  termsAcceptedAt: string | null,
  communicationsAcceptedAt: string | null
) {
  const errors = validateApplication(values);
  return (
    Object.keys(errors).length === 0 && Boolean(termsAcceptedAt) && Boolean(communicationsAcceptedAt)
  );
}

export async function handlePublicApplicationSubmit({
  values,
  clientIp,
  termsAcceptedAt,
  communicationsAcceptedAt,
  submitApplication,
  onSuccess,
  onError,
}: {
  values: ApplicationFormValues;
  clientIp: string;
  termsAcceptedAt: string | null;
  communicationsAcceptedAt: string | null;
  submitApplication: (payload: PublicApplicationPayload) => Promise<unknown>;
  onSuccess: () => void;
  onError: (errors: Record<string, string>) => void;
}) {
  const errors = validateApplication(values);
  if (!termsAcceptedAt) {
    errors.terms = "Acceptance required";
  }
  if (!communicationsAcceptedAt) {
    errors.communications = "Acceptance required";
  }

  if (Object.keys(errors).length > 0) {
    onError(errors);
    return;
  }

  if (!termsAcceptedAt || !communicationsAcceptedAt) {
    onError({
      terms: "Acceptance required",
      communications: "Acceptance required",
    });
    return;
  }

  const payload = buildPublicApplicationPayload(values, {
    clientIp,
    termsAcceptedAt,
    communicationsAcceptedAt,
  });

  await submitApplication(payload);
  onSuccess();
}

const documentStubEntries = [
  "Business bank statements",
  "Government-issued ID",
  "Articles of incorporation",
];

export default function PublicApplyPage() {
  const [values, setValues] = useState<ApplicationFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clientIp, setClientIp] = useState<string>("");
  const [termsAcceptedAt, setTermsAcceptedAt] = useState<string | null>(null);
  const [communicationsAcceptedAt, setCommunicationsAcceptedAt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data: { ip?: string }) => {
        if (isMounted && data?.ip) {
          setClientIp(data.ip);
        }
      })
      .catch(() => {
        if (isMounted) {
          setClientIp("");
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const canSubmit = useMemo(
    () => isSubmissionReady(values, termsAcceptedAt, communicationsAcceptedAt) && !isSubmitting,
    [values, termsAcceptedAt, communicationsAcceptedAt, isSubmitting]
  );

  const handleChange = (name: keyof ApplicationFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await handlePublicApplicationSubmit({
        values,
        clientIp,
        termsAcceptedAt,
        communicationsAcceptedAt,
        submitApplication: createPublicApplication,
        onSuccess: () => navigate("/apply/success"),
        onError: (nextErrors) => setErrors(nextErrors),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ padding: "32px", maxWidth: 880, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
        Boreal Financial Application
      </h1>
      <p style={{ marginBottom: 24, color: "#4b5563" }}>
        Complete the form below to submit your application. All required fields must be filled in.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
        {applicationFields.map((field) => {
          const value = values[field.name];
          const error = errors[field.name];

          return (
            <label key={field.name} style={{ display: "grid", gap: 8 }}>
              <span style={{ fontWeight: 600 }}>
                {field.label}
                {field.required ? " *" : ""}
              </span>
              {field.type === "select" ? (
                <select
                  value={value}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                  style={{ padding: "10px", borderRadius: 6, border: "1px solid #d1d5db" }}
                >
                  <option value="">Select one</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  value={value}
                  placeholder={field.placeholder}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                  style={{ padding: "10px", borderRadius: 6, border: "1px solid #d1d5db" }}
                  rows={3}
                />
              ) : (
                <input
                  type={field.type}
                  value={value}
                  placeholder={field.placeholder}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                  style={{ padding: "10px", borderRadius: 6, border: "1px solid #d1d5db" }}
                />
              )}
              {error ? <span style={{ color: "#b91c1c" }}>{error}</span> : null}
            </label>
          );
        })}

        <section
          style={{
            padding: 16,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            display: "grid",
            gap: 12,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Document uploads (coming soon)</h2>
          {documentStubEntries.map((entry) => (
            <button
              key={entry}
              type="button"
              disabled
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px dashed #cbd5f5",
                background: "#eef2ff",
                textAlign: "left",
                color: "#6b7280",
              }}
            >
              {entry}
            </button>
          ))}
        </section>

        <section style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <input
              type="checkbox"
              checked={Boolean(termsAcceptedAt)}
              onChange={(event) =>
                setTermsAcceptedAt(event.target.checked ? new Date().toISOString() : null)
              }
            />
            <span>
              I accept the Boreal Financial and Boreal Industries Terms of Service and authorize
              Boreal Financial to act on my behalf.
            </span>
          </label>
          {errors.terms ? <span style={{ color: "#b91c1c" }}>{errors.terms}</span> : null}

          <label style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <input
              type="checkbox"
              checked={Boolean(communicationsAcceptedAt)}
              onChange={(event) =>
                setCommunicationsAcceptedAt(event.target.checked ? new Date().toISOString() : null)
              }
            />
            <span>
              I consent to receive communications via phone, SMS, email, chat, and AI-assisted
              messaging.
            </span>
          </label>
          {errors.communications ? (
            <span style={{ color: "#b91c1c" }}>{errors.communications}</span>
          ) : null}
        </section>

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            padding: "12px 20px",
            borderRadius: 8,
            border: "none",
            background: canSubmit ? "#111827" : "#9ca3af",
            color: "white",
            fontWeight: 600,
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          Submit application
        </button>
        <p style={{ color: "#6b7280", fontSize: 12 }}>
          Client IP captured: {clientIp || "Unavailable"}
        </p>
      </form>
    </main>
  );
}
