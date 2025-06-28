import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FormDataProvider } from "@/context/FormDataContext";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import ApplicationForm from "@/pages/ApplicationForm";
import TwoFactorAuth from "@/pages/TwoFactorAuth";
import Registration from "@/pages/Registration";
import { TestingChecklist } from "@/components/TestingChecklist";
import Step1FinancialProfile from "@/routes/Step1_FinancialProfile";
import Step2Recommendations from "@/routes/Step2_Recommendations";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading ? (
        <Route path="/" component={() => <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-pulse">Loading...</div></div>} />
      ) : !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/application" component={ApplicationForm} />
          <Route path="/testing" component={TestingChecklist} />
          <Route path="/step1-financial-profile" component={Step1FinancialProfile} />
          <Route path="/step2-recommendations" component={Step2Recommendations} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FormDataProvider>
          <Toaster />
          <Router />
        </FormDataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
