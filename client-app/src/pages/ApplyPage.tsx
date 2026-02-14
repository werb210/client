import { Suspense, lazy, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import { Step1_KYC } from "../wizard/Step1_KYC";
import { Step2_Product } from "../wizard/Step2_Product";
import { Step3_Business } from "../wizard/Step3_Business";
import { Step4_Applicant } from "../wizard/Step4_Applicant";
import { useApplicationStore } from "../state/useApplicationStore";
import { components, layout, tokens } from "@/styles";
import { Spinner } from "../components/ui/Spinner";
import { ClientAppAPI } from "../api/clientApp";
import { extractApplicationFromStatus } from "../applications/resume";
import { fetchContinuation } from "@/api/continuation";
import { useReadiness } from "@/state/readinessStore";

const Step5 = lazy(() => import("../wizard/Step5_Documents"));
const Step6 = lazy(() => import("../wizard/Step6_Review"));

export function ApplyPage() {
  const { initialized, init, app, update } = useApplicationStore();
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const readiness = useReadiness();
  const continuationToken = useMemo(
    () => new URLSearchParams(window.location.search).get("continue"),
    []
  );

  if (!initialized) init();


  useEffect(() => {
    if (!readiness) return;

    const [firstName = "", ...lastNameParts] = (readiness.fullName || "").trim().split(/\s+/);
    const lastName = lastNameParts.join(" ");

    const nextKyc = {
      ...app.kyc,
      companyName: readiness.companyName || app.kyc.companyName || "",
      industry: readiness.industry || app.kyc.industry || "",
      salesHistory:
        readiness.yearsInBusiness !== undefined && readiness.yearsInBusiness !== null
          ? String(readiness.yearsInBusiness)
          : app.kyc.salesHistory,
      monthlyRevenue:
        readiness.monthlyRevenue !== undefined && readiness.monthlyRevenue !== null
          ? String(readiness.monthlyRevenue)
          : app.kyc.monthlyRevenue,
      revenueLast12Months:
        readiness.annualRevenue !== undefined && readiness.annualRevenue !== null
          ? String(readiness.annualRevenue)
          : app.kyc.revenueLast12Months,
      accountsReceivable:
        readiness.arOutstanding !== undefined && readiness.arOutstanding !== null
          ? String(readiness.arOutstanding)
          : app.kyc.accountsReceivable,
      existingDebt:
        typeof readiness.existingDebt === "boolean"
          ? readiness.existingDebt
          : app.kyc.existingDebt,
    };

    const nextBusiness = {
      ...app.business,
      legalName: readiness.companyName || app.business.legalName || "",
      businessName: readiness.companyName || app.business.businessName || "",
      phone: readiness.phone || app.business.phone || "",
    };

    const nextApplicant = {
      ...app.applicant,
      firstName: firstName || app.applicant.firstName || "",
      lastName: lastName || app.applicant.lastName || "",
      email: readiness.email || app.applicant.email || "",
      phone: readiness.phone || app.applicant.phone || "",
    };

    const unchanged =
      app.readinessLeadId === readiness.leadId &&
      JSON.stringify(nextKyc) === JSON.stringify(app.kyc) &&
      JSON.stringify(nextBusiness) === JSON.stringify(app.business) &&
      JSON.stringify(nextApplicant) === JSON.stringify(app.applicant);

    if (unchanged) return;

    update({
      readinessLeadId: readiness.leadId,
      kyc: nextKyc,
      business: nextBusiness,
      applicant: nextApplicant,
    });
  }, [app.applicant, app.business, app.kyc, app.readinessLeadId, readiness, update]);

  useEffect(() => {
    if (!continuationToken) return;

    let active = true;

    void fetchContinuation(continuationToken)
      .then((data) => {
        if (!active || !data) return;

        const [firstName = "", ...lastNameParts] = (data.fullName || "").trim().split(/\s+/);
        const lastName = lastNameParts.join(" ");

        update({
          continuationToken,
          kyc: {
            ...app.kyc,
            industry: data.industry || app.kyc.industry || "",
            salesHistory:
              data.yearsInBusiness !== undefined && data.yearsInBusiness !== null
                ? String(data.yearsInBusiness)
                : app.kyc.salesHistory,
            monthlyRevenue:
              data.monthlyRevenue !== undefined && data.monthlyRevenue !== null
                ? String(data.monthlyRevenue)
                : app.kyc.monthlyRevenue,
            revenueLast12Months:
              data.annualRevenue !== undefined && data.annualRevenue !== null
                ? String(data.annualRevenue)
                : app.kyc.revenueLast12Months,
            accountsReceivable:
              data.arOutstanding !== undefined && data.arOutstanding !== null
                ? String(data.arOutstanding)
                : app.kyc.accountsReceivable,
            existingDebt:
              typeof data.existingDebt === "boolean"
                ? data.existingDebt
                : app.kyc.existingDebt,
          },
          business: {
            ...app.business,
            legalName: data.companyName || app.business.legalName || "",
            businessName: data.companyName || app.business.businessName || "",
            phone: data.phone || app.business.phone || "",
          },
          applicant: {
            ...app.applicant,
            firstName: firstName || app.applicant.firstName || "",
            lastName: lastName || app.applicant.lastName || "",
            email: data.email || app.applicant.email || "",
            phone: data.phone || app.applicant.phone || "",
          },
        });
      })
      .catch(() => {
        // continuation payload unavailable
      });

    return () => {
      active = false;
    };
  }, [continuationToken, update]);

  useEffect(() => {
    if (!applicationId) return;

    async function loadDraft() {
      try {
        const response = await ClientAppAPI.getApplication(applicationId);
        const draft = response?.data?.application ?? response?.data;

        if (!draft) {
          navigate("/", { replace: true });
          return;
        }

        if (draft.status === "draft") {
          const hydrated = extractApplicationFromStatus(draft, app.applicationToken || applicationId);
          update({
            ...hydrated,
            applicationId: draft.applicationId || draft.id || applicationId,
            currentStep: hydrated.currentStep || app.currentStep || 1,
          });
        }
      } catch {
        navigate("/", { replace: true });
      }
    }

    void loadDraft();
  }, [applicationId, app.applicationToken, app.currentStep, navigate, update]);

  return (
    <div style={{ background: layout.page.background, minHeight: layout.page.minHeight }}>
      <section
        style={{
          maxWidth: "var(--form-max-width)",
          margin: "0 auto",
          padding: "var(--page-padding)",
          paddingBottom: 0,
        }}
      >
        <div
          style={{
            background: tokens.colors.surface,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: tokens.radii.lg,
            boxShadow: tokens.shadows.card,
            padding: tokens.spacing.xl,
            display: "flex",
            flexDirection: "column",
            gap: tokens.spacing.sm,
          }}
        >
          <h1 className="text-4xl md:text-5xl font-bold" style={{ margin: 0, color: tokens.colors.textPrimary }}>
            Start Your Business Financing Application
          </h1>
          <p style={{ ...components.form.subtitle, fontSize: "16px", color: "#4B5563" }}>
            Complete this secure application to receive tailored funding options.
          </p>
          {(continuationToken || readiness) && (
          <div
            style={{
              borderRadius: tokens.radii.md,
              border: `1px solid ${tokens.colors.border}`,
              padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
              color: tokens.colors.textSecondary,
              background: tokens.colors.backgroundAlt,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Continuing your application
          </div>
          )}
        </div>
      </section>
      <Suspense
        fallback={
          <div className="w-full py-8 flex justify-center">
            <Spinner />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to={`step-${Math.max(1, Math.min(6, Number(app.currentStep || 1)))}`} replace />} />
          <Route path="step-1" element={<Step1_KYC />} />
          <Route path="step-2" element={<Step2_Product />} />
          <Route path="step-3" element={<Step3_Business />} />
          <Route path="step-4" element={<Step4_Applicant />} />
          <Route path="step-5" element={<Step5 />} />
          <Route path="step-6" element={<Step6 />} />
        </Routes>
      </Suspense>
    </div>
  );
}
