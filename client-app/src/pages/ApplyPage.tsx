import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Step1_KYC } from "../wizard/Step1_KYC";
import { Step2_Product } from "../wizard/Step2_Product";
import { Step3_Business } from "../wizard/Step3_Business";
import { Step4_Applicant } from "../wizard/Step4_Applicant";
import { useApplicationStore } from "../state/useApplicationStore";
import { layout } from "@/styles";
import { Spinner } from "../components/ui/Spinner";

const Step5 = lazy(() => import("../wizard/Step5_Documents"));
const Step6 = lazy(() => import("../wizard/Step6_Review"));

export function ApplyPage() {
  const { initialized, init } = useApplicationStore();

  if (!initialized) init();

  return (
    <div style={{ background: layout.page.background, minHeight: layout.page.minHeight }}>
      <Suspense
        fallback={
          <div className="w-full py-8 flex justify-center">
            <Spinner />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to="step-1" replace />} />
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
