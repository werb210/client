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
} from "../utils/location";
import { WizardLayout } from "../components/WizardLayout";
import { PhoneInput } from "../components/ui/PhoneInput";
import { components, layout, tokens } from "@/styles";
import { resolveStepGuard } from "./stepGuard";
import { loadStepData, mergeDraft, saveStepData } from "../client/autosave";

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
              value={values.businessName || ""}
              onChange={(e: any) => setField("businessName", e.target.value)}
            />
          </div>

          <div>
            <label style={components.form.label}>Business Legal Name</label>
            <Input
              value={values.legalName || ""}
              onChange={(e: any) => setField("legalName", e.target.value)}
            />
          </div>

          <div>
            <label style={components.form.label}>Business Structure</label>
            <Select
              value={values.businessStructure || ""}
              onChange={(e: any) =>
                setField("businessStructure", e.target.value)
              }
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
            <Input
              value={values.address || ""}
              onChange={(e: any) => setField("address", e.target.value)}
            />
          </div>

          <div>
            <label style={components.form.label}>City</label>
            <Input
              value={values.city || ""}
              onChange={(e: any) => setField("city", e.target.value)}
            />
          </div>
          <div>
            <label style={components.form.label}>{regionLabel}</label>
            <RegionSelect
              country={regionCountry}
              value={values.state || ""}
              onChange={(value) => setField("state", value)}
            />
          </div>
          <div>
            <label style={components.form.label}>{postalLabel}</label>
            <Input
              value={formatPostalCode(values.zip || "", countryCode)}
              onChange={(e: any) =>
                setField("zip", formatPostalCode(e.target.value, countryCode))
              }
            />
          </div>

          <div>
            <label style={components.form.label}>Business Phone</label>
            <PhoneInput
              value={formatPhoneNumber(values.phone || "", countryCode)}
              onChange={(e: any) =>
                setField(
                  "phone",
                  formatPhoneNumber(e.target.value, countryCode)
                )
              }
              placeholder="(555) 555-5555"
            />
          </div>

          <div>
            <label style={components.form.label}>Business Website (optional)</label>
            <Input
              type="url"
              value={values.website || ""}
              onChange={(e: any) => setField("website", e.target.value)}
              placeholder="https://"
            />
          </div>

          <div>
            <label style={components.form.label}>Business Start Date</label>
            <Input
              type="date"
              value={values.startDate || ""}
              onChange={(e: any) => setField("startDate", e.target.value)}
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
                type="number"
                min="0"
                style={{ textAlign: "center" }}
                value={values.employees ?? ""}
                onChange={(e: any) => setField("employees", e.target.value)}
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
              value={formatCurrencyValue(
                values.estimatedRevenue || "",
                countryCode
              )}
              onChange={(e: any) =>
                setField(
                  "estimatedRevenue",
                  formatCurrencyValue(e.target.value, countryCode)
                )
              }
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
