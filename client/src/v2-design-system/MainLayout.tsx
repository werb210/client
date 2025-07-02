import { Switch, Route } from "wouter";

// V1 Route Components (Source of Truth)
import Step1FinancialProfile from "@/routes/Step1_FinancialProfile_Complete";
import Step2Recommendations from "@/routes/Step2_Recommendations";
import Step3BusinessDetails from "@/routes/Step3_BusinessDetails";
import Step4FinancialInfo from "@/routes/Step4_FinancialInfo";

import Step5DocumentUpload from "@/routes/Step5_DocumentUpload";
import Step6Signature from "@/routes/Step6_Signature";

// Core Pages (Authentication removed)
import LandingPage from "@/pages/LandingPage";
import SimpleDashboard from "@/pages/SimpleDashboard";
import NotFound from "@/pages/NotFound";
import SignComplete from "@/pages/SignComplete";
import UploadDocuments from "@/pages/UploadDocuments";
import { BackendDiagnosticPage } from "@/_legacy_auth/BackendDiagnosticPage";
import SideBySideApplication from "@/pages/SideBySideApplication";
import SimpleApplication from "@/pages/SimpleApplication";
import LenderTest from "@/pages/LenderTest";
import LendersByCategory from "@/pages/LendersByCategory";
import StaffApiTest from "@/pages/StaffApiTest";
import CorsTest from "@/pages/CorsTest";
import ApiTest from "@/pages/ApiTest";
import SyncMonitor from "@/pages/SyncMonitor";


/**
 * V2 Design System - Main Layout Router
 * 
 * This is the official routing structure extracted from V1 SideBySideApplication
 * and optimized for V2. Uses V1 route components as source of truth.
 */
export function MainLayout() {
  return (
    <Switch>
      {/* Diagnostic Routes */}
      <Route path="/backend-diagnostic" component={BackendDiagnosticPage} />
      <Route path="/lender-test" component={LenderTest} />
      <Route path="/lenders-by-category" component={LendersByCategory} />
      <Route path="/staff-api-test" component={StaffApiTest} />
      <Route path="/cors-test" component={CorsTest} />
      <Route path="/api-test" component={ApiTest} />
      <Route path="/sync-monitor" component={SyncMonitor} />


      {/* Primary Application Flow - V1 Routes (Source of Truth) */}
      <Route path="/step1-financial-profile" component={Step1FinancialProfile} />
      <Route path="/apply/step-1" component={Step1FinancialProfile} />
      <Route path="/step2-recommendations" component={Step2Recommendations} />
      <Route path="/apply/step-2" component={Step2Recommendations} />
      <Route path="/step3-business-details" component={Step3BusinessDetails} />
      <Route path="/apply/step-3" component={Step3BusinessDetails} />
      <Route path="/step4-financial-info" component={Step4FinancialInfo} />
      <Route path="/apply/step-4" component={Step4FinancialInfo} />
      <Route path="/step5-document-upload" component={Step5DocumentUpload} />
      <Route path="/apply/step-5" component={Step5DocumentUpload} />
      <Route path="/step6-signature" component={Step6Signature} />
      <Route path="/apply/step-6" component={Step6Signature} />
      
      {/* Dashboard */}
      <Route path="/dashboard" component={SimpleDashboard} />
      
      {/* Document Management */}
      <Route path="/sign-complete" component={SignComplete} />
      <Route path="/upload-documents/:applicationId?" component={UploadDocuments} />
      
      {/* Application Entry Points */}
      <Route path="/simple-application" component={SimpleApplication} />
      <Route path="/application" component={SideBySideApplication} />
      <Route path="/side-by-side-application" component={SideBySideApplication} />
      
      {/* Default Route - Landing Page */}
      <Route path="/" component={LandingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}