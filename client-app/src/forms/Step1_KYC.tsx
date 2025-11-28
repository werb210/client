import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApplicationLayout from "../components/application/ApplicationLayout";
import WizardWrapper from "../components/application/WizardWrapper";
import { useApplication } from "../context/ApplicationContext";
import { wizardSteps } from "../routes/ApplicationWizard";

const Step1_KYC = () => {
  const navigate = useNavigate();
  const { applicationData, updateKyc } = useApplication();
  const [localState, setLocalState] = useState(applicationData.kyc);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    updateKyc(localState);
    navigate("/application/step-2");
  };

  const isValid = useMemo(() => {
    return (
      Boolean(localState.businessType) &&
      localState.timeInBusiness !== null &&
      localState.timeInBusiness >= 0 &&
      localState.monthlyRevenue !== null &&
      localState.monthlyRevenue >= 0 &&
      localState.annualRevenue !== null &&
      localState.annualRevenue >= 0 &&
      Boolean(localState.industry)
    );
  }, [localState]);

  const handleNumberChange = (field: "timeInBusiness" | "monthlyRevenue" | "annualRevenue") =>
    (value: string) => {
      const parsed = value === "" ? null : Number(value);
      setLocalState((prev) => ({ ...prev, [field]: Number.isNaN(parsed) ? null : parsed }));
    };

  return (
    <ApplicationLayout title="KYC Questions">
      <WizardWrapper stepNumber={1} totalSteps={wizardSteps.length}>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: "16px", maxWidth: "700px" }}>
          <label style={{ display: "grid", gap: "8px" }}>
            Business type
            <select
              value={localState.businessType}
              onChange={(e) =>
                setLocalState((prev) => ({ ...prev, businessType: e.target.value }))
              }
              required
            >
              <option value="">Select business type</option>
              <option value="sole_proprietorship">Sole Proprietorship</option>
              <option value="partnership">Partnership</option>
              <option value="corporation">Corporation</option>
              <option value="llc">LLC</option>
              <option value="nonprofit">Non-profit</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: "8px" }}>
            Time in business (months)
            <input
              type="number"
              min={0}
              value={localState.timeInBusiness ?? ""}
              onChange={(e) => handleNumberChange("timeInBusiness")(e.target.value)}
              required
            />
          </label>

          <label style={{ display: "grid", gap: "8px" }}>
            Monthly revenue ($)
            <input
              type="number"
              min={0}
              value={localState.monthlyRevenue ?? ""}
              onChange={(e) => handleNumberChange("monthlyRevenue")(e.target.value)}
              required
            />
          </label>

          <label style={{ display: "grid", gap: "8px" }}>
            Annual revenue ($)
            <input
              type="number"
              min={0}
              value={localState.annualRevenue ?? ""}
              onChange={(e) => handleNumberChange("annualRevenue")(e.target.value)}
              required
            />
          </label>

          <label style={{ display: "grid", gap: "8px" }}>
            Industry
            <select
              value={localState.industry}
              onChange={(e) => setLocalState((prev) => ({ ...prev, industry: e.target.value }))}
              required
            >
              <option value="">Select industry</option>
              <option value="construction">Construction</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="retail">Retail</option>
              <option value="technology">Technology</option>
              <option value="hospitality">Hospitality</option>
              <option value="professional_services">Professional Services</option>
            </select>
          </label>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button type="submit" disabled={!isValid}>
              Next
            </button>
          </div>
        </form>
      </WizardWrapper>
    </ApplicationLayout>
  );
};

export default Step1_KYC;
