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
import { theme } from "../styles/theme";

export function Step4_Applicant() {
  const { app, update } = useApplicationStore();
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

  function setField(key: string, value: any) {
    update({ applicant: { ...values, [key]: value } });
  }

  function setPartnerField(key: string, value: any) {
    update({ applicant: { ...values, partner: { ...partner, [key]: value } } });
  }

  async function next() {
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

    const missing = requiredFields.find((field) => !Validate.required(values[field]));
    if (missing) {
      alert("Please complete all required applicant details.");
      return;
    }

    if (app.applicationToken) {
      try {
        await ClientAppAPI.update(app.applicationToken, { applicant: values });
      } catch {
        // Allow navigation even if the update fails.
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

  const checkIcon =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 10.5l3 3 7-7' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";
  const labelStyle = {
    display: "block",
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.textSecondary,
  };

  const checkboxStyle = {
    width: "18px",
    height: "18px",
    borderRadius: "4px",
    border: `1px solid ${theme.colors.border}`,
    background: values.hasMultipleOwners ? theme.colors.primary : theme.colors.surface,
    display: "inline-grid",
    placeContent: "center",
    appearance: "none" as const,
    backgroundImage: values.hasMultipleOwners ? checkIcon : "none",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "12px",
  };

  return (
    <WizardLayout>
      <StepHeader step={4} title="Applicant Information" />

      <Card className="space-y-5">
        <div
          style={{
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: theme.colors.textSecondary,
          }}
        >
          Primary applicant
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>First Name</label>
            <Input
              value={values.firstName || ""}
              onChange={(e: any) => setField("firstName", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <Input
              value={values.lastName || ""}
              onChange={(e: any) => setField("lastName", e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Email Address</label>
            <Input
              type="email"
              value={values.email || ""}
              onChange={(e: any) => setField("email", e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Phone Number</label>
            <Input
              value={formatPhoneNumber(values.phone || "", countryCode)}
              onChange={(e: any) =>
                setField("phone", formatPhoneNumber(e.target.value, countryCode))
              }
              inputMode="tel"
            />
          </div>

          <div>
            <label style={labelStyle}>Street Address</label>
            <Input
              value={values.street || ""}
              onChange={(e: any) => setField("street", e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>City</label>
            <Input
              value={values.city || ""}
              onChange={(e: any) => setField("city", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>{regionLabel}</label>
            <RegionSelect
              country={regionCountry}
              value={values.state || ""}
              onChange={(value) => setField("state", value)}
            />
          </div>
          <div>
            <label style={labelStyle}>{postalLabel}</label>
            <Input
              value={formatPostalCode(values.zip || "", countryCode)}
              onChange={(e: any) =>
                setField("zip", formatPostalCode(e.target.value, countryCode))
              }
            />
          </div>

          <div>
            <label style={labelStyle}>Date of Birth</label>
            <Input
              type="date"
              value={values.dob || ""}
              onChange={(e: any) => setField("dob", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>{identityLabel}</label>
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
            <label style={labelStyle}>Ownership Percentage</label>
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
            gap: theme.spacing.xs,
            fontSize: theme.typography.label.fontSize,
            fontWeight: theme.typography.label.fontWeight,
            color: theme.colors.textPrimary,
          }}
        >
          <input
            type="checkbox"
            checked={values.hasMultipleOwners || false}
            onChange={(e) =>
              setField("hasMultipleOwners", e.target.checked)
            }
            style={checkboxStyle}
          />
          This business has multiple owners/partners
        </label>

        {values.hasMultipleOwners && (
          <div
            style={{
              marginTop: theme.spacing.md,
              paddingTop: theme.spacing.md,
              borderTop: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.sm,
              }}
            >
              Partner Information
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>First Name</label>
                <Input
                  value={partner.firstName || ""}
                  onChange={(e: any) =>
                    setPartnerField("firstName", e.target.value)
                  }
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <Input
                  value={partner.lastName || ""}
                  onChange={(e: any) =>
                    setPartnerField("lastName", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Email Address</label>
                <Input
                  type="email"
                  value={partner.email || ""}
                  onChange={(e: any) =>
                    setPartnerField("email", e.target.value)
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>Phone Number</label>
                <Input
                  value={formatPhoneNumber(partner.phone || "", countryCode)}
                  onChange={(e: any) =>
                    setPartnerField(
                      "phone",
                      formatPhoneNumber(e.target.value, countryCode)
                    )
                  }
                  inputMode="tel"
                />
              </div>

              <div>
                <label style={labelStyle}>Street Address</label>
                <Input
                  value={partner.street || ""}
                  onChange={(e: any) =>
                    setPartnerField("street", e.target.value)
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>City</label>
                <Input
                  value={partner.city || ""}
                  onChange={(e: any) =>
                    setPartnerField("city", e.target.value)
                  }
                />
              </div>
              <div>
                <label style={labelStyle}>{regionLabel}</label>
                <RegionSelect
                  country={regionCountry}
                  value={partner.state || ""}
                  onChange={(value) => setPartnerField("state", value)}
                />
              </div>
              <div>
                <label style={labelStyle}>{postalLabel}</label>
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
                <label style={labelStyle}>Date of Birth</label>
                <Input
                  type="date"
                  value={partner.dob || ""}
                  onChange={(e: any) =>
                    setPartnerField("dob", e.target.value)
                  }
                />
              </div>
              <div>
                <label style={labelStyle}>{identityLabel}</label>
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
                <label style={labelStyle}>Ownership Percentage</label>
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

      <Button
        style={{
          width: "100%",
          maxWidth: "260px",
          marginTop: theme.spacing.lg,
        }}
        onClick={next}
        disabled={!isValid}
      >
        Continue to Documents →
      </Button>
    </WizardLayout>
  );
}

export default Step4_Applicant;
