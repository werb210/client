import { Switch, Route } from "wouter";

// V1 Route Components (Source of Truth)
import Step1FinancialProfile from "@/routes/Step1_FinancialProfile_Complete";
import Step2Recommendations from "@/routes/Step2_Recommendations";
// NEW: Updated Step 3 & 4 Route Components (July 2, 2025)
import Step3BusinessDetailsNew from "@/routes/Step3_BusinessDetails_New";
import Step4ApplicantInfoNew from "@/routes/Step4_ApplicantInfo_New";

import Step5DocumentUpload from "@/routes/Step5_DocumentUpload";
import Step6Signature from "@/routes/Step6_Signature";
import Step7Submit from "@/routes/Step7_Submit";

// Core Pages (Authentication removed)
import LandingPage from "@/pages/LandingPage";
import SimpleDashboard from "@/pages/SimpleDashboard";
import NotFound from "@/pages/NotFound";
import ApplicationSuccess from "@/pages/ApplicationSuccess";
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
import LenderProductsByCountry from "@/routes/LenderProductsByCountry";
import CompleteWorkflowTest from "@/test/CompleteWorkflowTest";
import StageMonitorTest from "@/test/StageMonitorTest";
import SignNowWorkflowTest from "@/test/SignNowWorkflowTest";
import Step5Test from "@/pages/Step5Test";
import Steps34Test from "@/pages/Steps34Test";
import TestingFlowValidation from "@/pages/TestingFlowValidation";
import UnifiedDocumentTest from "@/pages/UnifiedDocumentTest";
import LenderCategoriesTest from "@/pages/LenderCategoriesTest";
import DocumentRequirementsTest from "@/pages/DocumentRequirementsTest";


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
      <Route path="/lenders-by-country" component={LenderProductsByCountry} />
      <Route path="/staff-api-test" component={StaffApiTest} />
      <Route path="/cors-test" component={CorsTest} />
      <Route path="/api-test" component={ApiTest} />
      <Route path="/sync-monitor" component={SyncMonitor} />
      <Route path="/complete-workflow-test" component={CompleteWorkflowTest} />
      <Route path="/stage-monitor-test" component={StageMonitorTest} />
      <Route path="/signnow-workflow-test" component={SignNowWorkflowTest} />
      <Route path="/step5-test" component={Step5Test} />
      <Route path="/steps34-test" component={Steps34Test} />
      <Route path="/testing-flow-validation" component={TestingFlowValidation} />
      <Route path="/unified-document-test" component={UnifiedDocumentTest} />
      <Route path="/lender-categories" component={LenderCategoriesTest} />
      <Route path="/document-requirements-test" component={DocumentRequirementsTest} />

      {/* Primary Application Flow - V1 Routes (Source of Truth) */}
      <Route path="/step1-financial-profile" component={Step1FinancialProfile} />
      <Route path="/apply/step-1" component={Step1FinancialProfile} />
      <Route path="/step2-recommendations" component={Step2Recommendations} />
      <Route path="/apply/step-2" component={Step2Recommendations} />
      <Route path="/step3-business-details" component={Step3BusinessDetailsNew} />
      <Route path="/apply/step-3" component={Step3BusinessDetailsNew} />
      <Route path="/step4-applicant-details" component={Step4ApplicantInfoNew} />
      <Route path="/apply/step-4" component={Step4ApplicantInfoNew} />
      <Route path="/step5-document-upload" component={Step5DocumentUpload} />
      <Route path="/apply/step-5" component={Step5DocumentUpload} />
      <Route path="/step6-signature" component={Step6Signature} />
      <Route path="/apply/step-6" component={Step6Signature} />
      <Route path="/step7-submit" component={Step7Submit} />
      <Route path="/apply/step-7" component={Step7Submit} />
      
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