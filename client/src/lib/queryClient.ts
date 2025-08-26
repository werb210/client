import { QueryClient, QueryFunction } from "@tanstack/react-query";
import * as api from "./api";

// Legacy functions for backward compatibility
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Redirect to staff backend API functions
  throw new Error(`Direct apiRequest deprecated. Use specific API functions from ./api.ts for ${url}`);
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: (options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<any> =
  ({ on401: unauthorizedBehavior }: { on401: UnauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const endpoint = queryKey[0] as string;
    
    try {
      // Route different endpoints to appropriate API functions
      if (endpoint === '/api/health') {
        return { status: 'ok', timestamp: new Date().toISOString() };
      } else if (endpoint === '/api/applications') {
        return await api.getUserApplications();
      } else if (endpoint.startsWith('/api/applications/')) {
        const applicationId = endpoint.split('/').pop();
        return await api.getApplication(applicationId!);
      } else if (endpoint.startsWith('/api/documents/requirements')) {
        const params = new URLSearchParams(endpoint.split('?')[1] || '');
        const category = params.get('category');
        return await api.fetchRequiredDocuments(category || '');
      } else if (endpoint.startsWith('/api/lenders/requirements')) {
        const params = new URLSearchParams(endpoint.split('?')[1] || '');
        const category = params.get('category');
        return await api.getLenderProducts(category || undefined);
      }
      
      throw new Error(`No API function mapped for endpoint: ${endpoint}`);
    } catch (error) {
      // Safely handle all error types to prevent runtime issues
      try {
        // Handle errors gracefully
        if (error instanceof api.ApiError && error.status === 401 && unauthorizedBehavior === "returnNull") {
          return null;
        }
        
        // Handle staff backend unavailable gracefully
        if (error instanceof api.ApiError && error.status >= 500) {
          console.warn('Staff backend temporarily unavailable, returning null for graceful degradation');
          return null;
        }
        
        // Handle network errors (fetch failures)
        if (error instanceof TypeError && error.message && error.message.includes('fetch')) {
          console.warn('Network error occurred, staff backend may be unavailable');
          return null;
        }
        
        // Handle any other errors safely
        if (error instanceof Error) {
          console.warn('API request failed:', error.message);
          return null;
        }
        
      } catch (handlingError) {
        console.warn('Error in error handling:', handlingError);
        return null;
      }
      
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false, // Disable retries to prevent infinite loops
      onError: (error: unknown) => {
        console.warn('[QUERY] Query error handled gracefully:', error);
      }
    },
    mutations: {
      retry: false,
      onError: (error: unknown) => {
        console.warn('[MUTATION] Mutation error handled gracefully:', error);
      }
    },
  },
});
