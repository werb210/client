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
  sanitizeCurrencyInput,
} from "../utils/location";
import {
  FUNDING_INTENT_OPTIONS,
  normalizeFundingIntent,
} from "../constants/wizard";
import { components, layout, scrollToFirstError, tokens } from "@/styles";
import {
  getNextFieldKey,
  getStepFieldKeys,
  getWizardFieldId,
} from "./wizardSchema";

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
    if (showErrors) {
      scrollToFirstError();
    }
  }, [showErrors]);

  const stepFields = useMemo(
    () => getStepFieldKeys("step1", { kyc: app.kyc }),
    [app.kyc]
  );
  const shouldShowAccountsReceivable =
    stepFields.includes("accountsReceivable");
  const shouldShowFixedAssets = stepFields.includes("fixedAssets");

  function getStepErrors(values: Record<string, any>) {
    return {
      lookingFor: !Validate.required(values.lookingFor),
      fundingAmount: !Validate.required(values.fundingAmount),
      businessLocation:
        !Validate.required(values.businessLocation) ||
        values.businessLocation === "Other",
      industry: !Validate.required(values.industry),
      purposeOfFunds: !Validate.required(values.purposeOfFunds),
      salesHistory: !Validate.required(values.salesHistory),
      revenueLast12Months: !Validate.required(values.revenueLast12Months),
      monthlyRevenue: !Validate.required(values.monthlyRevenue),
      accountsReceivable:
        shouldShowAccountsReceivable &&
        !Validate.required(values.accountsReceivable),
      fixedAssets:
        shouldShowFixedAssets && !Validate.required(values.fixedAssets),
    };
  }

  const fieldErrors = getStepErrors(app.kyc);
  const isValid = Object.values(fieldErrors).every((error) => !error);

  async function startApplication() {
    const payload = app.kyc;

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
    }
  }

  const fieldGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: tokens.spacing.md,
  };

  const focusField = (fieldKey: string) => {
    const id = getWizardFieldId("step1", fieldKey);
    const element = document.getElementById(id) as HTMLElement | null;
    element?.focus();
  };

  const handleAutoAdvance = (
    currentKey: string,
    nextValues: Record<string, any>
  ) => {
    const context = { kyc: nextValues };
    const nextKey = getNextFieldKey("step1", currentKey, context);
    if (nextKey) {
      requestAnimationFrame(() => focusField(nextKey));
      return;
    }
    const nextErrors = getStepErrors(nextValues);
    const nextIsValid = Object.values(nextErrors).every((error) => !error);
    if (nextIsValid) {
      void startApplication();
    }
  };

  return (
    <>
      <WizardLayout>
        <StepHeader step={1} title="Financial Profile" />

        <Card style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg }}>
          <div style={fieldGridStyle}>
            <div data-error={showErrors && fieldErrors.lookingFor}>
              <label style={components.form.label}>What are you looking for?</label>
              <Select
                id={getWizardFieldId("step1", "lookingFor")}
                value={normalizeFundingIntent(app.kyc.lookingFor) || ""}
                onChange={(e: any) => {
                  const nextIntent = normalizeFundingIntent(e.target.value);
                  const nextKyc = { ...app.kyc, lookingFor: nextIntent };
                  update({
                    kyc: nextKyc,
                    productCategory: null,
                    selectedProduct: undefined,
                    selectedProductId: undefined,
                    selectedProductType: undefined,
                    requires_closing_cost_funding: undefined,
                    eligibleProducts: [],
                    eligibleCategories: [],
                    eligibilityReasons: [],
                  });
                  handleAutoAdvance("lookingFor", nextKyc);
                }}
                hasError={showErrors && fieldErrors.lookingFor}
              >
                <option value="">Select…</option>
                {FUNDING_INTENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {showErrors && fieldErrors.lookingFor && (
                <div style={components.form.errorText}>Please select a funding intent.</div>
              )}
            </div>
            <div data-error={showErrors && fieldErrors.fundingAmount}>
              <label style={components.form.label}>How much funding are you seeking?</label>
              <Input
                id={getWizardFieldId("step1", "fundingAmount")}
                inputMode="decimal"
                value={app.kyc.fundingAmount || ""}
                onChange={(e: any) => {
                  const nextKyc = {
                    ...app.kyc,
                    fundingAmount: sanitizeCurrencyInput(e.target.value),
                  };
                  update({
                    kyc: nextKyc,
                    productCategory: null,
                    selectedProduct: undefined,
                    selectedProductId: undefined,
                    selectedProductType: undefined,
                    requires_closing_cost_funding: undefined,
                    eligibleProducts: [],
                    eligibleCategories: [],
                    eligibilityReasons: [],
                  });
                }}
                onBlur={() => {
                  if (!app.kyc.fundingAmount) return;
                  const formatted = formatCurrencyValue(
                    app.kyc.fundingAmount,
                    countryCode
                  );
                  const nextKyc = { ...app.kyc, fundingAmount: formatted };
                  update({ kyc: nextKyc });
                  handleAutoAdvance("fundingAmount", nextKyc);
                }}
                onKeyDown={(e: any) => {
                  if (e.key === "Enter") {
                    const nextKyc = {
                      ...app.kyc,
                      fundingAmount: formatCurrencyValue(
                        app.kyc.fundingAmount || "",
                        countryCode
                      ),
                    };
                    update({ kyc: nextKyc });
                    handleAutoAdvance("fundingAmount", nextKyc);
                  }
                }}
                placeholder={countryCode === "CA" ? "CA$" : "$"}
                hasError={showErrors && fieldErrors.fundingAmount}
              />
              {showErrors && fieldErrors.fundingAmount && (
                <div style={components.form.errorText}>Enter a funding amount.</div>
              )}
            </div>

            <div data-error={showErrors && fieldErrors.businessLocation}>
              <label style={components.form.label}>Business Location</label>
              <Select
                id={getWizardFieldId("step1", "businessLocation")}
                value={app.kyc.businessLocation || ""}
                onChange={(e: any) => {
                  const value = e.target.value;
                  const nextKyc = { ...app.kyc, businessLocation: value };
                  update({
                    kyc: nextKyc,
                    productCategory: null,
                    selectedProduct: undefined,
                    selectedProductId: undefined,
                    selectedProductType: undefined,
                    requires_closing_cost_funding: undefined,
                    eligibleProducts: [],
                    eligibleCategories: [],
                    eligibilityReasons: [],
                  });
                  if (value === "Other") {
                    setShowLocationModal(true);
                  }
                  handleAutoAdvance("businessLocation", nextKyc);
                }}
                hasError={showErrors && fieldErrors.businessLocation}
              >
                <option value="">Select…</option>
                {BusinessLocationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              {showErrors && fieldErrors.businessLocation && (
                <div style={components.form.errorText}>
                  Please choose Canada or the United States.
                </div>
              )}
            </div>

            <div data-error={showErrors && fieldErrors.industry}>
              <label style={components.form.label}>Industry</label>
              <Select
                id={getWizardFieldId("step1", "industry")}
                value={app.kyc.industry || ""}
                onChange={(e: any) => {
                  const nextKyc = { ...app.kyc, industry: e.target.value };
                  update({ kyc: nextKyc });
                  handleAutoAdvance("industry", nextKyc);
                }}
                hasError={showErrors && fieldErrors.industry}
              >
                <option value="">Select…</option>
                {IndustryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              {showErrors && fieldErrors.industry && (
                <div style={components.form.errorText}>Select your industry.</div>
              )}
            </div>

            <div data-error={showErrors && fieldErrors.purposeOfFunds}>
              <label style={components.form.label}>Purpose of funds</label>
              <Select
                id={getWizardFieldId("step1", "purposeOfFunds")}
                value={app.kyc.purposeOfFunds || ""}
                onChange={(e: any) => {
                  const nextKyc = { ...app.kyc, purposeOfFunds: e.target.value };
                  update({ kyc: nextKyc });
                  handleAutoAdvance("purposeOfFunds", nextKyc);
                }}
                hasError={showErrors && fieldErrors.purposeOfFunds}
              >
                <option value="">Select…</option>
                {PurposeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              {showErrors && fieldErrors.purposeOfFunds && (
                <div style={components.form.errorText}>Select a purpose of funds.</div>
              )}
            </div>

            <div data-error={showErrors && fieldErrors.salesHistory}>
              <label style={components.form.label}>Years of sales history</label>
              <Select
                id={getWizardFieldId("step1", "salesHistory")}
                value={app.kyc.salesHistory || ""}
                onChange={(e: any) => {
                  const nextKyc = { ...app.kyc, salesHistory: e.target.value };
                  update({ kyc: nextKyc });
                  handleAutoAdvance("salesHistory", nextKyc);
                }}
                hasError={showErrors && fieldErrors.salesHistory}
              >
                <option value="">Select…</option>
                {SalesHistoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              {showErrors && fieldErrors.salesHistory && (
                <div style={components.form.errorText}>Select sales history.</div>
              )}
            </div>

            <div data-error={showErrors && fieldErrors.revenueLast12Months}>
              <label style={components.form.label}>Revenue last 12 months</label>
              <Select
                id={getWizardFieldId("step1", "revenueLast12Months")}
                value={app.kyc.revenueLast12Months || ""}
                onChange={(e: any) => {
                  const nextKyc = {
                    ...app.kyc,
                    revenueLast12Months: e.target.value,
                  };
                  update({ kyc: nextKyc });
                  handleAutoAdvance("revenueLast12Months", nextKyc);
                }}
                hasError={showErrors && fieldErrors.revenueLast12Months}
              >
                <option value="">Select…</option>
                {RevenueOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              {showErrors && fieldErrors.revenueLast12Months && (
                <div style={components.form.errorText}>Select a revenue range.</div>
              )}
            </div>

            <div data-error={showErrors && fieldErrors.monthlyRevenue}>
              <label style={components.form.label}>
                Avg monthly revenue (last 3 months)
              </label>
              <Select
                id={getWizardFieldId("step1", "monthlyRevenue")}
                value={app.kyc.monthlyRevenue || ""}
                onChange={(e: any) => {
                  const nextKyc = { ...app.kyc, monthlyRevenue: e.target.value };
                  update({ kyc: nextKyc });
                  handleAutoAdvance("monthlyRevenue", nextKyc);
                }}
                hasError={showErrors && fieldErrors.monthlyRevenue}
              >
                <option value="">Select…</option>
                {MonthlyRevenueOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              {showErrors && fieldErrors.monthlyRevenue && (
                <div style={components.form.errorText}>Select monthly revenue.</div>
              )}
            </div>

            {shouldShowAccountsReceivable && (
              <div data-error={showErrors && fieldErrors.accountsReceivable}>
                <label style={components.form.label}>Current AR balance</label>
                <Select
                  id={getWizardFieldId("step1", "accountsReceivable")}
                  value={app.kyc.accountsReceivable || ""}
                  onChange={(e: any) => {
                    const nextKyc = {
                      ...app.kyc,
                      accountsReceivable: e.target.value,
                    };
                    update({
                      kyc: nextKyc,
                      productCategory: null,
                      selectedProduct: undefined,
                      selectedProductId: undefined,
                      selectedProductType: undefined,
                      eligibleProducts: [],
                      eligibleCategories: [],
                      eligibilityReasons: [],
                    });
                    handleAutoAdvance("accountsReceivable", nextKyc);
                  }}
                  hasError={showErrors && fieldErrors.accountsReceivable}
                >
                  <option value="">Select…</option>
                  {AccountsReceivableOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
                {showErrors && fieldErrors.accountsReceivable && (
                  <div style={components.form.errorText}>
                    Select an AR balance.
                  </div>
                )}
              </div>
            )}

            {shouldShowFixedAssets && (
              <div data-error={showErrors && fieldErrors.fixedAssets}>
                <label style={components.form.label}>Fixed assets value</label>
                <Select
                  id={getWizardFieldId("step1", "fixedAssets")}
                  value={app.kyc.fixedAssets || ""}
                  onChange={(e: any) => {
                    const nextKyc = { ...app.kyc, fixedAssets: e.target.value };
                    update({ kyc: nextKyc });
                    handleAutoAdvance("fixedAssets", nextKyc);
                  }}
                  hasError={showErrors && fieldErrors.fixedAssets}
                >
                  <option value="">Select…</option>
                  {FixedAssetsOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
                {showErrors && fieldErrors.fixedAssets && (
                  <div style={components.form.errorText}>
                    Select a fixed asset value.
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <div style={{ ...layout.stickyCta, marginTop: tokens.spacing.lg }}>
          <Button
            style={{ width: "100%", maxWidth: "220px" }}
            onClick={() => {
              setShowErrors(true);
              if (!isValid) return;
              setShowErrors(false);
              void startApplication();
            }}
            disabled={!isValid}
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
            padding: tokens.spacing.md,
            zIndex: 50,
          }}
        >
          <div
            style={{
              ...components.card.base,
              maxWidth: "420px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: tokens.spacing.sm,
            }}
          >
            <h2 style={components.form.sectionTitle}>Funding availability</h2>
            <p style={components.form.subtitle}>
              Boreal funding is currently limited to businesses located in
              Canada or the United States.
            </p>
            <Button style={{ width: "100%" }} onClick={() => setShowLocationModal(false)}>
              OK
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default Step1_KYC;
