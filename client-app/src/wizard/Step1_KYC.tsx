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
import { WizardLayout } from "../components/WizardLayout";
import {
  formatCurrencyValue,
  getCountryCode,
} from "../utils/location";
import { theme } from "../styles/theme";
import {
  FUNDING_INTENT_OPTIONS,
  normalizeFundingIntent,
} from "../constants/wizard";

const MatchCategories = [
  "Line of Credit",
  "Factoring",
  "Purchase Order Financing",
  "Term Loan",
  "Equipment Financing",
];

const MatchBaselines: Record<string, number> = {
  "Line of Credit": 68,
  Factoring: 74,
  "Purchase Order Financing": 62,
  "Term Loan": 65,
  "Equipment Financing": 70,
};

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
  const [showErrors, setShowErrors] = useState(false);
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
    const normalized = normalizeFundingIntent(app.kyc.lookingFor);
    if (normalized && normalized !== app.kyc.lookingFor) {
      update({ kyc: { ...app.kyc, lookingFor: normalized } });
    }
  }, [app.kyc, update]);

  useEffect(() => {
    if (!app.kyc.fundingAmount) return;
    const formatted = formatCurrencyValue(app.kyc.fundingAmount, countryCode);
    if (formatted && formatted !== app.kyc.fundingAmount) {
      update({ kyc: { ...app.kyc, fundingAmount: formatted } });
    }
  }, [app.kyc, countryCode, update]);

  const fieldErrors = {
    lookingFor: !Validate.required(app.kyc.lookingFor),
    fundingAmount: !Validate.required(app.kyc.fundingAmount),
    businessLocation:
      !Validate.required(app.kyc.businessLocation) ||
      app.kyc.businessLocation === "Other",
    industry: !Validate.required(app.kyc.industry),
    purposeOfFunds: !Validate.required(app.kyc.purposeOfFunds),
    salesHistory: !Validate.required(app.kyc.salesHistory),
    revenueLast12Months: !Validate.required(app.kyc.revenueLast12Months),
    monthlyRevenue: !Validate.required(app.kyc.monthlyRevenue),
    accountsReceivable: !Validate.required(app.kyc.accountsReceivable),
    fixedAssets: !Validate.required(app.kyc.fixedAssets),
  };
  const isValid = Object.values(fieldErrors).every((error) => !error);

  const labelStyle = {
    display: "block",
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.textSecondary,
  };

  const errorStyle = {
    marginTop: theme.spacing.xs,
    fontSize: "12px",
    color: "#dc2626",
    fontWeight: 500,
  };

  async function next() {
    const payload = app.kyc;
    setShowErrors(true);

    if (!isValid) {
      if (payload.businessLocation === "Other") {
        setShowLocationModal(true);
      }
      return;
    }

    const amount = parseCurrency(payload.fundingAmount);
    const matchPercentages = buildMatchPercentages(
      Number.isNaN(amount) ? 0 : amount
    );
    try {
      const res = await ClientAppAPI.start({
        financialProfile: payload,
      });
      const token = res?.data?.token;
      if (!token) {
        alert("We couldn't start your application. Please try again.");
        return;
      }
      update({ applicationToken: token, matchPercentages });
      navigate("/apply/step-2");
    } catch (error) {
      console.error("Failed to start application:", error);
      alert("We couldn't start your application. Please try again.");
      return;
    }
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
                value={normalizeFundingIntent(app.kyc.lookingFor) || ""}
                onChange={(e: any) => {
                  const nextIntent = normalizeFundingIntent(e.target.value);
                  update({
                    kyc: {
                      ...app.kyc,
                      lookingFor: nextIntent,
                    },
                    productCategory: null,
                    selectedProduct: undefined,
                    selectedProductId: undefined,
                    selectedProductType: undefined,
                    eligibleProducts: [],
                    eligibleCategories: [],
                    eligibilityReasons: [],
                  });
                }}
              >
                <option value="">Select…</option>
                {FUNDING_INTENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {showErrors && fieldErrors.lookingFor && (
                <div style={errorStyle}>Please select a funding intent.</div>
              )}
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
                    productCategory: null,
                    selectedProduct: undefined,
                    selectedProductId: undefined,
                    selectedProductType: undefined,
                    eligibleProducts: [],
                    eligibleCategories: [],
                    eligibilityReasons: [],
                  })
                }
                placeholder={countryCode === "CA" ? "CA$" : "$"}
              />
              {showErrors && fieldErrors.fundingAmount && (
                <div style={errorStyle}>Enter a funding amount.</div>
              )}
            </div>

            <div>
              <label style={labelStyle}>Business Location</label>
              <Select
                value={app.kyc.businessLocation || ""}
                onChange={(e: any) => {
                  const value = e.target.value;
                  update({
                    kyc: { ...app.kyc, businessLocation: value },
                    productCategory: null,
                    selectedProduct: undefined,
                    selectedProductId: undefined,
                    selectedProductType: undefined,
                    eligibleProducts: [],
                    eligibleCategories: [],
                    eligibilityReasons: [],
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
              {showErrors && fieldErrors.businessLocation && (
                <div style={errorStyle}>
                  Please choose Canada or the United States.
                </div>
              )}
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
              {showErrors && fieldErrors.industry && (
                <div style={errorStyle}>Select your industry.</div>
              )}
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
              {showErrors && fieldErrors.purposeOfFunds && (
                <div style={errorStyle}>Select a purpose of funds.</div>
              )}
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
              {showErrors && fieldErrors.salesHistory && (
                <div style={errorStyle}>Select sales history.</div>
              )}
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
              {showErrors && fieldErrors.revenueLast12Months && (
                <div style={errorStyle}>Select a revenue range.</div>
              )}
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
              {showErrors && fieldErrors.monthlyRevenue && (
                <div style={errorStyle}>Select monthly revenue.</div>
              )}
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
                    productCategory: null,
                    selectedProduct: undefined,
                    selectedProductId: undefined,
                    selectedProductType: undefined,
                    eligibleProducts: [],
                    eligibleCategories: [],
                    eligibilityReasons: [],
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
              {showErrors && fieldErrors.accountsReceivable && (
                <div style={errorStyle}>Select an AR balance.</div>
              )}
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
              {showErrors && fieldErrors.fixedAssets && (
                <div style={errorStyle}>Select a fixed asset value.</div>
              )}
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
          >
            Continue →
          </Button>
        </div>
      </WizardLayout>

      {showLocationModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.12)",
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
