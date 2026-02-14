import { useState } from "react";
import api from "@/api";

export default function CapitalReadiness() {
  const [form, setForm] = useState({
    companyName: "",
    fullName: "",
    phone: "",
    email: "",
    yearsInBusiness: "",
    annualRevenue: "",
    monthlyRevenue: "",
    requestedAmount: "",
    creditScoreRange: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const contactData = {
      companyName: form.companyName,
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
    };

    const res = await api.post("/ai/continue-application", {
      contactData,
    });

    window.location.href = res.data.continueUrl;
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
            value={(form as any)[field]}
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
