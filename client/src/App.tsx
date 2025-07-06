import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { FormDataProvider } from "@/context/FormDataContext";

// Pages
import LandingPage from "@/pages/LandingPage";
import SideBySideApplication from "@/pages/SideBySideApplication";
import ApplicationSuccess from "@/pages/ApplicationSuccess";
import NotFound from "@/pages/NotFound";

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FormDataProvider>
        <div className="min-h-screen bg-background">
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/apply/step-1" component={SideBySideApplication} />
            <Route path="/application-success" component={ApplicationSuccess} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </div>
      </FormDataProvider>
    </QueryClientProvider>
  );
}

export default App;