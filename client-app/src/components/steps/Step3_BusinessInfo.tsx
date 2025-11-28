import React from "react";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormPhone } from "@/components/ui/FormPhone";
import { Button } from "@/components/ui/Button";

interface Step3Props {
  data: any;
  update: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3_BusinessInfo({
  data,
  update,
  onNext,
  onBack
}: Step3Props) {
  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900">
        Business Information
      </h2>

      <FormInput
        label="Legal Business Name"
        value={data.legalName}
        onChange={(v) => update("legalName", v)}
        placeholder="Enter legal business name"
        required
      />

      <FormInput
        label="Operating / Trade Name"
        value={data.tradeName}
        onChange={(v) => update("tradeName", v)}
        placeholder="Enter operating name (optional)"
      />

      <FormInput
        label="Business Address"
        value={data.address}
        onChange={(v) => update("address", v)}
        placeholder="Enter street address"
        required
      />

      <FormInput
        label="City"
        value={data.city}
        onChange={(v) => update("city", v)}
        placeholder="Enter city"
        required
      />

      <FormSelect
        label="Province"
        value={data.province}
        onChange={(v) => update("province", v)}
        options={[
          "AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"
        ]}
        required
      />

      <FormInput
        label="Postal Code"
        value={data.postalCode}
        onChange={(v) => update("postalCode", v)}
        placeholder="A1A 1A1"
        required
      />

      <FormInput
        label="Business Start Date"
        type="date"
        value={data.startDate}
        onChange={(v) => update("startDate", v)}
        required
      />

      <FormSelect
        label="Business Structure"
        value={data.structure}
        onChange={(v) => update("structure", v)}
        options={[
          "Sole Proprietor",
          "Partnership",
          "Corporation",
          "Non-profit"
        ]}
        required
      />

      <FormPhone
        label="Business Phone Number"
        value={data.businessPhone}
        onChange={(v) => update("businessPhone", v)}
        required
      />

      <FormInput
        label="Business Email"
        type="email"
        value={data.businessEmail}
        onChange={(v) => update("businessEmail", v)}
        placeholder="business@example.com"
        required
      />

      <FormInput
        label="Website URL (optional)"
        value={data.website}
        onChange={(v) => update("website", v)}
        placeholder="https://yourcompany.com"
      />

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

