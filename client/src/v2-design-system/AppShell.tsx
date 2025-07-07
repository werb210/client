import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { FormDataProvider } from "@/context/FormDataContext";
import { ApplicationProvider } from "@/context/ApplicationContext";
import { ComprehensiveFormProvider } from "@/context/ComprehensiveFormContext";
import { DocumentWarningBanner } from "@/components/DocumentWarningBanner";

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
  return (
    <QueryClientProvider client={queryClient}>
      <FormDataProvider>
        <ApplicationProvider>
          <ComprehensiveFormProvider>
            <DocumentWarningBanner />
            {children}
            <Toaster />
          </ComprehensiveFormProvider>
        </ApplicationProvider>
      </FormDataProvider>
    </QueryClientProvider>
  );
}