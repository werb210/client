import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import {
  useApplication,
  type ApplicantInfo,
  type BusinessPartner,
} from "../../state/application";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

const defaultApplicant: ApplicantInfo = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  homeAddress: "",
  city: "",
  province: "",
  postalCode: "",
  dateOfBirth: "",
  ownershipPercentage: "",
};

export default function Step4() {
  const nav = useNavigate();
  const { token } = useAuthContext();

  const { applicant, partners, setApplicant, setPartners } = useApplication();

  const [form, setForm] = useState<ApplicantInfo>(() => {
    const saved = localStorage.getItem("app_applicant");

    if (saved) {
      try {
        return { ...defaultApplicant, ...(JSON.parse(saved) as ApplicantInfo) };
      } catch (error) {
        console.error("Failed to parse saved applicant info", error);
      }
    }

    return { ...defaultApplicant, ...(applicant ?? {}) };
  });

  const [partnerList, setPartnerList] = useState<BusinessPartner[]>(() => {
    const saved = localStorage.getItem("app_partners");

    if (saved) {
      try {
        return JSON.parse(saved) as BusinessPartner[];
      } catch (error) {
        console.error("Failed to parse saved partners", error);
      }
    }

    return partners ?? [];
  });

  useEffect(() => {
    if (!token) nav("/");
  }, [nav, token]);

  function updateField(key: keyof ApplicantInfo, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addPartner() {
    setPartnerList((prev) => [
      ...prev,
      {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        ownershipPercentage: "",
      },
    ]);
  }

  function updatePartner(index: number, key: keyof BusinessPartner, value: string) {
    const updated = [...partnerList];
    updated[index] = { ...updated[index], [key]: value };
    setPartnerList(updated);
  }

  function removePartner(index: number) {
    const updated = partnerList.filter((_, i) => i !== index);
    setPartnerList(updated);
  }

  function validate() {
    if (!form.firstName) return "Applicant first name required";
    if (!form.lastName) return "Applicant last name required";
    if (!form.phone) return "Applicant phone required";
    if (!form.email) return "Applicant email required";
    if (!form.ownershipPercentage) return "Applicant ownership required";

    for (let i = 0; i < partnerList.length; i++) {
      const p = partnerList[i];
      if (!p.firstName || !p.lastName)
        return `Partner #${i + 1} missing name`;
      if (!p.ownershipPercentage)
        return `Partner #${i + 1} missing ownership`;
    }

    return null;
  }

  function next() {
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    setApplicant(form);
    setPartners(partnerList);

    localStorage.setItem("app_applicant", JSON.stringify(form));
    localStorage.setItem("app_partners", JSON.stringify(partnerList));

    nav("/apply/step-5");
  }

  if (!token) return null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Applicant Information</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          value={form.firstName}
          onChange={(e) => updateField("firstName", e.target.value)}
        />
        <Input
          label="Last Name"
          value={form.lastName}
          onChange={(e) => updateField("lastName", e.target.value)}
        />

        <Input
          label="Email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
        />

        <Input
          label="Home Address"
          value={form.homeAddress}
          onChange={(e) => updateField("homeAddress", e.target.value)}
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

        <Input
          label="Date of Birth"
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => updateField("dateOfBirth", e.target.value)}
        />
        <Input
          label="Ownership Percentage (%)"
          value={form.ownershipPercentage}
          onChange={(e) => updateField("ownershipPercentage", e.target.value)}
        />
      </div>

      <h2 className="text-xl font-semibold mt-10 mb-4">Other Business Partners</h2>

      {partnerList.map((p, idx) => (
        <div key={idx} className="border p-4 rounded-lg mb-4 bg-gray-50">
          <h3 className="font-semibold mb-3">Partner #{idx + 1}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="First Name"
              value={p.firstName}
              onChange={(e) => updatePartner(idx, "firstName", e.target.value)}
            />
            <Input
              label="Last Name"
              value={p.lastName}
              onChange={(e) => updatePartner(idx, "lastName", e.target.value)}
            />

            <Input
              label="Email"
              value={p.email}
              onChange={(e) => updatePartner(idx, "email", e.target.value)}
            />
            <Input
              label="Phone"
              value={p.phone}
              onChange={(e) => updatePartner(idx, "phone", e.target.value)}
            />

            <Input
              label="Date of Birth"
              type="date"
              value={p.dateOfBirth}
              onChange={(e) => updatePartner(idx, "dateOfBirth", e.target.value)}
            />
            <Input
              label="Ownership (%)"
              value={p.ownershipPercentage}
              onChange={(e) => updatePartner(idx, "ownershipPercentage", e.target.value)}
            />
          </div>

          <button
            className="text-red-600 underline mt-3"
            onClick={() => removePartner(idx)}
          >
            Remove Partner
          </button>
        </div>
      ))}

      <button className="mt-4 mb-10 px-4 py-2 bg-gray-200 rounded" onClick={addPartner}>
        + Add Another Partner
      </button>

      <div className="flex justify-between mt-8">
        <button className="text-blue-600 underline" onClick={() => nav("/apply/step-3")}>
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
