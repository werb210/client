import { useApplicationStore } from "../state/useApplicationStore";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { Validate } from "../utils/validate";

export function Step3_Business() {
  const { app, update } = useApplicationStore();

  const values = { ...app.business };

  function setField(key: string, value: any) {
    update({ business: { ...values, [key]: value } });
  }

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
      "website",
      "startDate",
      "employees",
      "estimatedRevenue",
    ];

    const missing = requiredFields.find((field) => !Validate.required(values[field]));
    if (missing) {
      alert("Please complete all required business details.");
      return;
    }

    await ClientAppAPI.update(app.applicationToken!, { business: values });
    window.location.href = "/apply/step-4";
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <StepHeader step={3} title="Business Details" />

      <Card className="space-y-5">
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

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 font-medium">City</label>
            <Input
              value={values.city || ""}
              onChange={(e: any) => setField("city", e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">State</label>
            <Input
              value={values.state || ""}
              onChange={(e: any) => setField("state", e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">ZIP Code</label>
            <Input
              value={values.zip || ""}
              onChange={(e: any) => setField("zip", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Business Phone</label>
          <Input
            value={values.phone || ""}
            onChange={(e: any) => setField("phone", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Business Website</label>
          <Input
            value={values.website || ""}
            onChange={(e: any) => setField("website", e.target.value)}
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
            value={values.estimatedRevenue || ""}
            onChange={(e: any) => setField("estimatedRevenue", e.target.value)}
            placeholder="$"
          />
        </div>
      </Card>

      <Button className="mt-6 w-full md:w-auto" onClick={next}>
        Continue
      </Button>
    </div>
  );
}
