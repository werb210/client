import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { FormDataProvider } from "@/context/FormDataContext";
import { ApplicationProvider } from "@/context/ApplicationContext";
import { ComprehensiveFormProvider } from "@/context/ComprehensiveFormContext";

// Essential pages only
import Login from "@/pages/Login";
import PhoneLogin from "@/pages/PhoneLogin";
import Register from "@/pages/Register";
import VerifyOtp from "@/pages/VerifyOtp";
import RequestReset from "@/pages/RequestReset";
import ResetPassword from "@/pages/ResetPassword";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import ServerTest from "@/pages/ServerTest";
import SignComplete from "@/pages/SignComplete";
import UploadDocuments from "@/pages/UploadDocuments";
import SimpleTest from "@/pages/SimpleTest";
import TestApp from "@/pages/TestApp";
import SMSDiagnostic from "@/pages/SMSDiagnostic";
import TestLenderAPI from "@/pages/TestLenderAPI";
import { ComprehensiveApplication } from "@/pages/ComprehensiveApplication";

// Application flow steps
import Step1FinancialProfile from "@/routes/Step1_FinancialProfile";
import Step2Recommendations from "@/routes/Step2_Recommendations";
import Step3BusinessDetails from "@/routes/Step3_BusinessDetails";
import Step4FinancialInfo from "@/routes/Step4_FinancialInfo";
import Step5DocumentUpload from "@/routes/Step5_DocumentUpload";
import Step6Signature from "@/routes/Step6_Signature";
// Step7Submit removed - handle completion in Step6

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/simple-test" component={SimpleTest} />
      <Route path="/server-test" component={ServerTest} />
      <Route path="/login" component={Login} />
      <Route path="/phone-login" component={PhoneLogin} />
      <Route path="/register" component={Register} />
      <Route path="/verify-otp" component={VerifyOtp} />
      <Route path="/request-reset" component={RequestReset} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/sign-complete" component={SignComplete} />
      <Route path="/landing" component={Landing} />
      <Route path="/sms-diagnostic" component={SMSDiagnostic} />
      <Route path="/test-lender-api" component={TestLenderAPI} />
      
      {/* Protected application routes */}
      <AuthGuard>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/application" component={Step1FinancialProfile} />
        <Route path="/step1-financial-profile" component={Step1FinancialProfile} />
        <Route path="/step2-recommendations" component={Step2Recommendations} />
        <Route path="/step3-business-details" component={Step3BusinessDetails} />
        <Route path="/step4-financial-info" component={Step4FinancialInfo} />
        <Route path="/step5-document-upload" component={Step5DocumentUpload} />
        <Route path="/step6-signature" component={Step6Signature} />
        <Route path="/upload-documents" component={UploadDocuments} />
        {/* Comprehensive 42-field application system */}
        <Route path="/comprehensive-application" component={ComprehensiveApplication} />
        {/* Step7 integrated into Step6 completion flow */}
      </AuthGuard>
      
      {/* Default route - Test app to verify functionality */}
      <Route path="/" component={TestApp} />
      <Route path="/home" component={Landing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FormDataProvider>
          <ApplicationProvider>
            <ComprehensiveFormProvider>
              <div className="min-h-screen bg-background">
                <Router />
                <Toaster />
              </div>
            </ComprehensiveFormProvider>
          </ApplicationProvider>
        </FormDataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;