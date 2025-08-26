import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
// import { ChatBotTest } from "@/components/ChatBotTest";
// import { ChatBotDashboard } from "@/components/ChatBotDashboard";

import { useChatBot } from "@/hooks/useChatBot";
import { PwaPrompt } from "@/components/PwaPrompt";

// V1 Route Components (Source of Truth)
import Step1FinancialProfile from "@/routes/Step1_FinancialProfile_Complete";
import Step2RecommendationsRoute from "@/routes/Step2_Recommendations";
// NEW: Separated Step 3 & 4 Route Components (July 3, 2025)
import Step3BusinessDetailsComplete from "@/routes/Step3_BusinessDetails_Complete";

// 🚀 PERFORMANCE OPTIMIZATION: Lazy load heavy components (1000+ lines)
const Step4ApplicantInfoComplete = lazy(() => import("@/routes/Step4_ApplicantInfo_Complete"));
const Step5DocumentUpload = lazy(() => import("@/routes/Step5_DocumentUpload"));
const Step6TypedSignature = lazy(() => import("@/routes/Step6_TypedSignature"));
const ChatBot = lazy(() => import("@/components/ChatBot").then(module => ({ default: module.ChatBot })));


// Core Pages (Authentication removed)
import LandingPage from "@/pages/LandingPage";
import SimpleDashboard from "@/pages/SimpleDashboard";
import NotFound from "@/pages/NotFound";
import ApplicationSuccess from "@/pages/ApplicationSuccess";

import UploadDocuments from "@/pages/UploadDocuments";
import UploadMissingDocuments from "@/pages/UploadMissingDocuments";
import LateUpload from "@/routes/LateUpload";
import UploadComplete from "@/routes/UploadComplete";
import { PrivacyPolicy } from "@/pages/PrivacyPolicy";
import { TermsOfService } from "@/pages/TermsOfService";
import { CookieConsentTest } from "@/pages/CookieConsentTest";
// import { PWADiagnostics } from "@/pages/PWADiagnostics"; // Removed
import { ClientAppAudit } from "@/pages/ClientAppAudit";
import FAQ from "@/pages/FAQ";
import Troubleshooting from "@/pages/Troubleshooting";
import KycMock from "@/pages/KycMock";
import PrivacyComplianceDemo from "@/pages/PrivacyComplianceDemo";
import MockSign from "@/pages/MockSign";
import DocumentPacksDemo from "@/pages/DocumentPacksDemo";
import NotificationsClient from "@/pages/NotificationsClient";
import NotificationsDemo from "@/pages/NotificationsDemo";
import MySearch from "@/pages/MySearch";
import SearchDemo from "@/pages/SearchDemo";
import AnalyticsDemo from "@/pages/AnalyticsDemo";
import KycStart from "@/pages/KycStart";
import KycDemo from "@/pages/KycDemo";
import LenderPortal from "@/pages/LenderPortal";
import LenderDemo from "@/pages/LenderDemo";

// BackendDiagnosticPage removed with legacy auth cleanup
import SideBySideApplication from "@/pages/SideBySideApplication";
import SimpleApplication from "@/pages/SimpleApplication";
// import LenderTest from "@/pages/LenderTest"; // Removed
import LendersByCategory from "@/pages/LendersByCategory";
import StaffApiTest from "@/pages/StaffApiTest";
// import CorsTest from "@/pages/CorsTest"; // Removed
// import ApiTest from "@/pages/ApiTest"; // Removed
import SyncMonitor from "@/pages/SyncMonitor";
import LenderProductsByCountry from "@/routes/LenderProductsByCountry";
import CompleteWorkflowTest from "@/test/CompleteWorkflowTest";
import StageMonitorTest from "@/test/StageMonitorTest";

import Step5Test from "@/pages/Step5Test";
import Steps34Test from "@/pages/Steps34Test";
import Step5IntersectionTest from "@/test/Step5IntersectionTest";
import TestingFlowValidation from "@/pages/TestingFlowValidation";
import UnifiedDocumentTest from "@/pages/UnifiedDocumentTest";
// import LenderCategoriesTest from "@/pages/LenderCategoriesTest"; // Removed
// import DocumentRequirementsTest from "@/pages/DocumentRequirementsTest";
import LenderProductMatcher from "@/pages/LenderProductMatcher";
import StrictValidationTest from "@/pages/StrictValidationTest";
import DataIngestionInterface from "@/pages/DataIngestionInterface";
import TypedApiDemo from "@/pages/TypedApiDemo";
import CanadianProductTest from "@/pages/CanadianProductTest";
import CanadianFilteringTest from "@/pages/CanadianFilteringTest";
// import ApiDiagnostic from "@/pages/ApiDiagnostic"; // Removed
// import SyncedProductsTest from "@/pages/SyncedProductsTest";
import WorkflowTest from "@/pages/WorkflowTest";
import LenderProductsCatalog from "@/pages/LenderProductsCatalog";
// import BankingDocumentTest from "@/pages/BankingDocumentTest";
import ApplicationIdFlowTest from "@/pages/ApplicationIdFlowTest";
import CriticalFixesValidation from "@/pages/CriticalFixesValidation";
// import ComprehensiveE2ETest from "@/pages/ComprehensiveE2ETest";
// import ComprehensiveE2ETestPage from "@/pages/ComprehensiveE2ETestPage";
// import IndexedDBTest from "@/pages/IndexedDBTest";
// import ReliableSyncTest from "@/pages/ReliableSyncTest";
import LenderDiagnostics from "@/pages/LenderDiagnostics";
// import SyncDiagnostics from "@/pages/SyncDiagnostics";
// import LenderDiagnosticsFinalized from "@/pages/LenderDiagnosticsFinalized";

import CanadianWorkingCapitalTest from "@/pages/CanadianWorkingCapitalTest";
import CatalogFieldsPage from "@/pages/debug/CatalogFields";
// import PWATestPage from "@/pages/PWATestPage";
import ProductDataInspector from "@/pages/ProductDataInspector";
// import PWADiagnosticsPage from "@/pages/PWADiagnosticsPage"; // Removed
// import SimplePWADiagnostics from "@/pages/SimplePWADiagnostics"; // Removed
// import DebugCanadianEquipmentAPI from "@/pages/DebugCanadianEquipmentAPI"; // Removed
// import ApiConnectivityTest from "@/pages/ApiConnectivityTest";
import ListLenderCategories from "@/pages/ListLenderCategories";
import EquipmentFinancingFixTest from "@/pages/EquipmentFinancingFixTest";
import FullApplicationSubmissionTest from "@/pages/FullApplicationSubmissionTest";
import AutoSubmitApplicationTest from "@/pages/AutoSubmitApplicationTest";
import LenderProductSyncDemo from "@/pages/LenderProductSyncDemo";

import BackendRequestTest from "@/pages/BackendRequestTest";
import WorkflowTestPage from "@/routes/WorkflowTestPage";
import DocumentUploadTestPage from "@/pages/DocumentUploadTestPage";
import ValidationTestPage from "@/pages/ValidationTestPage";
import InitialCacheSetup from "@/pages/InitialCacheSetup";
import CacheManagement from "@/pages/CacheManagement";
import UUIDTestPage from "@/pages/UUIDTestPage";
// import EnvTest from "@/pages/EnvTest";

import Step2ProductsAvailabilityTest from "@/pages/Step2ProductsAvailabilityTest";
// import LenderDataTest from "@/pages/LenderDataTest";

import ClientVerificationDiagnostic from "@/pages/ClientVerificationDiagnostic";
import { FetchWindowTest } from "@/pages/FetchWindowTest";
import FetchWindowDebugRoute from "@/pages/FetchWindowDebugRoute";
// import DocumentNormalizationTest from "@/pages/DocumentNormalizationTest";
import DevDocumentMapping from "@/pages/DevDocumentMapping";
import DevRecommendationDebug from "@/pages/DevRecommendationDebug";
// import E2ETestRunner from "@/pages/E2ETestRunner";
import FileTypeValidationTest from "@/test/FileTypeValidationTest";
import Step5CategoryTest from "@/test/Step5CategoryTest";
import DocumentValidationTest from "@/test/DocumentValidationTest";
import { PushNotificationTest } from "@/pages/PushNotificationTest";

// Staff Application Components
import PipelinePage from "@/pages/staff/pipeline/PipelinePage";
// import StaffApiConnectivityTest from "@/pages/StaffApiConnectivityTest";
import ProductValidationTest from "@/routes/ProductValidationTest";
import TrainChatbot from "@/routes/TrainChatbot";
import ChatbotAISuiteTest from "@/pages/ChatbotAISuiteTest";


/**
 * V2 Design System - Main Layout Router
 * 
 * This is the official routing structure extracted from V1 SideBySideApplication
 * and optimized for V2. Uses V1 route components as source of truth.
 */
export function MainLayout() {
  const { isOpen, currentStep, applicationData, toggleChat } = useChatBot();
  
  return (
    <>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>}>
      <Switch>
      {/* Diagnostic Routes */}
      {/* Route removed with legacy auth cleanup */}
      {/* <Route path="/lender-test" component={[^}]*} /> */} */}
      <Route path="/lenders-by-category" component={[^}]*} /> */}
      <Route path="/lenders-by-country" component={[^}]*} /> */}
      <Route path="/staff-api-test" component={[^}]*} /> */}
      {/* <Route path="/cors-test" component={[^}]*} /> */} */}
      {/* <Route path="/api-test" component={[^}]*} /> */} */}
      {/* <Route path="/api-diagnostic" component={[^}]*} /> */} */}
      <Route path="/synced-products-test" component={[^}]*} /> */}
      <Route path="/sync-monitor" component={[^}]*} /> */}
      <Route path="/sync-diagnostics" component={[^}]*} /> */}
      <Route path="/diagnostics/lenders" component={[^}]*} /> */}
      <Route path="/complete-workflow-test" component={[^}]*} /> */}
      <Route path="/stage-monitor-test" component={[^}]*} /> */}

      <Route path="/step5-test" component={[^}]*} /> */}
      <Route path="/step5-intersection-test" component={[^}]*} /> */}
      <Route path="/steps34-test" component={[^}]*} /> */}
      <Route path="/testing-flow-validation" component={[^}]*} /> */}
      <Route path="/unified-document-test" component={[^}]*} /> */}
      {/* <Route path="/lender-categories" component={[^}]*} /> */} */}
      {/* <Route path="/document-requirements-test" component={[^}]*} /> */} */}
      <Route path="/lender-product-matcher" component={[^}]*} /> */}
      <Route path="/strict-validation-test" component={[^}]*} /> */}
      <Route path="/data-ingestion" component={[^}]*} /> */}
      <Route path="/typed-api-demo" component={[^}]*} /> */}
      <Route path="/canadian-product-test" component={[^}]*} /> */}
      <Route path="/canadian-filtering-test" component={[^}]*} /> */}
      <Route path="/catalog" component={[^}]*} /> */}
      <Route path="/banking-document-test" component={[^}]*} /> */}
      {/* <Route path="/comprehensive-e2e-test" component={[^}]*} /> */} */}
      {/* <Route path="/e2e-test" component={[^}]*} /> */} */}
      {/* <Route path="/indexeddb-test" component={[^}]*} /> */} */}
      {/* <Route path="/reliable-sync-test" component={[^}]*} /> */} */}

      <Route path="/canadian-working-capital-test" component={[^}]*} /> */}
      {/* <Route path="/debug-canadian-equipment-api" component={[^}]*} /> */} */}
      <Route path="/list-lender-categories" component={[^}]*} /> */}
      <Route path="/equipment-financing-fix-test" component={[^}]*} /> */}
      <Route path="/full-application-test" component={[^}]*} /> */}
      <Route path="/auto-submit-test" component={[^}]*} /> */}

      <Route path="/backend-request-test" component={[^}]*} /> */}
      <Route path="/validation-test" component={[^}]*} /> */}
      <Route path="/cache-management" component={[^}]*} /> */}
      <Route path="/uuid-test" component={[^}]*} /> */}
      <Route path="/fetch-window-test" component={[^}]*} /> */}
      <Route path="/fetch-window-debug-route" component={[^}]*} /> */}
      {/* <Route path="/document-normalization-test" component={[^}]*} /> */}
      
      {/* Developer Tools */}
      <Route path="/dev/document-mapping" component={[^}]*} /> */}
      <Route path="/dev/recommendation-debug" component={[^}]*} /> */}


      <Route path="/fallback-test" component={lazy(() => import('@/pages/FallbackTest').then(m => ({ default: m.FallbackTest })))} />
      <Route path="/application-creation-test" component={[^}]*} /> */}
      <Route path="/application-flow-test" component={[^}]*} /> */}
      <Route path="/security-test-runner" component={[^}]*} /> */}
      <Route path="/client-verification-diagnostic" component={[^}]*} /> */}

      {/* Primary Application Flow - V1 Routes (Source of Truth) */}
      <Route path="/step1-financial-profile" component={[^}]*} /> */}
      <Route path="/apply/step-1" component={[^}]*} /> */}
      <Route path="/step2-recommendations" component={[^}]*} /> */}
      <Route path="/apply/step-2" component={[^}]*} /> */}
      <Route path="/step3-business-details" component={[^}]*} /> */}
      <Route path="/apply/step-3" component={[^}]*} /> */}
      <Route path="/step4-applicant-details" component={[^}]*} /> */}
      <Route path="/apply/step-4" component={[^}]*} /> */}
      <Route path="/step5-document-upload" component={[^}]*} /> */}
      <Route path="/apply/step-5" component={[^}]*} /> */}
      <Route path="/step6-typed-signature" component={[^}]*} /> */}
      <Route path="/apply/step-6" component={[^}]*} /> */}

      
      {/* Dashboard */}
      <Route path="/dashboard" component={[^}]*} /> */}
      
      {/* Staff Application Routes */}
      <Route path="/staff/pipeline" component={[^}]*} /> */}
      {/* <Route path="/staff-api-connectivity-test" component={[^}]*} /> */}
      
      {/* Success Page */}
      <Route path="/application-success" component={[^}]*} /> */}
      
      {/* Document Management */}
      <Route path="/upload-documents/:applicationId" component={[^}]*} /> */}
      <Route path="/upload-documents" component={[^}]*} /> */}
      <Route path="/upload-missing/:id" component={[^}]*} /> */}
      <Route path="/upload-late/:id" component={[^}]*} /> */}
      <Route path="/upload-complete" component={[^}]*} /> */}
      
      {/* Application Entry Points */}
      <Route path="/simple-application" component={[^}]*} /> */}
      <Route path="/application" component={[^}]*} /> */}
      <Route path="/side-by-side-application" component={[^}]*} /> */}
      
      {/* Workflow Testing */}
      {/* <Route path="/env-test" component={[^}]*} /> */}
      <Route path="/workflow-test-page" component={[^}]*} /> */}
      <Route path="/document-upload-test" component={[^}]*} /> */}
      <Route path="/step2-products-test" component={[^}]*} /> */}
      <Route path="/workflow-test" component={[^}]*} /> */}
      <Route path="/application-id-flow-test" component={[^}]*} /> */}
      <Route path="/critical-fixes-validation" component={[^}]*} /> */}
      {/* <Route path="/e2e-test-runner" component={[^}]*} /> */}
      <Route path="/file-type-validation-test" component={[^}]*} /> */}
      <Route path="/step5-category-test" component={[^}]*} /> */}
      <Route path="/document-validation-test" component={[^}]*} /> */}
      <Route path="/product-validation-test" component={[^}]*} /> */}
      <Route path="/train-chatbot" component={[^}]*} /> */}
      
      {/* Diagnostic Pages */}
      <Route path="/diagnostics/lenders" component={[^}]*} /> */}
      {/* <Route path="/api-connectivity-test" component={[^}]*} /> */}
      <Route path="/cache-setup" component={[^}]*} /> */}
      <Route path="/product-data-inspector" component={[^}]*} /> */}
      
      {/* PWA Testing */}
      {/* <Route path="/pwa-test" component={[^}]*} /> */}
      {/* <Route path="/pwa-diagnostics" component={[^}]*} /> */} */}
      {/* <Route path="/pwa-diagnostics-simple">
        <SimplePWADiagnostics />
      </Route> */}
      {/* <Route path="/pwa-diagnostics-full" component={[^}]*} /> */} */}
      <Route path="/pwa-comprehensive-test" component={[^}]*} /> */}
      <Route path="/push-notification-test" component={[^}]*} /> */}
      
      {/* Comprehensive Audit */}
      <Route path="/client-app-audit" component={[^}]*} /> */}
      
      {/* Chatbot Testing */}
      <Route path="/chatbot-ai-test" component={[^}]*} /> */}
      <Route path="/chatbot-ai-suite-test" component={[^}]*} /> */}
      <Route path="/comprehensive-client-test" component={[^}]*} /> */}
      
      {/* Legal Pages */}
      <Route path="/privacy-policy" component={[^}]*} /> */}
      <Route path="/terms-of-service" component={[^}]*} /> */}
      <Route path="/cookie-consent-test" component={[^}]*} /> */}
      
      {/* Support Pages */}
      <Route path="/faq" component={[^}]*} /> */}
      <Route path="/troubleshooting" component={[^}]*} /> */}
      
      {/* Privacy & Compliance */}
      <Route path="/client/kyc/mock" component={[^}]*} /> */}
      <Route path="/client/sign/mock" component={[^}]*} /> */}
      <Route path="/privacy-compliance-demo" component={[^}]*} /> */}
      <Route path="/docpacks-demo" component={[^}]*} /> */}
      <Route path="/client/notifications" component={[^}]*} /> */}
      <Route path="/notifications-demo" component={[^}]*} /> */}
      <Route path="/client/search" component={[^}]*} /> */}
      <Route path="/search-demo" component={[^}]*} /> */}
      <Route path="/analytics-demo" component={[^}]*} /> */}
      <Route path="/client/kyc/start" component={[^}]*} /> */}
      <Route path="/kyc-demo" component={[^}]*} /> */}
      <Route path="/lender/access" component={[^}]*} /> */}
      <Route path="/lender-demo" component={[^}]*} /> */}
      <Route path="/lender-product-sync-demo" component={[^}]*} /> */}
      {/* <Route path="/chatbot-test" component={[^}]*} /> */} */}
      {/* <Route path="/advanced-chatbot-test" component={[^}]*} /> */} */}
      {/* <Route path="/chatbot-dashboard" component={[^}]*} /> */} */}
      <Route path="/train-chatbot" component={[^}]*} /> */}
      <Route path="/debug/train" component={lazy(() => import('@/routes/TrainChatbot'))} />
      
      {/* Debug Pages */}
      <Route path="/debug/catalog-fields" component={CatalogFieldsPage} />
      
      {/* Default Route - Landing Page */}
      <Route path="/" component={[^}]*} /> */}
      <Route component={[^}]*} /> */}
      </Switch>
      </Suspense>
      
      {/* PWA Installation Prompt */}
      <PwaPrompt />
      
      {/* Global ChatBot - Available on all pages - Centered Bottom */}
      <div className="finbot-wrapper">
        <Suspense fallback={<div className="h-16 w-16 animate-pulse bg-teal-100 rounded-full"></div>}>
          <ChatBot 
            isOpen={isOpen}
            onToggle={toggleChat}
            currentStep={currentStep}
            applicationData={applicationData}
          />
        </Suspense>
      </div>
    </>
  );
}