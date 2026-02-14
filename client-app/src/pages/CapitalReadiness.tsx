import { useState, type ChangeEvent, type FormEvent } from "react";
import { submitCreditReadiness, getStoredReadinessSessionId } from "@/api/website";
import { createLead } from "@/services/lead";

function resolveContinueUrl(payload: Record<string, any>, fallbackLeadId: string) {
  const token =
    payload?.readinessSessionId ||
    payload?.sessionId ||
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
    requestedAmount: "",
    creditScoreRange: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const contactData = {
      companyName: form.companyName,
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
      industry: form.industry,
    };

    try {
      const { leadId, pendingApplicationId } = await createLead(contactData);
      localStorage.setItem("leadId", leadId);
      localStorage.setItem("pendingApplicationId", pendingApplicationId);
      localStorage.setItem("leadEmail", form.email);

      const readinessSession = await submitCreditReadiness({
        ...contactData,
        yearsInBusiness: form.yearsInBusiness,
        annualRevenue: form.annualRevenue,
        monthlyRevenue: form.monthlyRevenue,
      });

      const continueUrl = resolveContinueUrl(readinessSession || {}, leadId);
      window.location.href = continueUrl;
    } catch {
      alert("Unable to submit readiness right now. Please try again.");
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

        <button
          type="submit"
          className="w-full bg-black text-white p-3 rounded"
        >
          Check Capital Readiness
        </button>
      </form>
    </div>
  );
}
