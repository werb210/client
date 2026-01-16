import { useApplicationStore } from "../state/useApplicationStore";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Select";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Validate } from "../utils/validate";
import { ResetApplication } from "../components/ResetApplication";

const MatchCategories = [
  "term_loan",
  "line_of_credit",
  "factoring",
  "equipment_financing",
];

const MatchBaselines: Record<string, Record<string, number>> = {
  invoices: {
    term_loan: 58,
    line_of_credit: 70,
    factoring: 88,
    equipment_financing: 52,
  },
  asset_based: {
    term_loan: 62,
    line_of_credit: 86,
    factoring: 55,
    equipment_financing: 68,
  },
  fixed_payment: {
    term_loan: 88,
    line_of_credit: 60,
    factoring: 48,
    equipment_financing: 72,
  },
  default: {
    term_loan: 60,
    line_of_credit: 60,
    factoring: 60,
    equipment_financing: 60,
  },
};

function buildMatchPercentages(kyc: any): Record<string, number> {
  const revenueType =
    kyc && typeof kyc.revenueType === "string" ? kyc.revenueType : "default";
  const baselines = MatchBaselines[revenueType] || MatchBaselines.default;
  const amount = kyc && typeof kyc.amount === "number" ? kyc.amount : 0;
  const countryBoost = kyc && kyc.country === "canada" ? 3 : 0;
  const amountBoost =
    amount >= 250000 ? 8 : amount >= 150000 ? 5 : amount >= 75000 ? 3 : 0;

  return MatchCategories.reduce((acc, category) => {
    const base = baselines[category] ?? MatchBaselines.default[category];
    const clamped = Math.max(0, Math.min(100, base + amountBoost + countryBoost));
    acc[category] = clamped;
    return acc;
  }, {} as Record<string, number>);
}

export function Step1_KYC() {
  const { app, update } = useApplicationStore();

  async function next() {
    const payload = app.kyc;

    if (!Validate.required(payload.country)) {
      alert("Please select your business country.");
      return;
    }

    if (!Validate.required(payload.amount) || !Validate.number(payload.amount)) {
      alert("Please enter a funding amount.");
      return;
    }

    if (!Validate.positive(payload.amount)) {
      alert("Funding amount must be greater than zero.");
      return;
    }

    if (!Validate.required(payload.revenueType)) {
      alert("Please select your revenue type.");
      return;
    }

    const matchPercentages = buildMatchPercentages(payload);
    let token = app.applicationToken;

    try {
      const res = await ClientAppAPI.start(payload);
      if (res && res.data && res.data.token) {
        token = res.data.token;
      }
    } catch {
      // Stay in client-only mode when backend is unavailable.
    }

    if (!token) {
      token = `local-${Date.now()}`;
    }

    update({ applicationToken: token, matchPercentages });

    window.location.href = "/apply/step-2";
  }

  return (
    <div className="max-w-2xl mx-auto">
      <StepHeader step={1} title="Know Your Business" />

      <Card className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Business Country</label>
          <Select
            value={app.kyc.country || ""}
            onChange={(e: any) =>
              update({ kyc: { ...app.kyc, country: e.target.value } })
            }
          >
            <option value="">Select…</option>
            <option value="canada">Canada</option>
            <option value="usa">USA</option>
          </Select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Funding Amount Needed</label>
          <Input
            type="number"
            value={app.kyc.amount || ""}
            onChange={(e: any) =>
              update({ kyc: { ...app.kyc, amount: Number(e.target.value) } })
            }
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Revenue Type</label>
          <Select
            value={app.kyc.revenueType || ""}
            onChange={(e: any) =>
              update({ kyc: { ...app.kyc, revenueType: e.target.value } })
            }
          >
            <option value="">Select…</option>
            <option value="invoices">I invoice customers (Factoring)</option>
            <option value="asset_based">Asset Based / LOC</option>
            <option value="fixed_payment">Fixed Payment Loans</option>
          </Select>
        </div>
      </Card>

      <Button className="mt-4 w-full md:w-auto" onClick={next}>
        Continue
      </Button>

      <div className="mt-2">
        <ResetApplication />
      </div>
    </div>
  );
}
