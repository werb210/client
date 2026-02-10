import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../state/useApplicationStore";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Validate } from "../utils/validate";
import { WizardLayout } from "../components/WizardLayout";
import { RegionSelect } from "../components/RegionSelect";
import {
  formatIdentityNumber,
  formatPhoneNumber,
  formatPostalCode,
  getCountryCode,
  getIdentityLabel,
  getPostalLabel,
  getRegionLabel,
} from "../utils/location";
import { PhoneInput } from "../components/ui/PhoneInput";
import { Checkbox } from "../components/ui/Checkbox";
import { components, layout, tokens } from "@/styles";
import { resolveStepGuard } from "./stepGuard";
import { loadStepData, mergeDraft, saveStepData } from "../client/autosave";

export function Step4_Applicant() {
  const { app, update, autosaveError } = useApplicationStore();
  const navigate = useNavigate();

  const values = { ...app.applicant };
  const partner = values.partner || {};
  const countryCode = useMemo(
    () => getCountryCode(app.kyc.businessLocation),
    [app.kyc.businessLocation]
  );
  const identityLabel = getIdentityLabel(countryCode);
  const regionLabel = getRegionLabel(countryCode);
  const postalLabel = getPostalLabel(countryCode);
  const regionCountry = useMemo<"CA" | "US">(
    () => (countryCode === "CA" ? "CA" : "US"),
    [countryCode]
  );

  useEffect(() => {
    if (app.currentStep !== 4) {
      update({ currentStep: 4 });
    }
  }, [app.currentStep, update]);

  useEffect(() => {
    const guard = resolveStepGuard(app.currentStep, 4);
    if (!guard.allowed) {
      navigate(`/apply/step-${guard.redirectStep}`, { replace: true });
    }
  }, [app.currentStep, navigate]);

  useEffect(() => {
    const draft = loadStepData(4);
    if (!draft) return;
    const merged = mergeDraft(values, draft);
    const changed = Object.keys(merged).some(
      (key) => merged[key] !== values[key]
    );
    if (changed) {
      update({ applicant: merged });
    }
  }, [update, values]);

  function setField(key: string, value: any) {
    update({ applicant: { ...values, [key]: value } });
  }

  function setPartnerField(key: string, value: any) {
    update({ applicant: { ...values, partner: { ...partner, [key]: value } } });
  }

  async function next() {
    saveStepData(4, values);
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "street",
      "city",
      "state",
      "zip",
      "dob",
      "ssn",
      "ownership",
    ];

    const missing = requiredFields.find(
      (field) => !Validate.required(values[field])
    );
    if (missing) {
      alert("Please complete all required applicant details.");
      return;
    }

    if (app.applicationToken) {
      try {
        await ClientAppAPI.update(app.applicationToken, { applicant: values });
      } catch (error) {
        console.error("Failed to save applicant details:", error);
        alert("We couldn't save your applicant details. Please try again.");
        return;
      }
    }
    navigate("/apply/step-5");
  }

  const isValid = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "street",
    "city",
    "state",
    "zip",
    "dob",
    "ssn",
    "ownership",
  ].every((field) => Validate.required(values[field]));

  return (
    <WizardLayout>
      <StepHeader step={4} title="Applicant Information" />
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
        onBlurCapture={() => saveStepData(4, values)}
      >
        <div style={components.form.eyebrow}>Primary applicant</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: tokens.spacing.md,
          }}
        >
          <div>
            <label style={components.form.label}>First Name</label>
            <Input
              value={values.firstName || ""}
              onChange={(e: any) => setField("firstName", e.target.value)}
            />
          </div>
          <div>
            <label style={components.form.label}>Last Name</label>
            <Input
              value={values.lastName || ""}
              onChange={(e: any) => setField("lastName", e.target.value)}
            />
          </div>

          <div>
            <label style={components.form.label}>Email Address</label>
            <Input
              type="email"
              value={values.email || ""}
              onChange={(e: any) => setField("email", e.target.value)}
            />
          </div>

          <div>
            <label style={components.form.label}>Phone Number</label>
            <PhoneInput
              value={formatPhoneNumber(values.phone || "", countryCode)}
              onChange={(e: any) =>
                setField("phone", formatPhoneNumber(e.target.value, countryCode))
              }
            />
          </div>

          <div>
            <label style={components.form.label}>Street Address</label>
            <Input
              value={values.street || ""}
              onChange={(e: any) => setField("street", e.target.value)}
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
            <label style={components.form.label}>Date of Birth</label>
            <Input
              type="date"
              value={values.dob || ""}
              onChange={(e: any) => setField("dob", e.target.value)}
            />
          </div>
          <div>
            <label style={components.form.label}>{identityLabel}</label>
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={formatIdentityNumber(values.ssn || "", countryCode)}
              onChange={(e: any) =>
                setField(
                  "ssn",
                  formatIdentityNumber(e.target.value, countryCode)
                )
              }
            />
          </div>

          <div>
            <label style={components.form.label}>Ownership Percentage</label>
            <Input
              value={values.ownership || ""}
              onChange={(e: any) => setField("ownership", e.target.value)}
              placeholder="%"
            />
          </div>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.spacing.xs,
            fontSize: tokens.typography.label.fontSize,
            fontWeight: tokens.typography.label.fontWeight,
            color: tokens.colors.textPrimary,
          }}
        >
          <Checkbox
            checked={values.hasMultipleOwners || false}
            onChange={(e) =>
              setField("hasMultipleOwners", (e.target as HTMLInputElement).checked)
            }
          />
          This business has multiple owners/partners
        </label>

        {values.hasMultipleOwners && (
          <div
            style={{
              marginTop: tokens.spacing.md,
              paddingTop: tokens.spacing.md,
              borderTop: `1px solid ${tokens.colors.border}`,
            }}
          >
            <div
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: tokens.colors.textSecondary,
                marginBottom: tokens.spacing.sm,
              }}
            >
              Partner Information
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: tokens.spacing.md,
              }}
            >
              <div>
                <label style={components.form.label}>First Name</label>
                <Input
                  value={partner.firstName || ""}
                  onChange={(e: any) =>
                    setPartnerField("firstName", e.target.value)
                  }
                />
              </div>
              <div>
                <label style={components.form.label}>Last Name</label>
                <Input
                  value={partner.lastName || ""}
                  onChange={(e: any) =>
                    setPartnerField("lastName", e.target.value)
                  }
                />
              </div>

              <div>
                <label style={components.form.label}>Email Address</label>
                <Input
                  type="email"
                  value={partner.email || ""}
                  onChange={(e: any) =>
                    setPartnerField("email", e.target.value)
                  }
                />
              </div>

              <div>
                <label style={components.form.label}>Phone Number</label>
                <PhoneInput
                  value={formatPhoneNumber(partner.phone || "", countryCode)}
                  onChange={(e: any) =>
                    setPartnerField(
                      "phone",
                      formatPhoneNumber(e.target.value, countryCode)
                    )
                  }
                />
              </div>

              <div>
                <label style={components.form.label}>Street Address</label>
                <Input
                  value={partner.street || ""}
                  onChange={(e: any) =>
                    setPartnerField("street", e.target.value)
                  }
                />
              </div>

              <div>
                <label style={components.form.label}>City</label>
                <Input
                  value={partner.city || ""}
                  onChange={(e: any) =>
                    setPartnerField("city", e.target.value)
                  }
                />
              </div>
              <div>
                <label style={components.form.label}>{regionLabel}</label>
                <RegionSelect
                  country={regionCountry}
                  value={partner.state || ""}
                  onChange={(value) => setPartnerField("state", value)}
                />
              </div>
              <div>
                <label style={components.form.label}>{postalLabel}</label>
                <Input
                  value={formatPostalCode(partner.zip || "", countryCode)}
                  onChange={(e: any) =>
                    setPartnerField(
                      "zip",
                      formatPostalCode(e.target.value, countryCode)
                    )
                  }
                />
              </div>

              <div>
                <label style={components.form.label}>Date of Birth</label>
                <Input
                  type="date"
                  value={partner.dob || ""}
                  onChange={(e: any) =>
                    setPartnerField("dob", e.target.value)
                  }
                />
              </div>
              <div>
                <label style={components.form.label}>{identityLabel}</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={formatIdentityNumber(partner.ssn || "", countryCode)}
                  onChange={(e: any) =>
                    setPartnerField(
                      "ssn",
                      formatIdentityNumber(e.target.value, countryCode)
                    )
                  }
                />
              </div>

              <div>
                <label style={components.form.label}>Ownership Percentage</label>
                <Input
                  value={partner.ownership || ""}
                  onChange={(e: any) =>
                    setPartnerField("ownership", e.target.value)
                  }
                  placeholder="%"
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      <div style={{ ...layout.stickyCta, marginTop: tokens.spacing.lg }}>
        <Button
          style={{ width: "100%", maxWidth: "260px" }}
          onClick={next}
          disabled={!isValid}
        >
          Continue to Documents →
        </Button>
      </div>
    </WizardLayout>
  );
}

export default Step4_Applicant;
