import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import VerifyOTP from "./pages/VerifyOTP";
import Step1 from "./pages/Step1";
import Step2 from "./pages/Step2";
import Step3 from "./pages/Step3";
import Step4 from "./pages/Step4";
import Step5 from "./pages/Step5";
import Step6 from "./pages/Step6";
import Portal from "./pages/Portal";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./store/auth";

export default function Router() {
  const { fetchUser } = useAuth();
  fetchUser();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/verify" element={<VerifyOTP />} />

        <Route
          path="/step-1"
          element={
            <ProtectedRoute>
              <Step1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step-2"
          element={
            <ProtectedRoute>
              <Step2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step-3"
          element={
            <ProtectedRoute>
              <Step3 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step-4"
          element={
            <ProtectedRoute>
              <Step4 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step-5"
          element={
            <ProtectedRoute>
              <Step5 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step-6"
          element={
            <ProtectedRoute>
              <Step6 />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portal"
          element={
            <ProtectedRoute>
              <Portal />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

