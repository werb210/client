import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { useApplication, type BusinessInfo } from "../../state/application";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

const defaultBusiness: BusinessInfo = {
  legalBusinessName: "",
  operatingName: "",
  businessNumber: "",
  industry: "",
  businessStartDate: "",
  annualRevenue: "",
  numberOfEmployees: "",
  website: "",
  businessPhone: "",
  businessEmail: "",
  businessAddress: "",
  city: "",
  province: "",
  postalCode: "",
};

export default function Step3() {
  const nav = useNavigate();
  const { token } = useAuthContext();
  const { business, setBusiness } = useApplication();

  const [form, setForm] = useState<BusinessInfo>(() => {
    const saved = localStorage.getItem("app_business");

    if (saved) {
      try {
        return { ...defaultBusiness, ...(JSON.parse(saved) as BusinessInfo) };
      } catch (error) {
        console.error("Failed to parse saved business info", error);
      }
    }

    return { ...defaultBusiness, ...(business ?? {}) };
  });

  useEffect(() => {
    if (!token) nav("/");
  }, [nav, token]);

  function updateField(key: keyof BusinessInfo, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate() {
    if (!form.legalBusinessName) return "Legal business name required";
    if (!form.businessNumber) return "Business number required";
    if (!form.industry) return "Industry required";
    if (!form.annualRevenue) return "Annual revenue required";
    if (!form.businessAddress) return "Business address required";
    if (!form.city) return "City required";
    if (!form.province) return "Province required";
    if (!form.postalCode) return "Postal code required";
    return null;
  }

  function next() {
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    setBusiness(form);
    localStorage.setItem("app_business", JSON.stringify(form));
    nav("/apply/step-4");
  }

  if (!token) return null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Business Information</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Legal Business Name"
          value={form.legalBusinessName}
          onChange={(e) => updateField("legalBusinessName", e.target.value)}
        />
        <Input
          label="Operating Name"
          value={form.operatingName}
          onChange={(e) => updateField("operatingName", e.target.value)}
        />

        <Input
          label="Business Number (BN)"
          value={form.businessNumber}
          onChange={(e) => updateField("businessNumber", e.target.value)}
        />
        <Input
          label="Industry"
          value={form.industry}
          onChange={(e) => updateField("industry", e.target.value)}
        />

        <Input
          label="Business Start Date"
          type="date"
          value={form.businessStartDate}
          onChange={(e) => updateField("businessStartDate", e.target.value)}
        />
        <Input
          label="Annual Revenue"
          value={form.annualRevenue}
          onChange={(e) => updateField("annualRevenue", e.target.value)}
        />

        <Input
          label="Employees"
          value={form.numberOfEmployees}
          onChange={(e) => updateField("numberOfEmployees", e.target.value)}
        />
        <Input
          label="Website"
          value={form.website}
          onChange={(e) => updateField("website", e.target.value)}
        />

        <Input
          label="Business Phone"
          value={form.businessPhone}
          onChange={(e) => updateField("businessPhone", e.target.value)}
        />
        <Input
          label="Business Email"
          value={form.businessEmail}
          onChange={(e) => updateField("businessEmail", e.target.value)}
        />

        <Input
          label="Street Address"
          value={form.businessAddress}
          onChange={(e) => updateField("businessAddress", e.target.value)}
        />
        <Input
          label="City"
          value={form.city}
          onChange={(e) => updateField("city", e.target.value)}
        />

        <Input
          label="Province"
          value={form.province}
          onChange={(e) => updateField("province", e.target.value)}
        />
        <Input
          label="Postal Code"
          value={form.postalCode}
          onChange={(e) => updateField("postalCode", e.target.value)}
        />
      </div>

      <div className="flex justify-between mt-8">
        <button className="text-blue-600 underline" onClick={() => nav("/apply/step-2")}>
          Back
        </button>

        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
          onClick={next}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function Input({ label, ...props }: InputProps) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">{label}</label>
      <input {...props} className="border rounded-lg p-2" />
    </div>
  );
}
