import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "../components/ui/toaster";
import { AuthProvider } from "../context/AuthContext";
import { FormDataProvider } from "../context/FormDataContext";
import { ApplicationProvider } from "../context/ApplicationContext";
import { ComprehensiveFormProvider } from "../context/ComprehensiveFormContext";

import MainLayout from "./MainLayout";
import ProfessionalLandingPage from "./ProfessionalLandingPage";
import NewPortalPage from "./NewPortalPage";
import Login from "./Login";
import Register from "./Register";

// Import existing V1 components to modernize with V2 styling
import Dashboard from "../pages/Dashboard";
import FaqPage from "../pages/FaqPage";
import TroubleshootingPage from "../pages/TroubleshootingPage";
import ProductAdminPage from "../pages/ProductAdminPage";
import NotFound from "../pages/NotFound";
import { ComprehensiveApplication } from "../pages/ComprehensiveApplication";
import { DocumentValidationDemo } from "../pages/DocumentValidationDemo";

// Import existing V1 application steps to modernize with V2 styling
import Step1FinancialProfile from "../routes/Step1_FinancialProfile";
import Step2Recommendations from "../routes/Step2_Recommendations";
import Step3BusinessDetails from "../routes/Step3_BusinessDetails";
import Step4FinancialInfo from "../routes/Step4_FinancialInfo";
import Step5DocumentUpload from "../routes/Step5_DocumentUpload";
import Step6Signature from "../routes/Step6_Signature";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FormDataProvider>
          <ApplicationProvider>
            <ComprehensiveFormProvider>
              <BrowserRouter>
                <Routes>
                  <Route element={<MainLayout />}>
                    {/* public pages -------------------------------------------------- */}
                    <Route index element={<ProfessionalLandingPage />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="faq" element={<FaqPage />} />
                    <Route path="troubleshooting" element={<TroubleshootingPage />} />

                    {/* authenticated portal & application flow ---------------------- */}
                    <Route path="portal" element={<NewPortalPage />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    
                    {/* V1 Application Steps - with V2 modernization */}
                    <Route path="application" element={<Step1FinancialProfile />} />
                    <Route path="step1-financial-profile" element={<Step1FinancialProfile />} />
                    <Route path="step2-recommendations" element={<Step2Recommendations />} />
                    <Route path="step3-business-details" element={<Step3BusinessDetails />} />
                    <Route path="step4-financial-info" element={<Step4FinancialInfo />} />
                    <Route path="step5-document-upload" element={<Step5DocumentUpload />} />
                    <Route path="step6-signature" element={<Step6Signature />} />
                    
                    {/* Additional Application Types */}
                    <Route path="comprehensive-application" element={<ComprehensiveApplication />} />
                    <Route path="document-validation" element={<DocumentValidationDemo />} />
                    
                    {/* Administrative Pages */}
                    <Route path="product-admin" element={<ProductAdminPage />} />
                    
                    {/* 404 Not Found */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
                <Toaster />
              </BrowserRouter>
            </ComprehensiveFormProvider>
          </ApplicationProvider>
        </FormDataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}