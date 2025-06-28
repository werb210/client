import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FormDataProvider } from "@/context/FormDataContext";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import ApplicationForm from "@/pages/ApplicationForm";
import TwoFactorAuth from "@/pages/TwoFactorAuth";
import Registration from "@/pages/Registration";
import { ComprehensiveTestingChecklist } from "@/components/ComprehensiveTestingChecklist";
import TestConnection from "@/pages/TestConnection";
import SimpleTest from "@/pages/SimpleTest";
import CorsTest from "@/pages/CorsTest";
import DebugTest from "@/pages/DebugTest";
import SimpleRegisterTest from "@/pages/SimpleRegisterTest";
import BackendConnectivity from "@/pages/BackendConnectivity";
import AuthFlowTest from "@/pages/AuthFlowTest";
import VerificationReport from "@/pages/VerificationReport";
import Login from "@/pages/Login";
import PhoneLogin from "@/pages/PhoneLogin";
import Register from "@/pages/Register";
import VerifyOtp from "@/pages/VerifyOtp";
import RequestReset from "@/pages/RequestReset";
import ResetPassword from "@/pages/ResetPassword";
import Step1FinancialProfile from "@/routes/Step1_FinancialProfile";
import Step2Recommendations from "@/routes/Step2_Recommendations";
import Step3BusinessDetails from "@/routes/Step3_BusinessDetails";
import Step4FinancialInfo from "@/routes/Step4_FinancialInfo";
import Step5DocumentUpload from "@/routes/Step5_DocumentUpload";
import Step6Signature from "@/routes/Step6_Signature";
import Step7FinalSubmission from "@/routes/Step7_FinalSubmission";
import Recommendations from "@/pages/Recommendations";

function Router() {
  return (
    <AuthGuard>
      <Switch>
        {/* Authentication routes (public) */}
        <Route path="/login" component={PhoneLogin} />
        <Route path="/register" component={Register} />
        <Route path="/verify-otp" component={VerifyOtp} />
        <Route path="/request-reset" component={RequestReset} />
        <Route path="/reset-password/:token" component={ResetPassword} />
        <Route path="/debug-test" component={DebugTest} />
        <Route path="/cors-test" component={CorsTest} />
        <Route path="/simple-register-test" component={SimpleRegisterTest} />
        <Route path="/backend-test" component={BackendConnectivity} />
        <Route path="/auth-flow-test" component={AuthFlowTest} />
        
        {/* Redirect root to login for unauthenticated users */}
        <Route path="/" component={Login} />
        
        {/* Protected application routes */}
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/application" component={ApplicationForm} />
        <Route path="/testing" component={ComprehensiveTestingChecklist} />
        <Route path="/test-connection" component={TestConnection} />
        <Route path="/simple-test" component={SimpleTest} />
        <Route path="/verification" component={VerificationReport} />
        <Route path="/step1-financial-profile" component={Step1FinancialProfile} />
        <Route path="/step2-recommendations" component={Step2Recommendations} />
        <Route path="/step3-business-details" component={Step3BusinessDetails} />
        <Route path="/step4-financial-info" component={Step4FinancialInfo} />
        <Route path="/step5-documents" component={Step5DocumentUpload} />
        <Route path="/step6-signature" component={Step6Signature} />
        <Route path="/step7-submit" component={Step7FinalSubmission} />
        <Route path="/recommendations" component={Recommendations} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/2fa" component={TwoFactorAuth} />
        <Route path="/registration" component={Registration} />
        <Route component={NotFound} />
      </Switch>
    </AuthGuard>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <FormDataProvider>
            <Toaster />
            <Router />
          </FormDataProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
