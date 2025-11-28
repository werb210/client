import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Start from "./pages/Start/Start";
import Step1 from "./pages/Wizard/Step1";
import Step2 from "./pages/Wizard/Step2";
import Step3 from "./pages/Wizard/Step3";
import Step4 from "./pages/Wizard/Step4";
import Step5 from "./pages/Wizard/Step5";
import Step6 from "./pages/Wizard/Step6";
import Dashboard from "./pages/Portal/Dashboard";
import Documents from "./pages/Portal/Documents";
import Messages from "./pages/Portal/Messages";
import AuthProvider from "./context/AuthContext";
import ApplicationProvider from "./context/ApplicationContext";

function App() {
  return (
    <AuthProvider>
      <ApplicationProvider>
        <BrowserRouter>
          <Routes>
            {/* Start → login with email+phone → OTP */}
            <Route path="/" element={<Start />} />

            {/* Wizard */}
            <Route path="/apply/step-1" element={<Step1 />} />
            <Route path="/apply/step-2" element={<Step2 />} />
            <Route path="/apply/step-3" element={<Step3 />} />
            <Route path="/apply/step-4" element={<Step4 />} />
            <Route path="/apply/step-5" element={<Step5 />} />
            <Route path="/apply/step-6" element={<Step6 />} />

            {/* Portal */}
            <Route path="/portal" element={<Dashboard />} />
            <Route path="/portal/documents" element={<Documents />} />
            <Route path="/portal/messages" element={<Messages />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ApplicationProvider>
    </AuthProvider>
  );
}

export default App;
