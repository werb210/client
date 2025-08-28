import { useLocation } from "wouter";
import { useContext, useEffect } from "react";
import { useFormDataContext } from "@/context/FormDataContext";
import { canAccessRoute, getRedirectPath, navigateWithValidation } from "@/lib/routeGuards";

/**
 * Hook to handle route guarding for application steps
 */
export function useRouteGuard() {
  const [location, navigate] = useLocation();
  const { state: applicationData } = useFormDataContext();
  
  useEffect(() => {
    // Check if current route is accessible
    if (!canAccessRoute(location, applicationData)) {
      const redirectPath = getRedirectPath(location);
      // Route guard redirecting user
      navigate(redirectPath);
    }
  }, [location, applicationData, navigate]);
  
  const navigateToStep = (path: string) => {
    return navigateWithValidation(path, applicationData, navigate);
  };
  
  return {
    canAccess: (path: string) => canAccessRoute(path, applicationData),
    navigateToStep,
    currentLocation: location
  };
}