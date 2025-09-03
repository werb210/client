import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { FormDataProvider } from "@/context/FormDataContext";
import { ApplicationProvider } from "@/context/ApplicationContext";
import { ComprehensiveFormProvider } from "@/context/ComprehensiveFormContext";
import { CookieManager } from "@/components/CookieManager";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { DebugStorage } from "@/components/DebugStorage";

// Create query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * V2 Design System - Application Shell
 * 
 * Provides all necessary providers and global configuration for Boreal Financial
 * applications. This is the single source of truth for app-wide state management.
 */
export function AppShell({ children }: AppShellProps) {
  // Remove async call from sync component - handled by consuming components
return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <FormDataProvider>
          <ApplicationProvider>
            {/* Testing both providers together */}
            <ComprehensiveFormProvider>
              {/* DocumentWarningBanner temporarily disabled due to undefined context property access */}
              {children}
              <Toaster />
              <CookieManager />
              <DebugStorage />
            </ComprehensiveFormProvider>
          </ApplicationProvider>
        </FormDataProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}