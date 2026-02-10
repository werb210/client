import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../state/useApplicationStore";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { RegionSelect } from "../components/RegionSelect";
import { Validate } from "../utils/validate";
import {
  formatCurrencyValue,
  formatPostalCode,
  formatPhoneNumber,
  getCountryCode,
  getPostalLabel,
  getRegionLabel,
  sanitizeCurrencyInput,
} from "../utils/location";
import { WizardLayout } from "../components/WizardLayout";
import { PhoneInput } from "../components/ui/PhoneInput";
import { components, layout, tokens } from "@/styles";
import { resolveStepGuard } from "./stepGuard";
import { loadStepData, mergeDraft, saveStepData } from "../client/autosave";
import { AddressAutocompleteInput } from "../components/ui/AddressAutocompleteInput";
import {
  getNextEmptyFieldKey,
  getNextFieldKey,
  getWizardFieldId,
} from "./wizardSchema";

export function Step3_Business() {
  const { app, update, autosaveError } = useApplicationStore();
  const navigate = useNavigate();

  const values = { ...app.business };
  const countryCode = useMemo(
    () => getCountryCode(app.kyc.businessLocation),
    [app.kyc.businessLocation]
  );
  const regionLabel = getRegionLabel(countryCode);
  const postalLabel = getPostalLabel(countryCode);
  const regionCountry = useMemo<"CA" | "US">(
    () => (countryCode === "CA" ? "CA" : "US"),
    [countryCode]
  );

  useEffect(() => {
    if (app.currentStep !== 3) {
      update({ currentStep: 3 });
    }
  }, [app.currentStep, update]);

  useEffect(() => {
    const guard = resolveStepGuard(app.currentStep, 3);
    if (!guard.allowed) {
      navigate(`/apply/step-${guard.redirectStep}`, { replace: true });
    }
  }, [app.currentStep, navigate]);

  useEffect(() => {
    const draft = loadStepData(3);
    if (!draft) return;
    const merged = mergeDraft(values, draft);
    const changed = Object.keys(merged).some(
      (key) => merged[key] !== values[key]
    );
    if (changed) {
      update({ business: merged });
    }
  }, [update, values]);

  function setField(key: string, value: any) {
    update({ business: { ...values, [key]: value } });
  }

  const isValid = [
    "businessName",
    "legalName",
    "businessStructure",
    "address",
    "city",
    "state",
    "zip",
    "phone",
    "startDate",
    "employees",
    "estimatedRevenue",
  ].every((field) => Validate.required(values[field]));

  async function next() {
    saveStepData(3, values);
    const requiredFields = [
      "businessName",
      "legalName",
      "businessStructure",
      "address",
      "city",
      "state",
      "zip",
      "phone",
      "startDate",
      "employees",
      "estimatedRevenue",
    ];

    const missing = requiredFields.find(
      (field) => !Validate.required(values[field])
    );
    if (missing) {
      alert("Please complete all required business details.");
      return;
    }

    if (app.applicationToken) {
      try {
        await ClientAppAPI.update(app.applicationToken, { business: values });
      } catch (error) {
        console.error("Failed to save business details:", error);
        alert("We couldn't save your business details. Please try again.");
        return;
      }
    }
    navigate("/apply/step-4");
  }

  const fieldValues = {
    businessName: values.businessName,
    legalName: values.legalName,
    businessStructure: values.businessStructure,
    address: values.address,
    city: values.city,
    state: values.state,
    zip: values.zip,
    phone: values.phone,
    website: values.website,
    startDate: values.startDate,
    employees: values.employees,
    estimatedRevenue: values.estimatedRevenue,
  };

  const focusField = (fieldKey: string) => {
    const id = getWizardFieldId("step3", fieldKey);
    const element = document.getElementById(id) as HTMLElement | null;
    element?.focus();
  };

  const isStepValid = (nextValues: typeof values) =>
    [
      "businessName",
      "legalName",
      "businessStructure",
      "address",
      "city",
      "state",
      "zip",
      "phone",
      "startDate",
      "employees",
      "estimatedRevenue",
    ].every((field) => Validate.required(nextValues[field]));

  const handleAutoAdvance = (
    currentKey: string,
    nextValues: typeof values,
    preferEmpty = false
  ) => {
    const context = { business: nextValues };
    const nextKey = preferEmpty
      ? getNextEmptyFieldKey("step3", currentKey, context, {
          ...fieldValues,
          ...nextValues,
        })
      : getNextFieldKey("step3", currentKey, context);
    if (nextKey) {
      requestAnimationFrame(() => focusField(nextKey));
      return;
    }
    if (isStepValid(nextValues)) {
      void next();
    }
  };

  return (
    <WizardLayout>
      <StepHeader step={3} title="Business Information" />
      {autosaveError && (
        <Card
          variant="muted"
          style={{
            background: "rgba(245, 158, 11, 0.12)",
            color: tokens.colors.textPrimary,
          }}
        >
          {autosaveError}
        </Card>
      )}
      <StepHeader step={3} title="Business Details" />

      <Card
        style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg }}
        onBlurCapture={() => saveStepData(3, values)}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: tokens.spacing.md,
          }}
        >
          <div>
            <label style={components.form.label}>Business Name (DBA)</label>
            <Input
              id={getWizardFieldId("step3", "businessName")}
              value={values.businessName || ""}
              onChange={(e: any) => setField("businessName", e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  handleAutoAdvance("businessName", values);
                }
              }}
            />
          </div>

          <div>
            <label style={components.form.label}>Business Legal Name</label>
            <Input
              id={getWizardFieldId("step3", "legalName")}
              value={values.legalName || ""}
              onChange={(e: any) => setField("legalName", e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  handleAutoAdvance("legalName", values);
                }
              }}
            />
          </div>

          <div>
            <label style={components.form.label}>Business Structure</label>
            <Select
              id={getWizardFieldId("step3", "businessStructure")}
              value={values.businessStructure || ""}
              onChange={(e: any) => {
                const nextValues = {
                  ...values,
                  businessStructure: e.target.value,
                };
                update({ business: nextValues });
                handleAutoAdvance("businessStructure", nextValues);
              }}
            >
              <option value="">Select…</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
              <option value="Partnership">Partnership</option>
              <option value="LLC">LLC</option>
              <option value="Corporation">Corporation</option>
              <option value="S Corporation">S Corporation</option>
              <option value="Non-Profit">Non-Profit</option>
            </Select>
          </div>

          <div>
            <label style={components.form.label}>Business Address</label>
            <AddressAutocompleteInput
              id={getWizardFieldId("step3", "address")}
              country={regionCountry}
              value={values.address || ""}
              onChange={(e: any) => setField("address", e.target.value)}
              onSelect={(selection) => {
                const nextValues = {
                  ...values,
                  address: selection.street || values.address,
                  city: selection.city || values.city,
                  state: selection.state || values.state,
                  zip: formatPostalCode(
                    selection.postalCode || values.zip || "",
                    countryCode
                  ),
                };
                update({ business: nextValues });
                handleAutoAdvance("address", nextValues, true);
              }}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  handleAutoAdvance("address", values);
                }
              }}
            />
          </div>

          <div>
            <label style={components.form.label}>City</label>
            <Input
              id={getWizardFieldId("step3", "city")}
              value={values.city || ""}
              onChange={(e: any) => setField("city", e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  handleAutoAdvance("city", values);
                }
              }}
            />
          </div>
          <div>
            <label style={components.form.label}>{regionLabel}</label>
            <RegionSelect
              country={regionCountry}
              value={values.state || ""}
              id={getWizardFieldId("step3", "state")}
              onChange={(value) => {
                const nextValues = { ...values, state: value };
                update({ business: nextValues });
                handleAutoAdvance("state", nextValues);
              }}
            />
          </div>
          <div>
            <label style={components.form.label}>{postalLabel}</label>
            <Input
              id={getWizardFieldId("step3", "zip")}
              value={formatPostalCode(values.zip || "", countryCode)}
              onChange={(e: any) => {
                const nextValues = {
                  ...values,
                  zip: formatPostalCode(e.target.value, countryCode),
                };
                update({ business: nextValues });
              }}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  handleAutoAdvance("zip", values);
                }
              }}
            />
          </div>

          <div>
            <label style={components.form.label}>Business Phone</label>
            <PhoneInput
              id={getWizardFieldId("step3", "phone")}
              value={formatPhoneNumber(values.phone || "", countryCode)}
              onChange={(e: any) => {
                const nextValues = {
                  ...values,
                  phone: formatPhoneNumber(e.target.value, countryCode),
                };
                update({ business: nextValues });
              }}
              onBlur={() => handleAutoAdvance("phone", values)}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  handleAutoAdvance("phone", values);
                }
              }}
              placeholder="(555) 555-5555"
            />
          </div>

          <div>
            <label style={components.form.label}>Business Website</label>
            <Input
              id={getWizardFieldId("step3", "website")}
              type="url"
              value={values.website || ""}
              onChange={(e: any) => setField("website", e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  handleAutoAdvance("website", values);
                }
              }}
              placeholder="https://"
            />
          </div>

          <div>
            <label style={components.form.label}>Business Start Date</label>
            <Input
              id={getWizardFieldId("step3", "startDate")}
              type="date"
              value={values.startDate || ""}
              onChange={(e: any) => setField("startDate", e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  handleAutoAdvance("startDate", values);
                }
              }}
            />
          </div>

          <div>
            <label style={components.form.label}>Number of Employees</label>
            <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm }}>
              <button
                style={{
                  height: "40px",
                  width: "40px",
                  borderRadius: tokens.radii.pill,
                  border: `1px solid ${tokens.colors.border}`,
                  background: tokens.colors.surface,
                  color: tokens.colors.textPrimary,
                  fontSize: "18px",
                  outline: "none",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setField(
                    "employees",
                    Math.max(0, Number(values.employees || 0) - 1)
                  )
                }
                type="button"
              >
                −
              </button>
              <Input
                id={getWizardFieldId("step3", "employees")}
                type="number"
                min="0"
                style={{ textAlign: "center" }}
                value={values.employees ?? ""}
                onChange={(e: any) => setField("employees", e.target.value)}
                onKeyDown={(e: any) => {
                  if (e.key === "Enter") {
                    handleAutoAdvance("employees", values);
                  }
                }}
              />
              <button
                style={{
                  height: "40px",
                  width: "40px",
                  borderRadius: tokens.radii.pill,
                  border: `1px solid ${tokens.colors.border}`,
                  background: tokens.colors.surface,
                  color: tokens.colors.textPrimary,
                  fontSize: "18px",
                  outline: "none",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setField("employees", Number(values.employees || 0) + 1)
                }
                type="button"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label style={components.form.label}>Estimated Yearly Revenue</label>
            <Input
              id={getWizardFieldId("step3", "estimatedRevenue")}
              inputMode="decimal"
              value={values.estimatedRevenue || ""}
              onChange={(e: any) => {
                const nextValues = {
                  ...values,
                  estimatedRevenue: sanitizeCurrencyInput(e.target.value),
                };
                update({ business: nextValues });
              }}
              onBlur={() => {
                if (!values.estimatedRevenue) return;
                const nextValues = {
                  ...values,
                  estimatedRevenue: formatCurrencyValue(
                    values.estimatedRevenue,
                    countryCode
                  ),
                };
                update({ business: nextValues });
                handleAutoAdvance("estimatedRevenue", nextValues);
              }}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  const nextValues = {
                    ...values,
                    estimatedRevenue: formatCurrencyValue(
                      values.estimatedRevenue || "",
                      countryCode
                    ),
                  };
                  update({ business: nextValues });
                  handleAutoAdvance("estimatedRevenue", nextValues);
                }
              }}
              placeholder={countryCode === "CA" ? "CA$" : "$"}
            />
          </div>
        </div>
      </Card>

      <div style={{ ...layout.stickyCta, marginTop: tokens.spacing.lg }}>
        <Button
          style={{ width: "100%", maxWidth: "220px" }}
          onClick={next}
          disabled={!isValid}
        >
          Continue
        </Button>
      </div>
    </WizardLayout>
  );
}

export default Step3_Business;
