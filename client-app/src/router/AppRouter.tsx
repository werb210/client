import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { EntryPage } from "../pages/EntryPage";
import { PortalEntry } from "../pages/PortalEntry";
import { StatusPage } from "../pages/StatusPage";
import { ResumePage } from "../pages/ResumePage";
import Step1 from "../wizard/Step1_KYC";
import Step2 from "../wizard/Step2_Product";
import Step3 from "../wizard/Step3_Business";
import Step4 from "../wizard/Step4_Applicant";
import Step5 from "../wizard/Step5_Documents";
import Step6 from "../wizard/Step6_Review";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/portal" element={<PortalEntry />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/resume" element={<ResumePage />} />

        <Route path="/apply">
          <Route index element={<EntryPage />} />
          <Route path="step-1" element={<Step1 />} />
          <Route path="step-2" element={<Step2 />} />
          <Route path="step-3" element={<Step3 />} />
          <Route path="step-4" element={<Step4 />} />
          <Route path="step-5" element={<Step5 />} />
          <Route path="step-6" element={<Step6 />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
