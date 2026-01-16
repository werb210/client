import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import { loadSessionFromUrl } from "../services/session";
import { OfflineStore } from "../state/offline";
import { Step1_KYC } from "../wizard/Step1_KYC";
import { Step2_Product } from "../wizard/Step2_Product";
import { Step3_Business } from "../wizard/Step3_Business";
import { Step4_Applicant } from "../wizard/Step4_Applicant";
import { Step5_Documents } from "../wizard/Step5_Documents";
import { Step6_Review } from "../wizard/Step6_Review";
import { StatusPage } from "../pages/StatusPage";

function ResumeRoute() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    loadSessionFromUrl()
      .then((session) => {
        if (!active) return;
        if (!session) {
          setError("Missing or invalid resume token.");
          return;
        }

        OfflineStore.save({
          kyc: {},
          matchPercentages: {},
          business: {},
          applicant: {},
          documents: {},
          documentsDeferred: false,
          termsAccepted: false,
          ...session.application,
          currentStep: session.step,
          applicationToken: session.token,
          applicationId: session.applicationId,
        });
        navigate(`/apply/step-${session.step}`, { replace: true });
      })
      .catch(() => {
        if (!active) return;
        setError("We couldn't resume your application. Please start again.");
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  if (!error) {
    return (
      <div className="page">
        <div className="card">
          <h2>Resuming your application</h2>
          <p>We're verifying your secure link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h2>Resume link unavailable</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/apply/step-1")}>Start again</button>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/resume" element={<ResumeRoute />} />
      <Route path="/apply/step-1" element={<Step1_KYC />} />
      <Route path="/apply/step-2" element={<Step2_Product />} />
      <Route path="/apply/step-3" element={<Step3_Business />} />
      <Route path="/apply/step-4" element={<Step4_Applicant />} />
      <Route path="/apply/step-5" element={<Step5_Documents />} />
      <Route path="/apply/step-6" element={<Step6_Review />} />
      <Route path="/status" element={<StatusPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
