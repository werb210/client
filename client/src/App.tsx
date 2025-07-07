import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { FormDataProvider } from "@/context/FormDataContext";
import { ApplicationProvider } from "@/context/ApplicationContext";
import { MainLayout } from "@/v2-design-system/MainLayout";

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
        <ApplicationProvider>
          <div className="min-h-screen bg-background">
            <MainLayout />
            <Toaster />
          </div>
        </ApplicationProvider>
      </FormDataProvider>
    </QueryClientProvider>
  );
}

export default App;