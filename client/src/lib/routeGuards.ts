// Enhanced route guards and navigation flow helpers

export interface RouteGuardConfig {
  requiresData?: string[];
  redirectTo?: string;
  allowDirect?: boolean;
}

// Configuration for each application step
export const ROUTE_GUARDS: Record<string, RouteGuardConfig> = {
  '/application/step-1': {
    allowDirect: true // Entry point - always accessible
  },
  '/application/step-2': {
    requiresData: ['step1'],
    redirectTo: '/application/step-1',
    allowDirect: false
  },
  '/application/step-3': {
    requiresData: ['step1', 'step2'],
    redirectTo: '/application/step-1',
    allowDirect: false
  },
  '/application/step-4': {
    requiresData: ['step1', 'step2', 'step3'],
    redirectTo: '/application/step-1',
    allowDirect: false
  },
  '/application/step-5': {
    requiresData: ['step1', 'step2', 'step3', 'step4'],
    redirectTo: '/application/step-1',
    allowDirect: false
  },
  '/application/step-6': {
    requiresData: ['step1', 'step2', 'step3', 'step4', 'step5'],
    redirectTo: '/application/step-1',
    allowDirect: false
  }
};

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(path: string, applicationData: any): boolean {
  const guard = ROUTE_GUARDS[path];
  
  if (!guard) {
    return true; // No guard configured - allow access
  }
  
  if (guard.allowDirect) {
    return true; // Direct access allowed
  }
  
  if (!guard.requiresData) {
    return true; // No data requirements
  }
  
  // Check if all required data is present
  return guard.requiresData.every(step => {
    return applicationData?.[step] && Object.keys(applicationData[step]).length > 0;
  });
}

/**
 * Get redirect path if route access is denied
 */
export function getRedirectPath(path: string): string {
  const guard = ROUTE_GUARDS[path];
  return guard?.redirectTo || '/application/step-1';
}

/**
 * Enhanced navigation with validation
 */
export function navigateWithValidation(
  path: string, 
  applicationData: any,
  navigate: (path: string) => void
): boolean {
  if (canAccessRoute(path, applicationData)) {
    navigate(path);
    return true;
  } else {
    const redirectPath = getRedirectPath(path);
    console.warn(`Access denied to ${path}, redirecting to ${redirectPath}`);
    navigate(redirectPath);
    return false;
  }
}

/**
 * Get next logical step in application flow
 */
export function getNextStep(currentStep: string, applicationData: any): string | null {
  const stepMap: Record<string, string> = {
    '/application/step-1': '/application/step-2',
    '/application/step-2': '/application/step-3', 
    '/application/step-3': '/application/step-4',
    '/application/step-4': '/application/step-5',
    '/application/step-5': '/application/step-6',
    '/application/step-6': '/application/success'
  };
  
  const nextStep = stepMap[currentStep];
  
  if (!nextStep) return null;
  
  // Validate next step is accessible
  if (canAccessRoute(nextStep, applicationData)) {
    return nextStep;
  }
  
  return null;
}

/**
 * Get application progress percentage
 */
export function getApplicationProgress(applicationData: any): number {
  const steps = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'];
  const completedSteps = steps.filter(step => 
    applicationData?.[step] && Object.keys(applicationData[step]).length > 0
  );
  
  return Math.round((completedSteps.length / steps.length) * 100);
}