import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import AuthProvider from "./context/AuthContext";
import ApplicationProvider from "./context/ApplicationContext";
import PortalRoutes from "./routes/PortalRoutes";
import Start from "./pages/Start/Start";
import Step1 from "./pages/Apply/Step1";
import Step2 from "./pages/Apply/Step2";
import Step3 from "./pages/Apply/Step3";
import Step4 from "./pages/Apply/Step4";
import Step5 from "./pages/Apply/Step5";
import Step6 from "./pages/Wizard/Step6";
import BusinessInfo from "./pages/step3-business/BusinessInfo";
import ApplicantInfo from "./pages/step4-applicant/ApplicantInfo";
import RequiredDocuments from "./pages/step5-documents/RequiredDocuments";
import SubmitApplication from "./pages/step6-submit/SubmitApplication";

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
                  <Step1 />
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
            <Route path="/portal/*" element={<PortalRoutes />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ApplicationProvider>
    </AuthProvider>
  );
}

export default App;
