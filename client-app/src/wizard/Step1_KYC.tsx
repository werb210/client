import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { loadStepData, mergeDraft, saveStepData } from "../client/autosave";
import {
  getNextFieldKey,
  getStepFieldKeys,
  getWizardFieldId,
} from "./wizardSchema";
import { enforceV1StepSchema } from "../schemas/v1WizardSchema";
import { track } from "../utils/track";
import { trackEvent } from "../utils/analytics";
import {
  consumePreApplication,
  lookupPreApplication,
} from "../api/preApplication";
import { useReadiness } from "../state/readinessStore";

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

const IndustryCards = [
  { title: "Construction", subtext: "General contractors and specialty trades", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80" },
  { title: "Manufacturing", subtext: "Production and industrial operations", image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=80" },
  { title: "Retail", subtext: "In-store and online product sales", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80" },
  { title: "Restaurant/Food Service", subtext: "Restaurants, catering, and food operations", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80" },
  { title: "Technology", subtext: "Software, IT, and digital services", image: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=900&q=80" },
  { title: "Healthcare", subtext: "Medical, wellness, and care providers", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80" },
  { title: "Transportation", subtext: "Freight, logistics, and delivery", image: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=900&q=80" },
  { title: "Professional Services", subtext: "Consulting, legal, and business services", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80" },
  { title: "Real Estate", subtext: "Property management and development", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80" },
  { title: "Agriculture", subtext: "Farming and agri-business operations", image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80" },
  { title: "Energy", subtext: "Utilities, oil, gas, and renewables", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=80" },
  { title: "Other", subtext: "Additional business industries", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80" },
];

const IndustryOptions = IndustryCards.map((industry) => industry.title);

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

function mapYearsInBusiness(years?: number) {
  if (typeof years !== "number") return undefined;
  if (years < 1) return "Less than 1 year";
  if (years <= 3) return "1 to 3 years";
  return "Over 3 years";
}

function mapAnnualRevenue(amount?: number) {
  if (typeof amount !== "number") return undefined;
  if (amount < 100000) return "Under $100,000";
  if (amount < 250000) return "$100,000 to $250,000";
  if (amount < 500000) return "$250,000 to $500,000";
  if (amount < 1000000) return "$500,000 to $1,000,000";
  if (amount < 5000000) return "$1,000,000 to $5,000,000";
  return "Over $5,000,000";
}

function mapMonthlyRevenue(amount?: number) {
  if (typeof amount !== "number") return undefined;
  if (amount < 25000) return "$10,000 to $25,000";
  if (amount < 50000) return "$25,000 to $50,000";
  if (amount < 100000) return "$50,000 to $100,000";
  if (amount < 250000) return "$100,000 to $250,000";
  return "Over $250,000";
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
  const { app, update, autosaveError } = useApplicationStore();
  const readiness = useReadiness();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const countryCode = useMemo(
    () => getCountryCode(app.kyc.businessLocation),
    [app.kyc.businessLocation]
  );
  const readinessEnabled = Boolean(readiness);
  const readinessFieldState = {
    companyName: Boolean(readiness?.companyName),
    industry: Boolean(readiness?.industry),
    salesHistory: typeof readiness?.yearsInBusiness === "number",
    monthlyRevenue: typeof readiness?.monthlyRevenue === "number",
    revenueLast12Months: typeof readiness?.annualRevenue === "number",
  };

  useEffect(() => {
    if (app.currentStep !== 1) {
      update({ currentStep: 1 });
    }
  }, [app.currentStep, update]);

  useEffect(() => {
    if (!readiness) return;

    const nextKyc = {
      ...app.kyc,
      companyName: readiness.companyName ?? app.kyc.companyName,
      industry: readiness.industry ?? app.kyc.industry,
      salesHistory:
        mapYearsInBusiness(readiness.yearsInBusiness) ?? app.kyc.salesHistory,
      monthlyRevenue:
        mapMonthlyRevenue(readiness.monthlyRevenue) ?? app.kyc.monthlyRevenue,
      revenueLast12Months:
        mapAnnualRevenue(readiness.annualRevenue) ?? app.kyc.revenueLast12Months,
    };

    const unchanged =
      app.readinessLeadId === readiness.leadId &&
      nextKyc.companyName === app.kyc.companyName &&
      nextKyc.industry === app.kyc.industry &&
      nextKyc.salesHistory === app.kyc.salesHistory &&
      nextKyc.monthlyRevenue === app.kyc.monthlyRevenue &&
      nextKyc.revenueLast12Months === app.kyc.revenueLast12Months;

    if (unchanged) return;

    update({
      readinessLeadId: readiness.leadId,
      kyc: nextKyc,
    });
  }, [
    app.kyc,
    app.readinessLeadId,
    readiness,
    update,
  ]);

  useEffect(() => {
    async function loadPrefill() {
      try {
        const res = await fetch("/api/continuation/session");
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        if (data?.prefill) {
          update({
            kyc: {
              ...app.kyc,
              ...data.prefill,
            },
          });
        }
      } catch {
        // no-op when continuation prefill is unavailable
      }
    }

    void loadPrefill();
  }, [update]);


  useEffect(() => {
    const savedToken =
      localStorage.getItem("applicationToken") ||
      localStorage.getItem("boreal_application_token");
    if (!savedToken) return;

    fetch(`/api/applications/${savedToken}`)
      .then((res) => res.json())
      .then((data) => {
        const payload = data?.application ?? data;
        if (!payload || typeof payload !== "object") return;

        const hydratedKyc = payload?.financialProfile ?? payload?.kyc ?? payload;
        if (!hydratedKyc || typeof hydratedKyc !== "object") return;

        update({
          applicationToken: app.applicationToken || savedToken,
          applicationId: app.applicationId || savedToken,
          kyc: {
            ...app.kyc,
            ...hydratedKyc,
            companyName: hydratedKyc.companyName ?? payload.companyName ?? app.kyc.companyName,
            fullName: hydratedKyc.fullName ?? payload.fullName ?? app.kyc.fullName,
            email: hydratedKyc.email ?? payload.email ?? app.kyc.email,
            phone: hydratedKyc.phone ?? payload.phone ?? app.kyc.phone,
            industry: hydratedKyc.industry ?? payload.industry ?? app.kyc.industry,
            salesHistory:
              hydratedKyc.salesHistory ??
              hydratedKyc.yearsInBusiness ??
              payload.yearsInBusiness ??
              app.kyc.salesHistory,
            monthlyRevenue:
              hydratedKyc.monthlyRevenue ?? payload.monthlyRevenue ?? app.kyc.monthlyRevenue,
            revenueLast12Months:
              hydratedKyc.revenueLast12Months ??
              hydratedKyc.annualRevenue ??
              payload.annualRevenue ??
              app.kyc.revenueLast12Months,
            accountsReceivable:
              hydratedKyc.accountsReceivable ??
              hydratedKyc.arOutstanding ??
              payload.arOutstanding ??
              app.kyc.accountsReceivable,
            existingDebt:
              hydratedKyc.existingDebt ?? payload.existingDebt ?? app.kyc.existingDebt,
          },
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const email = localStorage.getItem("preapp_email");
    if (!email) return;

    void lookupPreApplication(email)
      .then(async (data) => {
        if (!data) return;

        update({
          kyc: {
            ...app.kyc,
            companyName: data.companyName || app.kyc.companyName,
            fullName: data.fullName || app.kyc.fullName,
            email: data.email || app.kyc.email,
            phone: data.phone || app.kyc.phone,
            revenueLast12Months:
              data.annualRevenue || app.kyc.revenueLast12Months,
            fundingAmount:
              data.requestedAmount !== undefined && data.requestedAmount !== null
                ? String(data.requestedAmount)
                : app.kyc.fundingAmount,
            salesHistory: data.yearsInBusiness || app.kyc.salesHistory,
          },
        });

        await consumePreApplication(data.token);
        localStorage.removeItem("preapp_email");
      })
      .catch((error) => {
        console.warn("Unable to continue pre-application", error);
      });
  }, []);

  useEffect(() => {
    trackEvent("client_step_viewed", { step: 1 });
  }, []);

  useEffect(() => {
    const draft = loadStepData(1);
    if (!draft) return;
    const merged = mergeDraft(app.kyc, draft);
    const changed = Object.keys(merged).some(
      (key) => merged[key] !== app.kyc[key]
    );
    if (changed) {
      update({ kyc: merged });
    }
  }, [app.kyc, update]);

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
      industry:
        !readinessFieldState.industry && !Validate.required(values.industry),
      purposeOfFunds: !Validate.required(values.purposeOfFunds),
      salesHistory:
        !readinessFieldState.salesHistory && !Validate.required(values.salesHistory),
      revenueLast12Months:
        !readinessFieldState.revenueLast12Months &&
        !Validate.required(values.revenueLast12Months),
      monthlyRevenue:
        !readinessFieldState.monthlyRevenue && !Validate.required(values.monthlyRevenue),
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
    saveStepData(1, app.kyc);
    enforceV1StepSchema("step1", app.kyc);
    const payload = app.kyc;

    const amount = parseCurrency(payload.fundingAmount);
    const matchPercentages = buildMatchPercentages(
      Number.isNaN(amount) ? 0 : amount
    );
    try {
      const payloadBody = {
        financialProfile: payload,
      };
      const existingApplicationId = applicationId || app.applicationId || app.applicationToken;

      if (existingApplicationId) {
        await ClientAppAPI.updateApplication(existingApplicationId, payloadBody);
        localStorage.setItem(
          "boreal_application_token",
          app.applicationToken || existingApplicationId
        );
        update({
          applicationToken: app.applicationToken || existingApplicationId,
          applicationId: app.applicationId || existingApplicationId,
          matchPercentages,
        });
      } else {
        const res = await ClientAppAPI.start(payloadBody);
        const token = res?.data?.token;
        if (!token) {
          alert("We couldn't start your application. Please try again.");
          return;
        }
        localStorage.setItem("boreal_application_token", token);
        update({ applicationToken: token, matchPercentages });
      }
      track("apply_started", { step: 1 });
      track("step_completed", { step: 1 });
      navigate("/apply/step-2");
    } catch (error) {
      console.error("Failed to start application:", error);
      alert("We couldn't start your application. Please try again.");
    }
  }



  useEffect(() => {
    if (
      app.kyc.companyName &&
      app.kyc.fullName &&
      app.kyc.email &&
      app.kyc.phone
    ) {
      navigate("/apply/step-2");
    }
  }, [app.kyc.companyName, app.kyc.email, app.kyc.fullName, app.kyc.phone, navigate]);

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
        <StepHeader step={1} title="Know Your Client" />
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
        <StepHeader step={1} title="Financial Profile" />

        {readinessEnabled && (
          <Card
            variant="muted"
            style={{
              border: `1px solid ${tokens.colors.primary}`,
              background: "rgba(14, 165, 233, 0.1)",
              marginBottom: tokens.spacing.md,
            }}
          >
            <strong>You previously completed a Capital Readiness Check.</strong>
            <div>Your application has been pre-filled.</div>
          </Card>
        )}

        <Card
          variant="muted"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.spacing.xs,
            marginBottom: tokens.spacing.md,
          }}
        >
          {readinessEnabled && (
            <div
              style={{
                display: "inline-flex",
                width: "fit-content",
                padding: "4px 10px",
                borderRadius: tokens.radii.pill,
                background: "rgba(14, 165, 233, 0.14)",
                color: tokens.colors.primary,
                fontWeight: 600,
                fontSize: "12px",
              }}
            >
              Pre-qualified via Capital Readiness
            </div>
          )}
          {app.kyc.companyName && (
            <div className="text-sm text-neutral-400">
              {readinessFieldState.companyName
                ? "✔ Confirmed via Capital Readiness"
                : `Company: ${app.kyc.companyName}`}
            </div>
          )}
          {app.kyc.fullName && (
            <div className="text-sm text-neutral-400">Full name: {app.kyc.fullName}</div>
          )}
          {app.kyc.email && (
            <div className="text-sm text-neutral-400">Email: {app.kyc.email}</div>
          )}
          {app.kyc.phone && (
            <div className="text-sm text-neutral-400">Phone: {app.kyc.phone}</div>
          )}
          {app.kyc.industry && (
            <div className="text-sm text-neutral-400">Industry: {app.kyc.industry}</div>
          )}
          {app.kyc.salesHistory && (
            <div className="text-sm text-neutral-400">Years in business: {app.kyc.salesHistory}</div>
          )}
          {app.kyc.monthlyRevenue && (
            <div className="text-sm text-neutral-400">Monthly revenue: {app.kyc.monthlyRevenue}</div>
          )}
          {app.kyc.revenueLast12Months && (
            <div className="text-sm text-neutral-400">Annual revenue: {app.kyc.revenueLast12Months}</div>
          )}
          {app.kyc.accountsReceivable && (
            <div className="text-sm text-neutral-400">AR outstanding: {app.kyc.accountsReceivable}</div>
          )}
          {app.kyc.existingDebt !== undefined && app.kyc.existingDebt !== null && (
            <div className="text-sm text-neutral-400">Existing debt: {String(app.kyc.existingDebt)}</div>
          )}
        </Card>
        <Card
          style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg }}
          onBlurCapture={() => saveStepData(1, app.kyc)}
        >
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

{readinessFieldState.industry ? (
              <div>✔ Confirmed via Capital Readiness</div>
            ) : (
            <div data-error={showErrors && fieldErrors.industry}>
              <label style={components.form.label}>Industry</label>
              <input id={getWizardFieldId("step1", "industry")} value={app.kyc.industry || ""} readOnly hidden />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: tokens.spacing.sm,
                }}
              >
                {IndustryCards.map((industry) => {
                  const selected = app.kyc.industry === industry.title;
                  return (
                    <button
                      key={industry.title}
                      className="industry-card"
                      type="button"
                      onClick={() => {
                        const nextKyc = { ...app.kyc, industry: industry.title };
                        update({ kyc: nextKyc });
                        handleAutoAdvance("industry", nextKyc);
                      }}
                      style={{
                        borderRadius: tokens.radii.md,
                        border: `2px solid ${selected ? tokens.colors.primary : tokens.colors.border}`,
                        background: tokens.colors.surface,
                        textAlign: "left",
                        overflow: "hidden",
                        padding: 0,
                        cursor: "pointer",
                        boxShadow: selected ? tokens.shadows.focus : "0 6px 16px rgba(15, 23, 42, 0.08)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                    >
                      <img src={industry.image} alt={industry.title} style={{ width: "100%", height: "108px" }} />
                      <div style={{ padding: tokens.spacing.sm, display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ fontSize: "15px", fontWeight: 600, color: tokens.colors.textPrimary }}>{industry.title}</div>
                        <div style={{ fontSize: "13px", color: tokens.colors.textSecondary }}>{industry.subtext}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {showErrors && fieldErrors.industry && (
                <div style={components.form.errorText}>Select your industry.</div>
              )}
            </div>
            )}

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

{readinessFieldState.salesHistory ? (
              <div>✔ Confirmed via Capital Readiness</div>
            ) : (
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
            )}

            {readinessFieldState.revenueLast12Months ? (
              <div>✔ Confirmed via Capital Readiness</div>
            ) : (
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
            )}

            {readinessFieldState.monthlyRevenue ? (
              <div>✔ Confirmed via Capital Readiness</div>
            ) : (
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
            )}

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
