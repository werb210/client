import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../state/useApplicationStore";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Select";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Validate } from "../utils/validate";
import { ResetApplication } from "../components/ResetApplication";
import { WizardLayout } from "../components/WizardLayout";
import {
  formatCurrencyValue,
  getCountryCode,
} from "../utils/location";
import { theme } from "../styles/theme";

const MatchCategories = [
  "line_of_credit",
  "factoring",
  "po_financing",
  "term_loan",
  "equipment_financing",
];

const MatchBaselines: Record<string, number> = {
  line_of_credit: 68,
  factoring: 74,
  po_financing: 62,
  term_loan: 65,
  equipment_financing: 70,
};

const LookingForOptions = [
  { value: "capital", label: "Capital" },
  { value: "equipment", label: "Equipment Financing" },
  { value: "both", label: "Both Capital & Equipment" },
];

const BusinessLocationOptions = ["Canada", "United States", "Other"];

const IndustryOptions = [
  "Construction",
  "Manufacturing",
  "Retail",
  "Restaurant/Food Service",
  "Technology",
  "Healthcare",
  "Transportation",
  "Professional Services",
  "Real Estate",
  "Agriculture",
  "Energy",
  "Other",
];

const PurposeOptions = [
  "Equipment Purchase",
  "Inventory Purchase",
  "Business Expansion",
  "Working Capital",
];

const SalesHistoryOptions = [
  "Less than 1 year",
  "1 to 3 years",
  "Over 3 years",
];

const RevenueOptions = [
  "Under $100,000",
  "$100,000 to $250,000",
  "$250,000 to $500,000",
  "$500,000 to $1,000,000",
  "$1,000,000 to $5,000,000",
  "Over $5,000,000",
];

const MonthlyRevenueOptions = [
  "$10,000 to $25,000",
  "$25,000 to $50,000",
  "$50,000 to $100,000",
  "$100,000 to $250,000",
  "Over $250,000",
];

const AccountsReceivableOptions = [
  "No Account Receivables",
  "Zero to $100,000",
  "$100,000 to $250,000",
  "$250,000 to $500,000",
  "$500,000 to $1,000,000",
  "$1,000,000 to $3,000,000",
  "Over $3,000,000",
];

const FixedAssetsOptions = [
  "No fixed assets",
  "Zero to $25,000",
  "$25,000 to $100,000",
  "$100,000 to $250,000",
  "$250,000 to $500,000",
  "$500,000 to $1,000,000",
  "Over $1,000,000",
];

function parseCurrency(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  return Number.parseFloat(cleaned);
}

function buildMatchPercentages(amount: number): Record<string, number> {
  const amountBoost =
    amount >= 500000 ? 10 : amount >= 250000 ? 7 : amount >= 100000 ? 4 : 0;
  return MatchCategories.reduce((acc, category) => {
    const base = MatchBaselines[category] ?? 60;
    const clamped = Math.max(0, Math.min(100, base + amountBoost));
    acc[category] = clamped;
    return acc;
  }, {} as Record<string, number>);
}

export function Step1_KYC() {
  const { app, update } = useApplicationStore();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const navigate = useNavigate();
  const countryCode = useMemo(
    () => getCountryCode(app.kyc.businessLocation),
    [app.kyc.businessLocation]
  );

  useEffect(() => {
    if (app.currentStep !== 1) {
      update({ currentStep: 1 });
    }
  }, [app.currentStep, update]);

  useEffect(() => {
    if (!app.kyc.fundingAmount) return;
    const formatted = formatCurrencyValue(app.kyc.fundingAmount, countryCode);
    if (formatted && formatted !== app.kyc.fundingAmount) {
      update({ kyc: { ...app.kyc, fundingAmount: formatted } });
    }
  }, [app.kyc, countryCode, update]);

  const isValid =
    Validate.required(app.kyc.lookingFor) &&
    Validate.required(app.kyc.fundingAmount) &&
    Validate.required(app.kyc.businessLocation) &&
    app.kyc.businessLocation !== "Other" &&
    Validate.required(app.kyc.industry) &&
    Validate.required(app.kyc.purposeOfFunds) &&
    Validate.required(app.kyc.salesHistory) &&
    Validate.required(app.kyc.revenueLast12Months) &&
    Validate.required(app.kyc.monthlyRevenue) &&
    Validate.required(app.kyc.accountsReceivable) &&
    Validate.required(app.kyc.fixedAssets);

  const labelStyle = {
    display: "block",
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.textSecondary,
  };

  async function next() {
    const payload = app.kyc;

    if (!Validate.required(payload.lookingFor)) {
      alert("Please select what you are looking for.");
      return;
    }

    if (!Validate.required(payload.fundingAmount)) {
      alert("Please enter how much funding you are seeking.");
      return;
    }

    if (!Validate.required(payload.businessLocation)) {
      alert("Please select your business location.");
      return;
    }

    if (!Validate.required(payload.industry)) {
      alert("Please select your industry.");
      return;
    }

    if (!Validate.required(payload.purposeOfFunds)) {
      alert("Please select the purpose of funds.");
      return;
    }

    if (!Validate.required(payload.salesHistory)) {
      alert("Please select your sales history.");
      return;
    }

    if (!Validate.required(payload.revenueLast12Months)) {
      alert("Please select your last 12 months revenue.");
      return;
    }

    if (!Validate.required(payload.monthlyRevenue)) {
      alert("Please select your average monthly revenue.");
      return;
    }

    if (!Validate.required(payload.accountsReceivable)) {
      alert("Please select your current account receivable balance.");
      return;
    }

    if (!Validate.required(payload.fixedAssets)) {
      alert("Please select your fixed assets value.");
      return;
    }

    if (payload.businessLocation === "Other") {
      setShowLocationModal(true);
      return;
    }

    const amount = parseCurrency(payload.fundingAmount);
    const matchPercentages = buildMatchPercentages(
      Number.isNaN(amount) ? 0 : amount
    );
    let token = app.applicationToken;

    try {
      const res = await ClientAppAPI.start({
        financialProfile: payload,
      });
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

    navigate("/apply/step-2");
  }

  return (
    <>
      <WizardLayout>
        <StepHeader step={1} title="Financial Profile" />

        <Card className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>What are you looking for?</label>
              <Select
                value={app.kyc.lookingFor || ""}
                onChange={(e: any) =>
                  update({ kyc: { ...app.kyc, lookingFor: e.target.value } })
                }
              >
                <option value="">Select…</option>
                {LookingForOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label style={labelStyle}>How much funding are you seeking?</label>
              <Input
                value={formatCurrencyValue(
                  app.kyc.fundingAmount || "",
                  countryCode
                )}
                onChange={(e: any) =>
                  update({
                    kyc: {
                      ...app.kyc,
                      fundingAmount: formatCurrencyValue(
                        e.target.value,
                        countryCode
                      ),
                    },
                  })
                }
                placeholder={countryCode === "CA" ? "CA$" : "$"}
              />
            </div>

            <div>
              <label style={labelStyle}>Business Location</label>
              <Select
                value={app.kyc.businessLocation || ""}
                onChange={(e: any) => {
                  const value = e.target.value;
                  update({
                    kyc: { ...app.kyc, businessLocation: value },
                  });
                  if (value === "Other") {
                    setShowLocationModal(true);
                  }
                }}
              >
                <option value="">Select…</option>
                {BusinessLocationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label style={labelStyle}>Industry</label>
              <Select
                value={app.kyc.industry || ""}
                onChange={(e: any) =>
                  update({ kyc: { ...app.kyc, industry: e.target.value } })
                }
              >
                <option value="">Select…</option>
                {IndustryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label style={labelStyle}>Purpose of funds</label>
              <Select
                value={app.kyc.purposeOfFunds || ""}
                onChange={(e: any) =>
                  update({ kyc: { ...app.kyc, purposeOfFunds: e.target.value } })
                }
              >
                <option value="">Select…</option>
                {PurposeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label style={labelStyle}>
                How many years of sales history does the business have?
              </label>
              <Select
                value={app.kyc.salesHistory || ""}
                onChange={(e: any) =>
                  update({ kyc: { ...app.kyc, salesHistory: e.target.value } })
                }
              >
                <option value="">Select…</option>
                {SalesHistoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label style={labelStyle}>
                What was your business revenue in the last 12 months?
              </label>
              <Select
                value={app.kyc.revenueLast12Months || ""}
                onChange={(e: any) =>
                  update({
                    kyc: { ...app.kyc, revenueLast12Months: e.target.value },
                  })
                }
              >
                <option value="">Select…</option>
                {RevenueOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label style={labelStyle}>
                Average monthly revenue (last 3 months)
              </label>
              <Select
                value={app.kyc.monthlyRevenue || ""}
                onChange={(e: any) =>
                  update({ kyc: { ...app.kyc, monthlyRevenue: e.target.value } })
                }
              >
                <option value="">Select…</option>
                {MonthlyRevenueOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label style={labelStyle}>
                Current Account Receivable balance
              </label>
              <Select
                value={app.kyc.accountsReceivable || ""}
                onChange={(e: any) =>
                  update({
                    kyc: { ...app.kyc, accountsReceivable: e.target.value },
                  })
                }
              >
                <option value="">Select…</option>
                {AccountsReceivableOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label style={labelStyle}>
                Fixed assets value for loan security
              </label>
              <Select
                value={app.kyc.fixedAssets || ""}
                onChange={(e: any) =>
                  update({ kyc: { ...app.kyc, fixedAssets: e.target.value } })
                }
              >
                <option value="">Select…</option>
                {FixedAssetsOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        <div
          className="flex flex-col sm:flex-row gap-3"
          style={{ marginTop: theme.spacing.lg }}
        >
          <Button
            style={{ width: "100%", maxWidth: "220px" }}
            onClick={next}
            disabled={!isValid}
          >
            Continue →
          </Button>
          <ResetApplication />
        </div>
      </WizardLayout>

      {showLocationModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: theme.spacing.md,
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: theme.colors.surface,
              borderRadius: theme.layout.radius,
              border: `1px solid ${theme.colors.border}`,
              padding: theme.spacing.lg,
              maxWidth: "420px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing.sm,
            }}
          >
            <h2
              style={{
                fontSize: theme.typography.h2.fontSize,
                fontWeight: theme.typography.h2.fontWeight,
                color: theme.colors.textPrimary,
              }}
            >
              Funding availability
            </h2>
            <p style={{ fontSize: "14px", color: theme.colors.textSecondary }}>
              Boreal funding is currently limited to businesses located in
              Canada or the United States.
            </p>
            <Button
              style={{ width: "100%" }}
              onClick={() => setShowLocationModal(false)}
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default Step1_KYC;
