import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  getStoredReadinessSessionId,
  getStoredReadinessToken,
  submitCreditReadiness,
} from "@/api/website";
import { createLead } from "@/services/lead";

function resolveContinueUrl(payload: Record<string, any>, fallbackLeadId: string) {
  const token =
    payload?.readinessToken ||
    payload?.token ||
    payload?.readinessSessionId ||
    payload?.sessionId ||
    getStoredReadinessToken() ||
    getStoredReadinessSessionId();
  if (typeof payload?.continueUrl === "string" && payload.continueUrl.trim()) {
    return payload.continueUrl;
  }
  if (typeof token === "string" && token.trim()) {
    return `/apply?continue=${encodeURIComponent(token)}`;
  }
  return `/apply?lead=${encodeURIComponent(fallbackLeadId)}`;
}

export default function CapitalReadiness() {
  const [form, setForm] = useState({
    companyName: "",
    fullName: "",
    phone: "",
    email: "",
    industry: "",
    yearsInBusiness: "",
    annualRevenue: "",
    monthlyRevenue: "",
    arOutstanding: "",
    existingDebt: "",
    requestedAmount: "",
    creditScoreRange: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const contactData = {
      companyName: form.companyName,
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
      industry: form.industry,
    };

    setIsSubmitting(true);
    setError(null);
    try {
      const existingReadinessSessionId = getStoredReadinessSessionId();

      const readinessSession = await submitCreditReadiness({
        ...contactData,
        yearsInBusiness: form.yearsInBusiness,
        annualRevenue: form.annualRevenue,
        monthlyRevenue: form.monthlyRevenue,
        arOutstanding: form.arOutstanding,
        existingDebt: form.existingDebt,
      });

      const readinessLeadId =
        typeof readinessSession?.leadId === "string" ? readinessSession.leadId : null;
      const cachedLeadId = localStorage.getItem("leadId");

      let leadId = readinessLeadId || cachedLeadId || "";

      if (!existingReadinessSessionId && !leadId) {
        const lead = await createLead(contactData);
        leadId = lead.leadId;
        localStorage.setItem("pendingApplicationId", lead.pendingApplicationId);
      }

      if (leadId) {
        localStorage.setItem("leadId", leadId);
      }
      localStorage.setItem("leadEmail", form.email);

      const continueUrl = resolveContinueUrl(readinessSession || {}, leadId || "readiness");
      window.location.href = continueUrl;
    } catch {
      setError("Unable to submit readiness right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-20">
      <h1 className="text-4xl font-bold mb-8">Credit Readiness</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        {Object.keys(form).map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field.replace(/([A-Z])/g, " $1")}
            value={(form as Record<string, string>)[field]}
            onChange={handleChange}
            className="w-full p-3 rounded bg-gray-200 text-black"
          />
        ))}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-black text-white p-3 rounded disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Check Capital Readiness"}
        </button>
      </form>
    </div>
  );
}
