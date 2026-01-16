import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ApplyStep1 from "../pages/apply/ApplyStep1";
import ApplyStep2 from "../pages/apply/ApplyStep2";
import ApplyStep3 from "../pages/apply/ApplyStep3";
import UploadDocuments from "../pages/apply/UploadDocuments";
import { loadSessionFromUrl } from "../services/session";

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

        localStorage.setItem("applicationId", session.applicationId);
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
      <Route path="/apply/step-1" element={<ApplyStep1 />} />
      <Route path="/apply/step-2" element={<ApplyStep2 />} />
      <Route path="/apply/step-3" element={<ApplyStep3 />} />
      <Route path="/apply/step-4" element={<UploadDocuments />} />
      <Route
        path="/apply/documents"
        element={<Navigate to="/apply/step-4" replace />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
