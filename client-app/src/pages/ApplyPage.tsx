import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Step1_KYC } from "../wizard/Step1_KYC";
import { Step2_Product } from "../wizard/Step2_Product";
import { Step3_Business } from "../wizard/Step3_Business";
import { Step4_Applicant } from "../wizard/Step4_Applicant";
import { Step5_Documents } from "../wizard/Step5_Documents";
import { Step6_Review } from "../wizard/Step6_Review";
import { useApplicationStore } from "../state/useApplicationStore";
import { useTokenGuard } from "../hooks/useTokenGuard";

export function ApplyPage() {
  const { initialized, init } = useApplicationStore();
  const token = useTokenGuard();
  const needsRestart = !token && window.location.pathname !== "/apply/step-1";

  if (!initialized) init(); // builds empty application session

  useEffect(() => {
    if (needsRestart) {
      const id = setTimeout(() => {
        window.location.href = "/apply/step-1";
      }, 1200);
      return () => clearTimeout(id);
    }
  }, [needsRestart]);

  if (needsRestart) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-borealBlue">
            Let’s restart your application
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            We couldn’t find an active application token. You’ll be redirected
            to start again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Routes>
        <Route path="/" element={<Navigate to="step-1" replace />} />
        <Route path="step-1" element={<Step1_KYC />} />
        <Route path="step-2" element={<Step2_Product />} />
        <Route path="step-3" element={<Step3_Business />} />
        <Route path="step-4" element={<Step4_Applicant />} />
        <Route path="step-5" element={<Step5_Documents />} />
        <Route path="step-6" element={<Step6_Review />} />
      </Routes>
    </div>
  );
}
