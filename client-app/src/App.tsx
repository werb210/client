import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import AuthProvider from "./context/AuthContext";
import ApplicationProvider from "./context/ApplicationContext";
import Dashboard from "./pages/Portal/Dashboard";
import Documents from "./pages/Portal/Documents";
import Messages from "./pages/Portal/Messages";
import Start from "./pages/Start/Start";
import Step1 from "./pages/Apply/Step1";
import Step2 from "./pages/Wizard/Step2";
import Step3 from "./pages/Wizard/Step3";
import Step4 from "./pages/Wizard/Step4";
import Step5 from "./pages/Wizard/Step5";
import Step6 from "./pages/Wizard/Step6";

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

            {/* Portal */}
            <Route
              path="/portal"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/portal/documents"
              element={
                <RequireAuth>
                  <Documents />
                </RequireAuth>
              }
            />
            <Route
              path="/portal/messages"
              element={
                <RequireAuth>
                  <Messages />
                </RequireAuth>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ApplicationProvider>
    </AuthProvider>
  );
}

export default App;
