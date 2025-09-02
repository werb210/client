import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { useChatBot } from "@/hooks/useChatBot";
import { PwaPrompt } from "@/components/PwaPrompt";

// Core Application Routes - Essential Components Only
import Step1FinancialProfile from "@/routes/Step1_FinancialProfile_Complete";
import Step3BusinessDetailsComplete from "@/routes/Step3_BusinessDetails_Complete";
import LandingPage from "@/pages/LandingPage";
import SimpleDashboard from "@/pages/SimpleDashboard";
import NotFound from "@/pages/NotFound";

// Lazy load heavy components for better performance
const Step2ChooseCategory = lazy(() => import("@/routes/apply/step-2"));
const Step4ApplicantInfoComplete = lazy(() => import("@/routes/Step4_ApplicantInfo_Complete"));
const Step5DocumentUpload = lazy(() => import("@/routes/apply/step-5"));
const Step6TypedSignature = lazy(() => import("@/routes/Step6_TypedSignature"));
const ChatBot = lazy(() => import("@/components/ChatBot").then(module => ({ default: module.ChatBot })));
const CompleteApplicationTest = lazy(() => import("@/test/CompleteApplicationTest"));
const EndToEndFlowTest = lazy(() => import("@/test/EndToEndFlowTest"));


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
        {/* Primary Application Flow */}
        <Route path="/apply/step-1" component={Step1FinancialProfile} />
        <Route path="/apply/step-2" component={() => <Suspense fallback={<div>Loading...</div>}><Step2ChooseCategory /></Suspense>} />
        <Route path="/apply/step-3" component={Step3BusinessDetailsComplete} />
        <Route path="/apply/step-4" component={() => <Suspense fallback={<div>Loading...</div>}><Step4ApplicantInfoComplete /></Suspense>} />
        <Route path="/apply/step-5" component={() => <Suspense fallback={<div>Loading...</div>}><Step5DocumentUpload /></Suspense>} />
        <Route path="/apply/step-6" component={() => <Suspense fallback={<div>Loading...</div>}><Step6TypedSignature /></Suspense>} />
        
        {/* Dashboard */}
        <Route path="/dashboard" component={SimpleDashboard} />
        
        {/* Testing Routes */}
        <Route path="/test/complete-application" component={() => <Suspense fallback={<div>Loading test...</div>}><CompleteApplicationTest /></Suspense>} />
        <Route path="/test/end-to-end" component={() => <Suspense fallback={<div>Loading test...</div>}><EndToEndFlowTest /></Suspense>} />
        
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
// Local-first products integration handled by individual components
