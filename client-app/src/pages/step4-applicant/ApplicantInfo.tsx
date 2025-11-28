import { useEffect, useState } from "react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import {
  type ApplicantInfoData,
  useApplicationStore,
} from "../../state/applicationStore";
import { useAutosave } from "@/hooks/useAutosave";
import { useAuthContext } from "@/context/AuthContext";

import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { SelectInput } from "../../components/ui/SelectInput";
import { Card } from "../../components/ui/Card";
import { PageContainer } from "../../components/layout/PageContainer";

export const ApplicantSchema: z.ZodType<ApplicantInfoData> = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email(),
  homeAddress: z.string().min(3),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().min(3),
  sin: z.string().min(3),
  dateOfBirth: z.string().min(3),
  creditScoreBand: z.string().min(1),
  hasBusinessPartner: z.boolean(),
  partnerFirstName: z.string().optional(),
  partnerLastName: z.string().optional(),
  partnerEmail: z.string().optional(),
  partnerPhone: z.string().optional(),
});

export default function ApplicantInfo() {
  const navigate = useNavigate();
  const { token } = useAuthContext();
  const { businessInfo, applicantInfo, setApplicantInfo, saveToServer, setStep } =
    useApplicationStore();

  const [form, setForm] = useState<ApplicantInfoData>({
    firstName: applicantInfo.firstName,
    lastName: applicantInfo.lastName,
    phone: applicantInfo.phone,
    email: applicantInfo.email,
    homeAddress: applicantInfo.homeAddress,
    city: applicantInfo.city,
    province: applicantInfo.province,
    postalCode: applicantInfo.postalCode,
    sin: applicantInfo.sin,
    dateOfBirth: applicantInfo.dateOfBirth,
    creditScoreBand: applicantInfo.creditScoreBand,
    hasBusinessPartner: businessInfo.hasBusinessPartner,
    partnerFirstName: applicantInfo.partnerFirstName,
    partnerLastName: applicantInfo.partnerLastName,
    partnerEmail: applicantInfo.partnerEmail,
    partnerPhone: applicantInfo.partnerPhone,
  });

  useAutosave("applicant", [applicantInfo]);

  useEffect(() => {
    setForm({
      firstName: applicantInfo.firstName,
      lastName: applicantInfo.lastName,
      phone: applicantInfo.phone,
      email: applicantInfo.email,
      homeAddress: applicantInfo.homeAddress,
      city: applicantInfo.city,
      province: applicantInfo.province,
      postalCode: applicantInfo.postalCode,
      sin: applicantInfo.sin,
      dateOfBirth: applicantInfo.dateOfBirth,
      creditScoreBand: applicantInfo.creditScoreBand,
      hasBusinessPartner: businessInfo.hasBusinessPartner,
      partnerFirstName: applicantInfo.partnerFirstName,
      partnerLastName: applicantInfo.partnerLastName,
      partnerEmail: applicantInfo.partnerEmail,
      partnerPhone: applicantInfo.partnerPhone,
    });
  }, [applicantInfo, businessInfo.hasBusinessPartner]);

  function update(field: keyof ApplicantInfoData, value: unknown) {
    setForm((prev) => {
      const next = { ...prev, [field]: value } as ApplicantInfoData;
      setApplicantInfo(next);
      return next;
    });
  }

  function handleNext() {
    const parsed = ApplicantSchema.safeParse(form);
    if (!parsed.success) {
      alert("Please complete all required fields.");
      return;
    }

    setApplicantInfo(parsed.data);
    setStep(3);
    navigate("/step5-documents");
  }

  async function handleSaveForLater() {
    await saveToServer(token ?? null);
    alert("Progress saved");
  }

  return (
    <PageContainer title="Applicant Information">
      <Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput
            label="First Name"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            required
          />

          <TextInput
            label="Last Name"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput
            label="Phone Number"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            required
          />

          <TextInput
            label="Email Address"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </div>

        <TextInput
          label="Home Address"
          value={form.homeAddress}
          onChange={(e) => update("homeAddress", e.target.value)}
          required
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TextInput
            label="City"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            required
          />

          <TextInput
            label="Province"
            value={form.province}
            onChange={(e) => update("province", e.target.value)}
            required
          />

          <TextInput
            label="Postal Code"
            value={form.postalCode}
            onChange={(e) => update("postalCode", e.target.value)}
            required
          />
        </div>

        <TextInput
          label="SIN"
          value={form.sin}
          onChange={(e) => update("sin", e.target.value)}
          required
        />

        <TextInput
          label="Date of Birth"
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => update("dateOfBirth", e.target.value)}
          required
        />

        <SelectInput
          label="Credit Score Range"
          value={form.creditScoreBand}
          onChange={(e) => update("creditScoreBand", e.target.value)}
          options={[
            "300–579 (Poor)",
            "580–669 (Fair)",
            "670–739 (Good)",
            "740–799 (Very Good)",
            "800+ (Excellent)",
          ]}
          required
        />
      </Card>

      {businessInfo.hasBusinessPartner && (
        <Card className="mt-6">
          <h2 className="mb-4 text-xl font-semibold">Business Partner Information</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput
              label="Partner First Name"
              value={form.partnerFirstName ?? ""}
              onChange={(e) => update("partnerFirstName", e.target.value)}
              required
            />

            <TextInput
              label="Partner Last Name"
              value={form.partnerLastName ?? ""}
              onChange={(e) => update("partnerLastName", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput
              label="Partner Email"
              value={form.partnerEmail ?? ""}
              onChange={(e) => update("partnerEmail", e.target.value)}
              required
            />

            <TextInput
              label="Partner Phone"
              value={form.partnerPhone ?? ""}
              onChange={(e) => update("partnerPhone", e.target.value)}
              required
            />
          </div>
        </Card>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={() => navigate("/step3-business")}>
          Back
        </Button>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleSaveForLater}>
            Save for later
          </Button>

          <Button variant="primary" onClick={handleNext}>
            Next
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
