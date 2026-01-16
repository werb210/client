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
import {
  formatIdentityNumber,
  formatPostalCode,
  getCountryCode,
  getIdentityLabel,
  getPostalLabel,
  getRegionLabel,
} from "../utils/location";

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

  return (
    <WizardLayout>
      <StepHeader step={4} title="Applicant Information" />

      <Card className="space-y-5">
        <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
          Primary applicant
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">First Name</label>
            <Input
              value={values.firstName || ""}
              onChange={(e: any) => setField("firstName", e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Last Name</label>
            <Input
              value={values.lastName || ""}
              onChange={(e: any) => setField("lastName", e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Email Address</label>
            <Input
              type="email"
              value={values.email || ""}
              onChange={(e: any) => setField("email", e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Phone Number</label>
            <Input
              value={values.phone || ""}
              onChange={(e: any) => setField("phone", e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Street Address</label>
            <Input
              value={values.street || ""}
              onChange={(e: any) => setField("street", e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">City</label>
            <Input
              value={values.city || ""}
              onChange={(e: any) => setField("city", e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">{regionLabel}</label>
            <Input
              value={values.state || ""}
              onChange={(e: any) => setField("state", e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">{postalLabel}</label>
            <Input
              value={formatPostalCode(values.zip || "", countryCode)}
              onChange={(e: any) =>
                setField("zip", formatPostalCode(e.target.value, countryCode))
              }
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Date of Birth</label>
            <Input
              type="date"
              value={values.dob || ""}
              onChange={(e: any) => setField("dob", e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">{identityLabel}</label>
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
            <label className="block mb-2 font-medium">Ownership Percentage</label>
            <Input
              value={values.ownership || ""}
              onChange={(e: any) => setField("ownership", e.target.value)}
              placeholder="%"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-borealBlue">
          <input
            type="checkbox"
            checked={values.hasMultipleOwners || false}
            onChange={(e) =>
              setField("hasMultipleOwners", e.target.checked)
            }
          />
          This business has multiple owners/partners
        </label>

        {values.hasMultipleOwners && (
          <div className="space-y-4 border-t border-slate-200 pt-4">
            <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Partner Information
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">First Name</label>
                <Input
                  value={partner.firstName || ""}
                  onChange={(e: any) =>
                    setPartnerField("firstName", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Last Name</label>
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
                <label className="block mb-2 font-medium">Email Address</label>
                <Input
                  type="email"
                  value={partner.email || ""}
                  onChange={(e: any) =>
                    setPartnerField("email", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Phone Number</label>
                <Input
                  value={partner.phone || ""}
                  onChange={(e: any) =>
                    setPartnerField("phone", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Street Address</label>
                <Input
                  value={partner.street || ""}
                  onChange={(e: any) =>
                    setPartnerField("street", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">City</label>
                <Input
                  value={partner.city || ""}
                  onChange={(e: any) =>
                    setPartnerField("city", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">{regionLabel}</label>
                <Input
                  value={partner.state || ""}
                  onChange={(e: any) =>
                    setPartnerField("state", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">{postalLabel}</label>
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
                <label className="block mb-2 font-medium">Date of Birth</label>
                <Input
                  type="date"
                  value={partner.dob || ""}
                  onChange={(e: any) =>
                    setPartnerField("dob", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">{identityLabel}</label>
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
                <label className="block mb-2 font-medium">
                  Ownership Percentage
                </label>
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
        className="mt-6 w-full md:w-auto"
        onClick={next}
        disabled={!isValid}
      >
        Continue to Documents →
      </Button>
    </WizardLayout>
  );
}

export default Step4_Applicant;
