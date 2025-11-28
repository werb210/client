import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApplicationLayout from "../components/application/ApplicationLayout";
import WizardWrapper from "../components/application/WizardWrapper";
import { BusinessDetails, useApplication } from "../context/ApplicationContext";
import { wizardSteps } from "../routes/ApplicationWizard";

const Step2_BusinessDetails = () => {
  const navigate = useNavigate();
  const { applicationData, updateBusinessDetails } = useApplication();
  const [localState, setLocalState] = useState<BusinessDetails>(
    applicationData.businessDetails
  );

  const isValid = useMemo(() => {
    return (
      Boolean(localState.useOfFunds) &&
      localState.numberOfEmployees !== null &&
      localState.numberOfEmployees >= 0 &&
      Boolean(localState.addressLine1) &&
      Boolean(localState.city) &&
      Boolean(localState.province) &&
      Boolean(localState.postalCode)
    );
  }, [localState]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    updateBusinessDetails(localState);
    navigate("/application/step-3");
  };

  const handleNumberChange = (value: string) => {
    const parsed = value === "" ? null : Number(value);
    setLocalState((prev) => ({
      ...prev,
      numberOfEmployees: Number.isNaN(parsed) ? null : parsed,
    }));
  };

  const handleChange = (field: keyof BusinessDetails, value: string | boolean) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ApplicationLayout title="Business Details">
      <WizardWrapper stepNumber={2} totalSteps={wizardSteps.length}>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px", maxWidth: "700px" }}>
          <label style={{ display: "grid", gap: "8px" }}>
            Use of funds
            <textarea
              value={localState.useOfFunds}
              onChange={(e) => handleChange("useOfFunds", e.target.value)}
              rows={3}
              required
            />
          </label>

          <label style={{ display: "grid", gap: "8px" }}>
            Number of employees
            <input
              type="number"
              min={0}
              value={localState.numberOfEmployees ?? ""}
              onChange={(e) => handleNumberChange(e.target.value)}
              required
            />
          </label>

          <fieldset style={{ display: "grid", gap: "12px", border: "1px solid #ddd", padding: "16px" }}>
            <legend>Business address</legend>
            <label style={{ display: "grid", gap: "8px" }}>
              Address line 1
              <input
                type="text"
                value={localState.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
                required
              />
            </label>
            <label style={{ display: "grid", gap: "8px" }}>
              Address line 2 (optional)
              <input
                type="text"
                value={localState.addressLine2}
                onChange={(e) => handleChange("addressLine2", e.target.value)}
              />
            </label>
            <label style={{ display: "grid", gap: "8px" }}>
              City
              <input
                type="text"
                value={localState.city}
                onChange={(e) => handleChange("city", e.target.value)}
                required
              />
            </label>
            <label style={{ display: "grid", gap: "8px" }}>
              Province/State
              <input
                type="text"
                value={localState.province}
                onChange={(e) => handleChange("province", e.target.value)}
                required
              />
            </label>
            <label style={{ display: "grid", gap: "8px" }}>
              Postal code
              <input
                type="text"
                value={localState.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                required
              />
            </label>
          </fieldset>

          <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={localState.purchasingEquipment}
              onChange={(e) => handleChange("purchasingEquipment", e.target.checked)}
            />
            Are you purchasing equipment?
          </label>

          <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={localState.issuesInvoices}
              onChange={(e) => handleChange("issuesInvoices", e.target.checked)}
            />
            Do you issue invoices to other businesses?
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

export default Step2_BusinessDetails;
