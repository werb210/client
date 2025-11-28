import React, { useState } from "react";
import { FormInput } from "@/components/ui/FormInput";
import { FormPhone } from "@/components/ui/FormPhone";
import { FormSelect } from "@/components/ui/FormSelect";
import { Button } from "@/components/ui/Button";

interface Step4Props {
  data: any;
  update: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4_ApplicantInfo({
  data,
  update,
  onNext,
  onBack
}: Step4Props) {
  const [hasPartner, setHasPartner] = useState(
    data.partnerEnabled || false
  );

  return (
    <div className="flex flex-col gap-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900">
        Applicant Information
      </h2>

      {/* PRIMARY APPLICANT */}
      <div className="flex flex-col gap-6">
        <FormInput
          label="First Name"
          value={data.applicantFirst}
          onChange={(v) => update("applicantFirst", v)}
          required
        />

        <FormInput
          label="Last Name"
          value={data.applicantLast}
          onChange={(v) => update("applicantLast", v)}
          required
        />

        <FormInput
          label="Applicant Email"
          type="email"
          value={data.applicantEmail}
          onChange={(v) => update("applicantEmail", v)}
          required
        />

        <FormPhone
          label="Mobile Phone"
          value={data.applicantPhone}
          onChange={(v) => update("applicantPhone", v)}
          required
        />

        <FormInput
          label="Date of Birth"
          type="date"
          value={data.applicantDob}
          onChange={(v) => update("applicantDob", v)}
          required
        />

        <FormInput
          label="Home Address"
          value={data.applicantAddress}
          onChange={(v) => update("applicantAddress", v)}
          required
        />

        <FormInput
          label="City"
          value={data.applicantCity}
          onChange={(v) => update("applicantCity", v)}
          required
        />

        <FormSelect
          label="Province"
          value={data.applicantProvince}
          onChange={(v) => update("applicantProvince", v)}
          options={[
            "AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"
          ]}
          required
        />

        <FormInput
          label="Postal Code"
          value={data.applicantPostal}
          onChange={(v) => update("applicantPostal", v)}
          required
        />

        <FormSelect
          label="Role in Business"
          value={data.role}
          onChange={(v) => update("role", v)}
          options={[
            "Owner",
            "Partner",
            "Director"
          ]}
          required
        />

        <FormInput
          label="Ownership Percentage"
          type="number"
          value={data.ownershipPct}
          onChange={(v) => update("ownershipPct", v)}
          min={1}
          max={100}
          required
        />
      </div>

      {/* ADD A PARTNER? */}
      <div className="border-t pt-6">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={hasPartner}
            onChange={(e) => {
              setHasPartner(e.target.checked);
              update("partnerEnabled", e.target.checked);
            }}
          />
          <span className="text-gray-800 font-medium">
            Add a business partner?
          </span>
        </label>
      </div>

      {/* PARTNER FIELDS */}
      {hasPartner && (
        <div className="flex flex-col gap-6 bg-gray-50 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">Business Partner</h3>

          <FormInput
            label="First Name"
            value={data.partnerFirst}
            onChange={(v) => update("partnerFirst", v)}
            required
          />

          <FormInput
            label="Last Name"
            value={data.partnerLast}
            onChange={(v) => update("partnerLast", v)}
            required
          />

          <FormInput
            label="Partner Email"
            type="email"
            value={data.partnerEmail}
            onChange={(v) => update("partnerEmail", v)}
            required
          />

          <FormPhone
            label="Mobile Phone"
            value={data.partnerPhone}
            onChange={(v) => update("partnerPhone", v)}
            required
          />

          <FormInput
            label="Ownership Percentage"
            type="number"
            value={data.partnerOwnershipPct}
            onChange={(v) => update("partnerOwnershipPct", v)}
            min={1}
            max={100}
            required
          />
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>

        <Button variant="primary" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}

