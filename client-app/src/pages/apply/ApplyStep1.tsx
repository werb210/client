import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ANNUAL_REVENUE,
  AR_BALANCE,
  COLLATERAL,
  MONTHLY_REVENUE,
  YEARS_IN_BUSINESS,
} from "@/constants/creditEnums";

export default function Step1() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: "",
    fullName: "",
    phone: "",
    email: "",
    industry: "",
    yearsInBusiness: "",
    annualRevenue: "",
    monthlyRevenue: "",
    arBalance: "",
    collateral: "",
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    sessionStorage.setItem("application_step1", JSON.stringify(form));
    navigate("/apply/step-2");
  };

  return (
    <div className="min-h-screen bg-[#081225] text-white px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Step 1 — Business Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <input
          autoComplete="organization"
          placeholder="Company Name"
          className="input"
          value={form.companyName}
          onChange={(e) => update("companyName", e.target.value)}
        />

        <input
          autoComplete="name"
          placeholder="Full Name"
          className="input"
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
        />

        <input
          autoComplete="tel"
          placeholder="Phone"
          className="input"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />

        <input
          autoComplete="email"
          type="email"
          placeholder="Email"
          className="input"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />

        <select
          className="input"
          value={form.industry}
          onChange={(e) => update("industry", e.target.value)}
        >
          <option value="">Industry</option>
          <option>Construction</option>
          <option>Manufacturing</option>
          <option>Transportation</option>
          <option>Wholesale</option>
          <option>Retail</option>
          <option>Professional Services</option>
          <option>Other</option>
        </select>

        <select
          className="input"
          value={form.yearsInBusiness}
          onChange={(e) => update("yearsInBusiness", e.target.value)}
        >
          <option value="">Years in business</option>
          {YEARS_IN_BUSINESS.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <select
          className="input"
          value={form.annualRevenue}
          onChange={(e) => update("annualRevenue", e.target.value)}
        >
          <option value="">Annual revenue</option>
          {ANNUAL_REVENUE.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <select
          className="input"
          value={form.monthlyRevenue}
          onChange={(e) => update("monthlyRevenue", e.target.value)}
        >
          <option value="">Average monthly revenue</option>
          {MONTHLY_REVENUE.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <select
          className="input"
          value={form.arBalance}
          onChange={(e) => update("arBalance", e.target.value)}
        >
          <option value="">Account Receivables</option>
          {AR_BALANCE.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <select
          className="input"
          value={form.collateral}
          onChange={(e) => update("collateral", e.target.value)}
        >
          <option value="">Is there available collateral for security?</option>
          {COLLATERAL.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

      </div>

      <div className="mt-10">
        <button
          onClick={handleNext}
          className="bg-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-500 transition"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
