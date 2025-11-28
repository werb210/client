import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { SelectInput } from "../../components/ui/SelectInput";
import { TextInput } from "../../components/ui/TextInput";
import { YesNo } from "../../components/ui/YesNo";
import {
  emptyBusinessInfo,
  type BusinessInfoData,
  useApplicationStore,
} from "../../state/applicationStore";

export const BusinessInfoSchema = z.object({
  businessName: z.string().trim().min(2, "Legal business name is required."),
  businessWebsite: z
    .string()
    .trim()
    .url("Enter a valid website URL.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
  businessPhone: z.string().trim().min(7, "Business phone is required."),
  businessEmail: z.string().trim().email("Enter a valid email address."),
  businessAddress: z.string().trim().min(3, "Street address is required."),
  businessCity: z.string().trim().min(2, "City is required."),
  businessProvince: z.string().trim().min(2, "Province is required."),
  businessPostalCode: z.string().trim().min(3, "Postal code is required."),
  industry: z.string().trim().min(2, "Industry is required."),
  timeInBusiness: z.string().trim().min(1, "Select how long you have been in business."),
  monthlyRevenue: z.string().trim().min(1, "Monthly revenue is required."),
  yearsInBusiness: z.string().trim().min(1, "Years in business is required."),
  hasBusinessPartner: z.boolean(),
});

export type BusinessInfoDataSchema = z.infer<typeof BusinessInfoSchema>;

export default function BusinessInfo() {
  const navigate = useNavigate();
  const { businessInfo, setBusinessInfo } = useApplicationStore();

  const [form, setForm] = useState<BusinessInfoData>(() => ({
    ...emptyBusinessInfo,
    ...businessInfo,
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof BusinessInfoData, string>>>({});

  function update(field: keyof BusinessInfoData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const parsed = BusinessInfoSchema.safeParse({
      ...form,
      businessWebsite: form.businessWebsite?.trim()
        ? form.businessWebsite.trim()
        : undefined,
    });

    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof BusinessInfoData, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof BusinessInfoData | undefined;
        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setBusinessInfo(parsed.data);
    navigate("/step4-applicant");
  }

  return (
    <PageContainer
      title="Business Information"
      description="Tell us about your business so we can tailor the application to you."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-4">
          <TextInput
            label="Legal Business Name"
            value={form.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            required
            error={errors.businessName}
          />

          <TextInput
            label="Business Website (optional)"
            value={form.businessWebsite ?? ""}
            onChange={(e) => update("businessWebsite", e.target.value)}
            placeholder="https://example.com"
            error={errors.businessWebsite}
          />

          <TextInput
            label="Business Phone Number"
            value={form.businessPhone}
            onChange={(e) => update("businessPhone", e.target.value)}
            required
            error={errors.businessPhone}
          />

          <TextInput
            label="Business Email"
            value={form.businessEmail}
            onChange={(e) => update("businessEmail", e.target.value)}
            required
            error={errors.businessEmail}
          />

          <TextInput
            label="Business Street Address"
            value={form.businessAddress}
            onChange={(e) => update("businessAddress", e.target.value)}
            required
            error={errors.businessAddress}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <TextInput
              label="City"
              value={form.businessCity}
              onChange={(e) => update("businessCity", e.target.value)}
              required
              error={errors.businessCity}
            />
            <TextInput
              label="Province"
              value={form.businessProvince}
              onChange={(e) => update("businessProvince", e.target.value)}
              required
              error={errors.businessProvince}
            />
            <TextInput
              label="Postal Code"
              value={form.businessPostalCode}
              onChange={(e) => update("businessPostalCode", e.target.value)}
              required
              error={errors.businessPostalCode}
            />
          </div>

          <SelectInput
            label="Industry"
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
            options={[
              "Construction",
              "Retail",
              "Restaurant",
              "Professional Services",
              "Transportation",
              "Manufacturing",
              "Healthcare",
              "Technology",
              "Other",
            ]}
            required
            error={errors.industry}
          />

          <SelectInput
            label="Time in Business"
            value={form.timeInBusiness}
            onChange={(e) => update("timeInBusiness", e.target.value)}
            options={["0–6 months", "6–12 months", "1–2 years", "2–5 years", "5+ years"]}
            required
            error={errors.timeInBusiness}
          />

          <SelectInput
            label="Monthly Revenue"
            value={form.monthlyRevenue}
            onChange={(e) => update("monthlyRevenue", e.target.value)}
            options={[
              "< $10,000",
              "$10,000 – $25,000",
              "$25,000 – $50,000",
              "$50,000 – $100,000",
              "$100,000+",
            ]}
            required
            error={errors.monthlyRevenue}
          />

          <SelectInput
            label="Years in Business"
            value={form.yearsInBusiness}
            onChange={(e) => update("yearsInBusiness", e.target.value)}
            options={["Less than 1 year", "1–2 years", "2–3 years", "3–5 years", "5+ years"]}
            required
            error={errors.yearsInBusiness}
          />

          <YesNo
            label="Do you have a business partner?"
            value={form.hasBusinessPartner}
            onChange={(value) => update("hasBusinessPartner", value)}
          />
        </Card>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Button type="button" variant="secondary" onClick={() => navigate("/step2-product")}>
            Back
          </Button>

          <Button type="submit" variant="primary">
            Next
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
