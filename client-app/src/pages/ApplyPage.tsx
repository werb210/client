import { Suspense, lazy, useEffect } from "react";
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

const Step5 = lazy(() => import("../wizard/Step5_Documents"));
const Step6 = lazy(() => import("../wizard/Step6_Review"));

export function ApplyPage() {
  const { initialized, init, app, update } = useApplicationStore();
  const { applicationId } = useParams();
  const navigate = useNavigate();

  if (!initialized) init();

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
      } catch (err) {
        console.error("Failed to load draft", err);
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
