import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import AuthProvider from "./context/AuthContext";
import ApplicationProvider from "./context/ApplicationContext";
import Start from "./pages/Start/Start";
import Step1KYC from "./pages/steps/Step1KYC";
import Step2 from "./pages/Apply/Step2";
import Step3 from "./pages/Apply/Step3";
import Step4 from "./pages/Apply/Step4";
import Step5 from "./pages/Apply/Step5";
import Step6 from "./pages/Wizard/Step6";
import BusinessInfo from "./pages/step3-business/BusinessInfo";
import ApplicantInfo from "./pages/step4-applicant/ApplicantInfo";
import RequiredDocuments from "./pages/step5-documents/RequiredDocuments";
import SubmitApplication from "./pages/step6-submit/SubmitApplication";
import ClientPortal from "./pages/ClientPortal";
import Dashboard from "./pages/portal/Dashboard";
import DocumentsPage from "./pages/portal/DocumentsPage";
import StatusPage from "./pages/portal/StatusPage";
import MessagingPage from "./pages/portal/MessagingPage";
import ProfilePage from "./pages/portal/ProfilePage";
import ReportIssuePage from "./pages/portal/ReportIssuePage";
import { SupportWidget } from "./components/support/SupportWidget";

function App() {
  return (
    <AuthProvider>
      <ApplicationProvider>
        <BrowserRouter>
          <Routes>
            {/* Start → login with email+phone → OTP */}
            <Route path="/" element={<Start />} />

            {/* Wizard */}
            <Route
              path="/apply/step-1"
              element={
                <RequireAuth>
                  <Step1KYC />
                </RequireAuth>
              }
            />
            <Route
              path="/apply/step-2"
              element={
                <RequireAuth>
                  <Step2 />
                </RequireAuth>
              }
            />
            <Route
              path="/apply/step-3"
              element={
                <RequireAuth>
                  <Step3 />
                </RequireAuth>
              }
            />
            <Route
              path="/apply/step-4"
              element={
                <RequireAuth>
                  <Step4 />
                </RequireAuth>
              }
            />
            <Route
              path="/apply/step-5"
              element={
                <RequireAuth>
                  <Step5 />
                </RequireAuth>
              }
            />
            <Route
              path="/apply/step-6"
              element={
                <RequireAuth>
                  <Step6 />
                </RequireAuth>
              }
            />

            <Route
              path="/step3-business"
              element={
                <RequireAuth>
                  <BusinessInfo />
                </RequireAuth>
              }
            />
            <Route
              path="/step4-applicant"
              element={
                <RequireAuth>
                  <ApplicantInfo />
                </RequireAuth>
              }
            />
            <Route
              path="/step5-documents"
              element={
                <RequireAuth>
                  <RequiredDocuments />
                </RequireAuth>
              }
            />

            <Route
              path="/step6-terms"
              element={
                <RequireAuth>
                  <SubmitApplication />
                </RequireAuth>
              }
            />

            {/* Portal */}
            <Route path="/portal" element={<ClientPortal />}>
              <Route index element={<Dashboard />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="status" element={<StatusPage />} />
              <Route path="messages" element={<MessagingPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="report-issue" element={<ReportIssuePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <SupportWidget />
        </BrowserRouter>
      </ApplicationProvider>
    </AuthProvider>
  );
}

export default App;
