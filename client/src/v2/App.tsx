import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "../components/ui/toaster";
import { AuthProvider } from "../context/AuthContext";
import { FormDataProvider } from "../context/FormDataContext";
import { ApplicationProvider } from "../context/ApplicationContext";
import { ComprehensiveFormProvider } from "../context/ComprehensiveFormContext";

import { MainLayout } from "./MainLayout";
import { ProfessionalLandingPage } from "./ProfessionalLandingPage";
import { NewPortalPage } from "./NewPortalPage";
import Login from "./Login";
import Register from "./Register";

// Step routes - these will be created or migrated later
// import Step1 from "./Step1_FinancialProfile";
// import Step2 from "./Step2_Recommendations";
// import Step3 from "./Step3_BusinessDetails";
// import Step4 from "./Step4_ApplicantInfo";
// import Step5 from "./Step5_DocumentUpload";
// import Step6 from "./Step6_Signature";
// import Step7 from "./Step7_FinalSubmission";

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

                    {/* authenticated portal & application flow ---------------------- */}
                    <Route path="portal" element={<NewPortalPage />} />
                    {/* <Route path="application/1" element={<Step1 />} />
                    <Route path="application/2" element={<Step2 />} />
                    <Route path="application/3" element={<Step3 />} />
                    <Route path="application/4" element={<Step4 />} />
                    <Route path="application/5" element={<Step5 />} />
                    <Route path="application/6" element={<Step6 />} />
                    <Route path="application/7" element={<Step7 />} /> */}
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