import { Switch, Route } from "wouter";

// V1 Route Components (Source of Truth)
import Step1FinancialProfile from "@/routes/Step1_FinancialProfile_Complete";
import Step2Recommendations from "@/routes/Step2_Recommendations";
// NEW: Separated Step 3 & 4 Route Components (July 3, 2025)
import Step3BusinessDetailsComplete from "@/routes/Step3_BusinessDetails_Complete";
import Step4ApplicantInfoComplete from "@/routes/Step4_ApplicantInfo_Complete";

import Step5DocumentUpload from "@/routes/Step5_DocumentUpload";
import Step6SignNowIntegration from "@/routes/Step6_SignNowIntegration";
import Step7Finalization from "@/routes/Step7_Finalization";

// Core Pages (Authentication removed)
import LandingPage from "@/pages/LandingPage";
import SimpleDashboard from "@/pages/SimpleDashboard";
import NotFound from "@/pages/NotFound";
import ApplicationSuccess from "@/pages/ApplicationSuccess";
import SignComplete from "@/pages/SignComplete";
import UploadDocuments from "@/pages/UploadDocuments";
import LateUpload from "@/routes/LateUpload";
import UploadComplete from "@/routes/UploadComplete";
import { PrivacyPolicy } from "@/pages/PrivacyPolicy";
import { TermsOfService } from "@/pages/TermsOfService";
import { CookieConsentTest } from "@/pages/CookieConsentTest";

// BackendDiagnosticPage removed with legacy auth cleanup
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
import Step5IntersectionTest from "@/test/Step5IntersectionTest";
import TestingFlowValidation from "@/pages/TestingFlowValidation";
import UnifiedDocumentTest from "@/pages/UnifiedDocumentTest";
import LenderCategoriesTest from "@/pages/LenderCategoriesTest";
import DocumentRequirementsTest from "@/pages/DocumentRequirementsTest";
import LenderProductMatcher from "@/pages/LenderProductMatcher";
import StrictValidationTest from "@/pages/StrictValidationTest";
import DataIngestionInterface from "@/pages/DataIngestionInterface";
import TypedApiDemo from "@/pages/TypedApiDemo";
import CanadianProductTest from "@/pages/CanadianProductTest";
import CanadianFilteringTest from "@/pages/CanadianFilteringTest";
import ApiDiagnostic from "@/pages/ApiDiagnostic";
import SyncedProductsTest from "@/pages/SyncedProductsTest";
import WorkflowTest from "@/pages/WorkflowTest";
import LenderProductsCatalog from "@/pages/LenderProductsCatalog";
import BankingDocumentTest from "@/pages/BankingDocumentTest";
import ApplicationIdFlowTest from "@/pages/ApplicationIdFlowTest";
import CriticalFixesValidation from "@/pages/CriticalFixesValidation";
import ComprehensiveE2ETest from "@/pages/ComprehensiveE2ETest";
import IndexedDBTest from "@/pages/IndexedDBTest";
import ReliableSyncTest from "@/pages/ReliableSyncTest";
import LenderDiagnostics from "@/pages/LenderDiagnostics";
import SyncDiagnostics from "@/pages/SyncDiagnostics";
import LenderDiagnosticsFinalized from "@/pages/LenderDiagnosticsFinalized";
import SignNowWorkflowTestNew from "@/pages/SignNowWorkflowTest";
import CanadianWorkingCapitalTest from "@/pages/CanadianWorkingCapitalTest";
import DebugCanadianEquipmentAPI from "@/pages/DebugCanadianEquipmentAPI";
import ListLenderCategories from "@/pages/ListLenderCategories";
import EquipmentFinancingFixTest from "@/pages/EquipmentFinancingFixTest";
import Step4Step6Test from "@/pages/Step4Step6Test";


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
      {/* Route removed with legacy auth cleanup */}
      <Route path="/lender-test" component={LenderTest} />
      <Route path="/lenders-by-category" component={LendersByCategory} />
      <Route path="/lenders-by-country" component={LenderProductsByCountry} />
      <Route path="/staff-api-test" component={StaffApiTest} />
      <Route path="/cors-test" component={CorsTest} />
      <Route path="/api-test" component={ApiTest} />
      <Route path="/api-diagnostic" component={ApiDiagnostic} />
      <Route path="/synced-products-test" component={SyncedProductsTest} />
      <Route path="/sync-monitor" component={SyncMonitor} />
      <Route path="/sync-diagnostics" component={SyncDiagnostics} />
      <Route path="/diagnostics/lenders" component={LenderDiagnosticsFinalized} />
      <Route path="/complete-workflow-test" component={CompleteWorkflowTest} />
      <Route path="/stage-monitor-test" component={StageMonitorTest} />
      <Route path="/signnow-workflow-test" component={SignNowWorkflowTest} />
      <Route path="/step5-test" component={Step5Test} />
      <Route path="/step5-intersection-test" component={Step5IntersectionTest} />
      <Route path="/steps34-test" component={Steps34Test} />
      <Route path="/testing-flow-validation" component={TestingFlowValidation} />
      <Route path="/unified-document-test" component={UnifiedDocumentTest} />
      <Route path="/lender-categories" component={LenderCategoriesTest} />
      <Route path="/document-requirements-test" component={DocumentRequirementsTest} />
      <Route path="/lender-product-matcher" component={LenderProductMatcher} />
      <Route path="/strict-validation-test" component={StrictValidationTest} />
      <Route path="/data-ingestion" component={DataIngestionInterface} />
      <Route path="/typed-api-demo" component={TypedApiDemo} />
      <Route path="/canadian-product-test" component={CanadianProductTest} />
      <Route path="/canadian-filtering-test" component={CanadianFilteringTest} />
      <Route path="/catalog" component={LenderProductsCatalog} />
      <Route path="/banking-document-test" component={BankingDocumentTest} />
      <Route path="/comprehensive-e2e-test" component={ComprehensiveE2ETest} />
      <Route path="/indexeddb-test" component={IndexedDBTest} />
      <Route path="/reliable-sync-test" component={ReliableSyncTest} />
      <Route path="/signnow-workflow-test-new" component={SignNowWorkflowTestNew} />
      <Route path="/canadian-working-capital-test" component={CanadianWorkingCapitalTest} />
      <Route path="/debug-canadian-equipment-api" component={DebugCanadianEquipmentAPI} />
      <Route path="/list-lender-categories" component={ListLenderCategories} />
      <Route path="/equipment-financing-fix-test" component={EquipmentFinancingFixTest} />
      <Route path="/step4-step6-test" component={Step4Step6Test} />

      {/* Primary Application Flow - V1 Routes (Source of Truth) */}
      <Route path="/step1-financial-profile" component={Step1FinancialProfile} />
      <Route path="/apply/step-1" component={Step1FinancialProfile} />
      <Route path="/step2-recommendations" component={Step2Recommendations} />
      <Route path="/apply/step-2" component={Step2Recommendations} />
      <Route path="/step3-business-details" component={Step3BusinessDetailsComplete} />
      <Route path="/apply/step-3" component={Step3BusinessDetailsComplete} />
      <Route path="/step4-applicant-details" component={Step4ApplicantInfoComplete} />
      <Route path="/apply/step-4" component={Step4ApplicantInfoComplete} />
      <Route path="/step5-document-upload" component={Step5DocumentUpload} />
      <Route path="/apply/step-5" component={Step5DocumentUpload} />
      <Route path="/step6-signature" component={Step6SignNowIntegration} />
      <Route path="/apply/step-6" component={Step6SignNowIntegration} />
      <Route path="/step7-submit" component={Step7Finalization} />
      <Route path="/apply/step-7" component={Step7Finalization} />
      
      {/* Dashboard */}
      <Route path="/dashboard" component={SimpleDashboard} />
      
      {/* Document Management */}
      <Route path="/sign-complete" component={SignComplete} />
      <Route path="/upload-documents/:applicationId?" component={UploadDocuments} />
      <Route path="/upload-documents/:id" component={LateUpload} />
      <Route path="/upload-complete" component={UploadComplete} />
      
      {/* Application Entry Points */}
      <Route path="/simple-application" component={SimpleApplication} />
      <Route path="/application" component={SideBySideApplication} />
      <Route path="/side-by-side-application" component={SideBySideApplication} />
      
      {/* Workflow Testing */}
      <Route path="/workflow-test" component={WorkflowTest} />
      <Route path="/application-id-flow-test" component={ApplicationIdFlowTest} />
      <Route path="/critical-fixes-validation" component={CriticalFixesValidation} />
      
      {/* Diagnostic Pages */}
      <Route path="/diagnostics/lenders" component={LenderDiagnostics} />
      
      {/* Legal Pages */}
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/cookie-consent-test" component={CookieConsentTest} />
      
      {/* Default Route - Landing Page */}
      <Route path="/" component={LandingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}