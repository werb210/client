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
import { PWADiagnostics } from "@/pages/PWADiagnostics";
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
import LenderTest from "@/pages/LenderTest";
import LendersByCategory from "@/pages/LendersByCategory";
import StaffApiTest from "@/pages/StaffApiTest";
import CorsTest from "@/pages/CorsTest";
import ApiTest from "@/pages/ApiTest";
import SyncMonitor from "@/pages/SyncMonitor";
import LenderProductsByCountry from "@/routes/LenderProductsByCountry";
import CompleteWorkflowTest from "@/test/CompleteWorkflowTest";
import StageMonitorTest from "@/test/StageMonitorTest";

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
import ComprehensiveE2ETestPage from "@/pages/ComprehensiveE2ETestPage";
import IndexedDBTest from "@/pages/IndexedDBTest";
import ReliableSyncTest from "@/pages/ReliableSyncTest";
import LenderDiagnostics from "@/pages/LenderDiagnostics";
import SyncDiagnostics from "@/pages/SyncDiagnostics";
import LenderDiagnosticsFinalized from "@/pages/LenderDiagnosticsFinalized";

import CanadianWorkingCapitalTest from "@/pages/CanadianWorkingCapitalTest";
import PWATestPage from "@/pages/PWATestPage";
import ProductDataInspector from "@/pages/ProductDataInspector";
import PWADiagnosticsPage from "@/pages/PWADiagnosticsPage";
import SimplePWADiagnostics from "@/pages/SimplePWADiagnostics";
import DebugCanadianEquipmentAPI from "@/pages/DebugCanadianEquipmentAPI";
import ApiConnectivityTest from "@/pages/ApiConnectivityTest";
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
import EnvTest from "@/pages/EnvTest";

import Step2ProductsAvailabilityTest from "@/pages/Step2ProductsAvailabilityTest";
import LenderDataTest from "@/pages/LenderDataTest";

import ClientVerificationDiagnostic from "@/pages/ClientVerificationDiagnostic";
import { FetchWindowTest } from "@/pages/FetchWindowTest";
import FetchWindowDebugRoute from "@/pages/FetchWindowDebugRoute";
import DocumentNormalizationTest from "@/pages/DocumentNormalizationTest";
import DevDocumentMapping from "@/pages/DevDocumentMapping";
import DevRecommendationDebug from "@/pages/DevRecommendationDebug";
import E2ETestRunner from "@/pages/E2ETestRunner";
import FileTypeValidationTest from "@/test/FileTypeValidationTest";
import Step5CategoryTest from "@/test/Step5CategoryTest";
import DocumentValidationTest from "@/test/DocumentValidationTest";
import { PushNotificationTest } from "@/pages/PushNotificationTest";

// Staff Application Components
import PipelinePage from "@/pages/staff/pipeline/PipelinePage";
import StaffApiConnectivityTest from "@/pages/StaffApiConnectivityTest";
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
      <Route path="/e2e-test" component={ComprehensiveE2ETestPage} />
      <Route path="/indexeddb-test" component={IndexedDBTest} />
      <Route path="/reliable-sync-test" component={ReliableSyncTest} />

      <Route path="/canadian-working-capital-test" component={CanadianWorkingCapitalTest} />
      <Route path="/debug-canadian-equipment-api" component={DebugCanadianEquipmentAPI} />
      <Route path="/list-lender-categories" component={ListLenderCategories} />
      <Route path="/equipment-financing-fix-test" component={EquipmentFinancingFixTest} />
      <Route path="/full-application-test" component={FullApplicationSubmissionTest} />
      <Route path="/auto-submit-test" component={AutoSubmitApplicationTest} />

      <Route path="/backend-request-test" component={BackendRequestTest} />
      <Route path="/validation-test" component={ValidationTestPage} />
      <Route path="/cache-management" component={CacheManagement} />
      <Route path="/uuid-test" component={UUIDTestPage} />
      <Route path="/fetch-window-test" component={FetchWindowTest} />
      <Route path="/fetch-window-debug-route" component={FetchWindowDebugRoute} />
      <Route path="/document-normalization-test" component={DocumentNormalizationTest} />
      
      {/* Developer Tools */}
      <Route path="/dev/document-mapping" component={DevDocumentMapping} />
      <Route path="/dev/recommendation-debug" component={DevRecommendationDebug} />


      <Route path="/fallback-test" component={lazy(() => import('@/pages/FallbackTest').then(m => ({ default: m.FallbackTest })))} />
      <Route path="/application-creation-test" component={lazy(() => import('@/pages/ApplicationCreationTest'))} />
      <Route path="/application-flow-test" component={lazy(() => import('@/pages/ApplicationFlowTest'))} />
      <Route path="/security-test-runner" component={lazy(() => import('../security/SecurityTestRunner'))} />
      <Route path="/client-verification-diagnostic" component={ClientVerificationDiagnostic} />

      {/* Primary Application Flow - V1 Routes (Source of Truth) */}
      <Route path="/step1-financial-profile" component={Step1FinancialProfile} />
      <Route path="/apply/step-1" component={Step1FinancialProfile} />
      <Route path="/step2-recommendations" component={Step2RecommendationsRoute} />
      <Route path="/apply/step-2" component={Step2RecommendationsRoute} />
      <Route path="/step3-business-details" component={Step3BusinessDetailsComplete} />
      <Route path="/apply/step-3" component={Step3BusinessDetailsComplete} />
      <Route path="/step4-applicant-details" component={Step4ApplicantInfoComplete} />
      <Route path="/apply/step-4" component={Step4ApplicantInfoComplete} />
      <Route path="/step5-document-upload" component={() => <Step5DocumentUpload />} />
      <Route path="/apply/step-5" component={() => <Step5DocumentUpload />} />
      <Route path="/step6-typed-signature" component={Step6TypedSignature} />
      <Route path="/apply/step-6" component={Step6TypedSignature} />

      
      {/* Dashboard */}
      <Route path="/dashboard" component={SimpleDashboard} />
      
      {/* Staff Application Routes */}
      <Route path="/staff/pipeline" component={PipelinePage} />
      <Route path="/staff-api-connectivity-test" component={StaffApiConnectivityTest} />
      
      {/* Success Page */}
      <Route path="/application-success" component={ApplicationSuccess} />
      
      {/* Document Management */}
      <Route path="/upload-documents/:applicationId" component={UploadDocuments} />
      <Route path="/upload-documents" component={UploadDocuments} />
      <Route path="/upload-missing/:id" component={UploadMissingDocuments} />
      <Route path="/upload-late/:id" component={LateUpload} />
      <Route path="/upload-complete" component={UploadComplete} />
      
      {/* Application Entry Points */}
      <Route path="/simple-application" component={SimpleApplication} />
      <Route path="/application" component={SideBySideApplication} />
      <Route path="/side-by-side-application" component={SideBySideApplication} />
      
      {/* Workflow Testing */}
      <Route path="/env-test" component={EnvTest} />
      <Route path="/workflow-test-page" component={WorkflowTestPage} />
      <Route path="/document-upload-test" component={DocumentUploadTestPage} />
      <Route path="/step2-products-test" component={Step2ProductsAvailabilityTest} />
      <Route path="/workflow-test" component={WorkflowTest} />
      <Route path="/application-id-flow-test" component={ApplicationIdFlowTest} />
      <Route path="/critical-fixes-validation" component={CriticalFixesValidation} />
      <Route path="/e2e-test-runner" component={E2ETestRunner} />
      <Route path="/file-type-validation-test" component={FileTypeValidationTest} />
      <Route path="/step5-category-test" component={Step5CategoryTest} />
      <Route path="/document-validation-test" component={DocumentValidationTest} />
      <Route path="/product-validation-test" component={ProductValidationTest} />
      <Route path="/train-chatbot" component={TrainChatbot} />
      
      {/* Diagnostic Pages */}
      <Route path="/diagnostics/lenders" component={LenderDiagnostics} />
      <Route path="/api-connectivity-test" component={ApiConnectivityTest} />
      <Route path="/cache-setup" component={InitialCacheSetup} />
      <Route path="/product-data-inspector" component={ProductDataInspector} />
      
      {/* PWA Testing */}
      <Route path="/pwa-test" component={PWATestPage} />
      <Route path="/pwa-diagnostics" component={PWADiagnostics} />
      <Route path="/pwa-diagnostics-simple">
        <SimplePWADiagnostics />
      </Route>
      <Route path="/pwa-diagnostics-full" component={PWADiagnosticsPage} />
      <Route path="/pwa-comprehensive-test" component={lazy(() => import('@/pages/PWAComprehensiveTest'))} />
      <Route path="/push-notification-test" component={PushNotificationTest} />
      
      {/* Comprehensive Audit */}
      <Route path="/client-app-audit" component={ClientAppAudit} />
      
      {/* Chatbot Testing */}
      <Route path="/chatbot-ai-test" component={lazy(() => import('@/pages/ChatbotTestPage'))} />
      <Route path="/chatbot-ai-suite-test" component={lazy(() => import('@/pages/ChatbotAISuiteTest'))} />
      <Route path="/comprehensive-client-test" component={lazy(() => import('@/pages/ComprehensiveClientAppTest'))} />
      
      {/* Legal Pages */}
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/cookie-consent-test" component={CookieConsentTest} />
      
      {/* Support Pages */}
      <Route path="/faq" component={FAQ} />
      <Route path="/troubleshooting" component={Troubleshooting} />
      
      {/* Privacy & Compliance */}
      <Route path="/client/kyc/mock" component={KycMock} />
      <Route path="/client/sign/mock" component={MockSign} />
      <Route path="/privacy-compliance-demo" component={PrivacyComplianceDemo} />
      <Route path="/docpacks-demo" component={DocumentPacksDemo} />
      <Route path="/client/notifications" component={NotificationsClient} />
      <Route path="/notifications-demo" component={NotificationsDemo} />
      <Route path="/client/search" component={MySearch} />
      <Route path="/search-demo" component={SearchDemo} />
      <Route path="/analytics-demo" component={AnalyticsDemo} />
      <Route path="/client/kyc/start" component={KycStart} />
      <Route path="/kyc-demo" component={KycDemo} />
      <Route path="/lender/access" component={LenderPortal} />
      <Route path="/lender-demo" component={LenderDemo} />
      <Route path="/lender-product-sync-demo" component={LenderProductSyncDemo} />
      {/* <Route path="/chatbot-test" component={lazy(() => import('@/pages/ChatBotTest'))} /> */}
      {/* <Route path="/advanced-chatbot-test" component={() => <ChatBotTest />} /> */}
      {/* <Route path="/chatbot-dashboard" component={() => <ChatBotDashboard />} /> */}
      <Route path="/train-chatbot" component={lazy(() => import('@/routes/TrainChatbot'))} />
      <Route path="/debug/train" component={lazy(() => import('@/routes/TrainChatbot'))} />
      
      {/* Default Route - Landing Page */}
      <Route path="/" component={LandingPage} />
      <Route component={NotFound} />
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