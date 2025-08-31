import { fetchProducts } from "../../api/products";
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
// import MockSign from "@/pages/MockSign";
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
// import CompleteWorkflowTest from "@/test/CompleteWorkflowTest";
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
// import TypedApiDemo from "@/pages/TypedApiDemo";
import CanadianProductTest from "@/pages/CanadianProductTest";
import CanadianFilteringTest from "@/pages/CanadianFilteringTest";
// import ApiDiagnostic from "@/pages/ApiDiagnostic"; // Removed
// import SyncedProductsTest from "@/pages/SyncedProductsTest";
// import WorkflowTest from "@/pages/WorkflowTest";
import LenderProductsCatalog from "@/pages/LenderProductsCatalog";
// import BankingDocumentTest from "@/pages/BankingDocumentTest";
// import ApplicationIdFlowTest from "@/pages/ApplicationIdFlowTest";
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
import CatalogDumpPage from "@/pages/debug/CatalogDump";
// import PWATestPage from "@/pages/PWATestPage";
import ProductDataInspector from "@/pages/ProductDataInspector";
// import PWADiagnosticsPage from "@/pages/PWADiagnosticsPage"; // Removed
// import SimplePWADiagnostics from "@/pages/SimplePWADiagnostics"; // Removed
// import DebugCanadianEquipmentAPI from "@/pages/DebugCanadianEquipmentAPI"; // Removed
// import ApiConnectivityTest from "@/pages/ApiConnectivityTest";
import ListLenderCategories from "@/pages/ListLenderCategories";
import EquipmentFinancingFixTest from "@/pages/EquipmentFinancingFixTest";
import FullApplicationSubmissionTest from "@/pages/FullApplicationSubmissionTest";
// Debug page removed
import LenderProductSyncDemo from "@/pages/LenderProductSyncDemo";

// import BackendRequestTest from "@/pages/BackendRequestTest";
import WorkflowTestPage from "@/routes/WorkflowTestPage";
import DocumentUploadTestPage from "@/pages/DocumentUploadTestPage";
// import ValidationTestPage from "@/pages/ValidationTestPage";
import InitialCacheSetup from "@/pages/InitialCacheSetup";
import CacheManagement from "@/pages/CacheManagement";
// import UUIDTestPage from "@/pages/UUIDTestPage";
// import EnvTest from "@/pages/EnvTest";

import Step2ProductsAvailabilityTest from "@/pages/Step2ProductsAvailabilityTest";
// import LenderDataTest from "@/pages/LenderDataTest";

import ClientVerificationDiagnostic from "@/pages/ClientVerificationDiagnostic";
import { FetchWindowTest } from "@/pages/FetchWindowTest";
// Debug page removed
// import DocumentNormalizationTest from "@/pages/DocumentNormalizationTest";
// Development pages temporarily removed
// import DevDocumentMapping from "@/pages/DevDocumentMapping";
// import DevRecommendationDebug from "@/pages/DevRecommendationDebug";
// import E2ETestRunner from "@/pages/E2ETestRunner";
import FileTypeValidationTest from "@/test/FileTypeValidationTest";
import Step5CategoryTest from "@/test/Step5CategoryTest";
import DocumentValidationTest from "@/test/DocumentValidationTest";
import { PushNotificationTest } from "@/pages/PushNotificationTest";
import CatalogDump from "@/pages/debug/CatalogDump";

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
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */

/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */

/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */

/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
      
      {/* Developer Tools */}
/* commented route */
/* commented route */


/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */

      {/* Primary Application Flow - V1 Routes (Source of Truth) */}
      <Route path="/apply/step-1" component={Step1FinancialProfile} />
      <Route path="/apply/step-2" component={Step2RecommendationsRoute} />
      <Route path="/apply/step-3" component={Step3BusinessDetailsComplete} />
      {/* Testing all steps together */}
      <Route path="/apply/step-4" component={() => <Suspense fallback={<div>Loading...</div>}><Step4ApplicantInfoComplete /></Suspense>} />
      <Route path="/apply/step-5" component={() => <Suspense fallback={<div>Loading...</div>}><Step5DocumentUpload /></Suspense>} />
      <Route path="/apply/step-6" component={() => <Suspense fallback={<div>Loading...</div>}><Step6TypedSignature /></Suspense>} />
      
      {/* Dashboard */}
      <Route path="/dashboard" component={SimpleDashboard} />
      
      {/* Staff Application Routes */}
/* commented route */
/* commented route */
      
      {/* Success Page */}
/* commented route */
      
      {/* Document Management */}
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
      
      {/* Application Entry Points */}
/* commented route */
/* commented route */
/* commented route */
      
      {/* Workflow Testing */}
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
      
      {/* Diagnostic Pages */}
/* commented route */
/* commented route */
/* commented route */
/* commented route */
      
      {/* PWA Testing */}
      {/* <Route path="/pwa-test" component={SimplePWADiagnostics} /> */}
/* commented route */
/* commented route */
/* commented route */
      
      {/* Comprehensive Audit */}
/* commented route */
      
      {/* Chatbot Testing */}
/* commented route */
/* commented route */
/* commented route */
      
      {/* Legal Pages */}
/* commented route */
/* commented route */
/* commented route */
      
      {/* Support Pages */}
/* commented route */
/* commented route */
      
      {/* Privacy & Compliance */}
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
/* commented route */
      
      {/* Debug Pages */}
/* commented route */
/* commented route */
      
      {/* Default Route - Landing Page */}
      <Route path="/" component={LandingPage} />
      <Route component={NotFound} />
      </Switch>
      </Suspense>
      
      {/* PWA Installation Prompt */}
      <PwaPrompt />
      
      {/* Global ChatBot - Available on all pages - Centered Bottom */}
      <div className="finbot-wrapper">
        <Suspense fallback={<div className="fixed bottom-4 right-4 h-12 w-12 animate-pulse bg-teal-100 rounded-full"></div>}>
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