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

export function Step3_Business() {
  const { app, update } = useApplicationStore();
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
      } catch {
        // Allow navigation even if the update fails.
      }
    }
    navigate("/apply/step-4");
  }

  return (
    <WizardLayout>
      <StepHeader step={3} title="Business Details" />

      <Card className="space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">Business Name (DBA)</label>
            <Input
              value={values.businessName || ""}
              onChange={(e: any) => setField("businessName", e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Business Legal Name</label>
            <Input
              value={values.legalName || ""}
              onChange={(e: any) => setField("legalName", e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Business Structure</label>
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
            <label className="block mb-2 font-medium">Business Address</label>
            <Input
              value={values.address || ""}
              onChange={(e: any) => setField("address", e.target.value)}
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
            <RegionSelect
              country={regionCountry}
              value={values.state || ""}
              onChange={(value) => setField("state", value)}
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
            <label className="block mb-2 font-medium">Business Phone</label>
            <Input
              value={formatPhoneNumber(values.phone || "", countryCode)}
              onChange={(e: any) =>
                setField(
                  "phone",
                  formatPhoneNumber(e.target.value, countryCode)
                )
              }
              inputMode="tel"
              placeholder={countryCode === "CA" ? "(555) 555-5555" : "(555) 555-5555"}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Business Website (optional)
            </label>
            <Input
              type="url"
              value={values.website || ""}
              onChange={(e: any) => setField("website", e.target.value)}
              placeholder="https://"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Business Start Date</label>
            <Input
              type="date"
              value={values.startDate || ""}
              onChange={(e: any) => setField("startDate", e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Number of Employees</label>
            <div className="flex items-center gap-3">
              <button
                className="h-10 w-10 rounded-full border border-slate-200 text-lg"
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
                className="text-center"
                value={values.employees ?? ""}
                onChange={(e: any) => setField("employees", e.target.value)}
              />
              <button
                className="h-10 w-10 rounded-full border border-slate-200 text-lg"
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
            <label className="block mb-2 font-medium">
              Estimated Yearly Revenue
            </label>
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

      <Button
        className="mt-6 w-full md:w-auto"
        onClick={next}
        disabled={!isValid}
      >
        Continue
      </Button>
    </WizardLayout>
  );
}

export default Step3_Business;
