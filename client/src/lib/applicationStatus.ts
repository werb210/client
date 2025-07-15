// Application status checking utilities

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ApplicationStatusResponse {
  success: boolean;
  application?: {
    id: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}

/**
 * Fetch application status from staff backend
 * @param applicationId - The application ID to check
 * @returns Application status response
 */
export async function fetchApplicationStatus(applicationId: string): Promise<ApplicationStatusResponse> {
  try {
    // console.log(`📋 Checking application status for: ${applicationId}`);
    
    const response = await fetch(`${API_BASE_URL}/public/applications/${applicationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch application status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // console.log(`📋 Application status response:`, data);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching application status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if application can be submitted (status must be 'draft')
 * @param applicationId - The application ID to check
 * @returns Promise resolving to { canSubmit: boolean, status?: string, error?: string }
 */
export async function canSubmitApplication(applicationId: string): Promise<{
  canSubmit: boolean;
  status?: string;
  error?: string;
}> {
  const statusResponse = await fetchApplicationStatus(applicationId);
  
  if (!statusResponse.success) {
    return {
      canSubmit: false,
      error: statusResponse.error
    };
  }

  const applicationStatus = statusResponse.application?.status;
  const canSubmit = applicationStatus === 'draft';
  
  // console.log(`📋 Application ${applicationId} status: ${applicationStatus}, can submit: ${canSubmit}`);
  
  return {
    canSubmit,
    status: applicationStatus
  };
}