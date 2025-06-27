import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import ApplicationForm from "@/pages/ApplicationForm";
import TwoFactorAuth from "@/pages/TwoFactorAuth";
import Registration from "@/pages/Registration";

function Router() {
  const { isAuthenticated, isLoading, needsRegistration, needs2FA, is2FAComplete } = useAuth();

  return (
    <Switch>
      {isLoading ? (
        <Route path="/" component={() => <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-pulse">Loading...</div></div>} />
      ) : !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : needsRegistration ? (
        <>
          <Route path="/register" component={Registration} />
          <Route component={() => { window.location.href = '/register'; return null; }} />
        </>
      ) : needs2FA && !is2FAComplete ? (
        <>
          <Route path="/2fa" component={TwoFactorAuth} />
          <Route component={() => { window.location.href = '/2fa'; return null; }} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/application" component={ApplicationForm} />
          <Route path="/register" component={Registration} />
          <Route path="/2fa" component={TwoFactorAuth} />
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
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
