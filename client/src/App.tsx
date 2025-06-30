import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { FormDataProvider } from "@/context/FormDataContext";
import { ApplicationProvider } from "@/context/ApplicationContext";
import { ComprehensiveFormProvider } from "@/context/ComprehensiveFormContext";

// Core application pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import VerifyOtp from "@/pages/VerifyOtp";
import RequestReset from "@/pages/RequestReset";
import ResetPassword from "@/pages/ResetPassword";
import ProfessionalLandingPage from "@/pages/ProfessionalLandingPage";
import { NewLandingPage } from "@/pages/NewLandingPage";
import Dashboard from "@/pages/Dashboard";
import { NewPortalPage } from "@/pages/NewPortalPage";
import NotFound from "@/pages/NotFound";
import SignComplete from "@/pages/SignComplete";
import UploadDocuments from "@/pages/UploadDocuments";
import { ComprehensiveApplication } from "@/pages/ComprehensiveApplication";
import { BackendDiagnosticPage } from "@/pages/BackendDiagnosticPage";
import SideBySideApplication from "@/pages/SideBySideApplication";
import { DocumentValidationDemo } from "@/pages/DocumentValidationDemo";
import FaqPage from "@/pages/FaqPage";
import TroubleshootingPage from "@/pages/TroubleshootingPage";
import ProductAdminPage from "@/pages/ProductAdminPage";

// Application flow steps
import Step1FinancialProfile from "@/routes/Step1_FinancialProfile";
import Step2Recommendations from "@/routes/Step2_Recommendations";
import Step3BusinessDetails from "@/routes/Step3_BusinessDetails";
import Step4FinancialInfo from "@/routes/Step4_FinancialInfo";
import Step5DocumentUpload from "@/routes/Step5_DocumentUpload";
import Step6Signature from "@/routes/Step6_Signature";
// Step7Submit removed - handle completion in Step6

// PageShowcase for systematic V2 modernization
import PageShowcase from "@/routes/PageShowcase";
import PageComparison from "@/routes/PageComparison";

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
      {/* Authentication routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      {/* ARCHIVED: OTP verification route - disabled for simplified auth */}
      {/* <Route path="/verify-otp" component={VerifyOtp} /> */}
      <Route path="/request-reset" component={RequestReset} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/sign-complete" component={SignComplete} />
      <Route path="/backend-diagnostic" component={BackendDiagnosticPage} />

      {/* Default route - New landing page with V1 design - BYPASS AUTH FOR TESTING */}
      <Route path="/" component={NewLandingPage} />
      
      {/* Protected application routes */}
      <AuthGuard>
        <Route path="/portal" component={NewPortalPage} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/application" component={Step1FinancialProfile} />
        <Route path="/application/step-1" component={Step1FinancialProfile} />
        <Route path="/step1-financial-profile" component={Step1FinancialProfile} />
        <Route path="/step2-recommendations" component={Step2Recommendations} />
        <Route path="/step3-business-details" component={Step3BusinessDetails} />
        <Route path="/step4-financial-info" component={Step4FinancialInfo} />
        <Route path="/step5-document-upload" component={Step5DocumentUpload} />
        <Route path="/step6-signature" component={Step6Signature} />
        <Route path="/upload-documents" component={UploadDocuments} />
        {/* Comprehensive 42-field application system */}
        <Route path="/comprehensive-application" component={ComprehensiveApplication} />
        {/* Side-by-side application layout */}
        <Route path="/side-by-side-application" component={SideBySideApplication} />
        {/* Administrative pages - require admin/lender roles */}
        <Route path="/product-admin" component={ProductAdminPage} />
        {/* Step7 integrated into Step6 completion flow */}
      </AuthGuard>

      {/* Public demo pages */}
      <Route path="/document-validation" component={DocumentValidationDemo} />
      
      {/* Support pages */}
      <Route path="/faq" component={FaqPage} />
      <Route path="/troubleshooting" component={TroubleshootingPage} />

      {/* PageShowcase for systematic V2 modernization */}
      <Route path="/_showcase" component={PageShowcase} />
      <Route path="/_compare" component={PageComparison} />

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