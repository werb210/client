// Staff API client for application submission and SignNow integration

const STAFF_API_URL = import.meta.env.VITE_API_BASE_URL || 'https://app.boreal.financial/api/public';

// ✅ Required Fields Validation Configuration
const REQUIRED_FIELDS = {
  step1: ["requestedAmount", "use_of_funds"], // Simplified - just core financial fields
  step3: ["operatingName", "legalName", "businessPhone", "businessState"], // Updated to match Step 3 form
  step4: ["applicantFirstName", "applicantLastName", "applicantEmail", "applicantPhone", "ownershipPercentage"] // SSN/SIN and DOB are optional
} as const;

// Field mapping for alternative field names
const FIELD_ALIASES = {
  step1: {
    requestedAmount: ["fundingAmount"],
    use_of_funds: ["fundsPurpose"],
    businessName: ["legalBusinessName", "operatingName"],
    businessPhone: ["phone"],
    businessState: ["state"]
  },
  step3: {
    operatingName: ["businessName", "businessDBAName"],
    legalName: ["businessLegalName", "legalBusinessName"],
    businessPhone: ["phone"],
    businessState: ["state", "province"]
  },
  step4: {
    applicantFirstName: ["firstName"],
    applicantLastName: ["lastName"], 
    applicantEmail: ["email", "personalEmail"],
    applicantPhone: ["phone", "personalPhone"],
    applicantDateOfBirth: ["dob", "dateOfBirth"],
    applicantSSN: ["sin", "socialSecurityNumber"]
  }
} as const;

// ✅ Validate Application Payload Helper
export function validateApplicationPayload(payload: any): { isValid: boolean; missingFields: Record<string, string[]> } {
  const missingFields: Record<string, string[]> = {};
  let isValid = true;

  // Check each step for required fields
  Object.entries(REQUIRED_FIELDS).forEach(([stepKey, requiredFields]) => {
    const stepData = payload[stepKey];
    if (!stepData) {
      missingFields[stepKey] = requiredFields;
      isValid = false;
      return;
    }

    const stepMissing: string[] = [];
    requiredFields.forEach(field => {
      let fieldFound = false;
      
      // Check primary field name
      if (stepData[field] !== undefined && stepData[field] !== null && stepData[field] !== "") {
        fieldFound = true;
      }
      
      // Check aliases if primary field not found
      if (!fieldFound && FIELD_ALIASES[stepKey as keyof typeof FIELD_ALIASES]) {
        const aliases = FIELD_ALIASES[stepKey as keyof typeof FIELD_ALIASES][field as keyof typeof FIELD_ALIASES[keyof typeof FIELD_ALIASES]];
        if (aliases) {
          aliases.forEach(alias => {
            if (stepData[alias] !== undefined && stepData[alias] !== null && stepData[alias] !== "") {
              fieldFound = true;
            }
          });
        }
      }
      
      if (!fieldFound) {
        stepMissing.push(field);
      }
    });

    if (stepMissing.length > 0) {
      missingFields[stepKey] = stepMissing;
      isValid = false;
    }
  });

  return { isValid, missingFields };
}

export interface ApplicationSubmissionData {
  formFields: {
    // Step 1 Financial Profile
    headquarters: string;
    industry: string;
    lookingFor: string;
    fundingAmount: number;
    salesHistory: string;
    averageMonthlyRevenue: number;
    accountsReceivableBalance: number;
    fixedAssetsValue: number;
    equipmentValue?: number;
    
    // Step 3 Business Details
    businessName: string;
    businessAddress: string;
    businessCity: string;
    businessState: string;
    businessZipCode: string;
    businessPhone: string;
    businessEmail: string;
    businessWebsite?: string;
    businessStructure: string;
    businessRegistrationDate: string;
    businessTaxId: string;
    businessDescription: string;
    numberOfEmployees: number;
    primaryBankName: string;
    bankingRelationshipLength: string;
    
    // Step 4 Applicant Details
    firstName: string;
    lastName: string;
    title: string;
    dateOfBirth: string;
    socialSecurityNumber: string;
    personalEmail: string;
    personalPhone: string;
    homeAddress: string;
    homeCity: string;
    homeState: string;
    homeZipCode: string;
    personalIncome: string;
    creditScore: string;
    ownershipPercentage: string;
    yearsWithBusiness: string;
    previousLoans: string;
    bankruptcyHistory: string;
  };
  uploadedDocuments: Array<{
    id: string;
    name: string;
    documentType: string;
    size: number;
    type: string;
  }>;
  productId: string;
  clientId: string;
}

export interface ApplicationSubmissionResponse {
  status: 'submitted' | 'error';
  applicationId?: string;
  message?: string;
  error?: string;
}



export interface FinalizationResponse {
  status: 'finalized' | 'error';
  applicationId?: string;
  finalizedAt?: string;
  message?: string;
  error?: string;
}

class StaffApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = STAFF_API_URL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      // Get the bearer token from environment
      const bearerToken = import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN;
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': bearerToken ? `Bearer ${bearerToken}` : '',
          'Origin': window.location.origin,
          'Referer': window.location.href,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Staff API error: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('[STAFF_API] Request failed:', error.message || error);
      throw error;
    }
  }

  private async uploadFiles(files: File[], applicationId?: string): Promise<Array<{
    id: string;
    name: string;
    documentType: string;
    size: number;
    type: string;
  }>> {
    // Upload files to staff backend using PUBLIC endpoint (no Authorization required)
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', file.name.toLowerCase().includes('bank') ? 'bank_statement' : 'business_document');

      // Use public upload endpoint without Authorization headers
      const uploadUrl = applicationId 
        ? `${this.baseUrl}/api/public/applications/${applicationId}/documents`
        : `${this.baseUrl}/uploads`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        // ⚠️ No Authorization headers for public upload!
      });

      if (!response.ok) {
        throw new Error(`File upload failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        id: result.fileId || Math.random().toString(36).substr(2, 9),
        name: file.name,
        documentType: result.documentType || 'business_document',
        size: file.size,
        type: file.type,
      };
    });

    return Promise.all(uploadPromises);
  }

  async submitApplication(
    formData: any,
    uploadedFiles: Array<{ file: File; documentType: string }>,
    selectedProductId: string
  ): Promise<ApplicationSubmissionResponse> {
    try {
      // console.log('📤 Starting application submission to staff API...');
      
      // Upload documents first
      const files = uploadedFiles.map(uf => uf.file);
      let uploadedDocuments: Array<{
        id: string;
        name: string;
        documentType: string;
        size: number;
        type: string;
      }> = [];
      
      if (files.length > 0) {
        // console.log(`📁 Uploading ${files.length} documents...`);
        uploadedDocuments = await this.uploadFiles(files);
        // console.log('✅ Documents uploaded successfully');
      }

      // ✅ CRITICAL FIX: Remove flat field references - use step-based structure only
      // console.log('🚫 DEPRECATED: Legacy flat field mapping removed - using step-based structure only');
      
      // Ensure formData already contains step-based structure
      if (!formData.step1 || !formData.step3 || !formData.step4) {
        console.error('❌ STRUCTURE VIOLATION: formData must contain {step1, step3, step4} format');
        throw new Error('Invalid application data structure - missing step-based format');
      }

      // console.log('📋 Submitting application with data:', {
      //   step1Fields: Object.keys(formData.step1 || {}).length,
      //   step3Fields: Object.keys(formData.step3 || {}).length,
      //   step4Fields: Object.keys(formData.step4 || {}).length,
      //   documentsCount: uploadedDocuments.length,
      //   productId: selectedProductId
      // });

      // ✅ ENFORCE STEP-BASED STRUCTURE: Use formData.step1, formData.step3, formData.step4 directly
      const correctPayload = {
        step1: formData.step1,
        step3: formData.step3,
        step4: formData.step4,
        uploadedDocuments,
        productId: selectedProductId,
      };

      // Add the exact API call structure as requested
      const API_BASE_URL = this.baseUrl;
      const sharedToken = import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN;
      
      // console.log('🟢 Final payload being sent to API:', correctPayload);
      // console.log('🔍 API call structure verification:', {
      //   url: `${API_BASE_URL}/public/applications`,
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${sharedToken ? '[PRESENT]' : '[MISSING]'}`
      //   },
      //   bodyStructure: {
      //     step1: Object.keys(correctPayload.step1 || {}).length + ' fields',
      //     step3: Object.keys(correctPayload.step3 || {}).length + ' fields', 
      //     step4: Object.keys(correctPayload.step4 || {}).length + ' fields'
      //   }
      // });
      
      // ✅ FINAL VERIFICATION: Ensure no flat field references remain
      // console.log('📋 Step-based structure verification:');
      // console.log('  step1:', correctPayload.step1);
      // console.log('  step3:', correctPayload.step3);
      // console.log('  step4:', correctPayload.step4);

      const response = await this.makeRequest<ApplicationSubmissionResponse>('/api/applications', {
        method: 'POST',
        body: JSON.stringify(correctPayload),
      });

      // console.log('✅ Application submitted successfully:', response);
      return response;

    } catch (error) {
      console.error('❌ Application submission failed:', error);
      // Production mode: Throw error instead of returning fallback response
      throw error;
    }
  }





  async finalizeApplication(applicationId: string): Promise<FinalizationResponse> {
    try {
      // console.log(`🏁 Finalizing application: ${applicationId}`);
      
      const response = await this.makeRequest<FinalizationResponse>(`/api/applications/${applicationId}/finalize`, {
        method: 'POST',
      });
      
      // console.log('✅ Application finalized:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to finalize application:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to finalize application'
      };
    }
  }



  async createApplication(applicationData: any): Promise<{ applicationId: string; signNowDocumentId?: string }> {
    try {
      // console.log('📝 Creating new application via POST /api/public/applications');
      // console.log('🟢 Final payload being sent to staff backend:', applicationData);
      
      // Critical field verification for SignNow population
      // console.log('🔍 Critical field verification for SignNow:', {
      //   'step1.fundingAmount': applicationData.step1?.fundingAmount,
      //   'step3.operatingName (businessName)': applicationData.step3?.operatingName,
      //   'step4.firstName': applicationData.step4?.firstName,
      //   'step4.personalEmail': applicationData.step4?.personalEmail,
      //   allFieldsPresent: !!(
      //     applicationData.step1?.fundingAmount && 
      //     applicationData.step3?.operatingName && 
      //     applicationData.step4?.firstName &&
      //     applicationData.step4?.personalEmail
      //   )
      // });
      
      // console.log('📋 Payload structure verification:', {
      //   hasStep1: !!applicationData.step1,
      //   hasStep3: !!applicationData.step3,
      //   hasStep4: !!applicationData.step4,
      //   step1FieldCount: Object.keys(applicationData.step1 || {}).length,
      //   step3FieldCount: Object.keys(applicationData.step3 || {}).length,
      //   step4FieldCount: Object.keys(applicationData.step4 || {}).length
      // });
      
      // console.log('🟢 Final payload being sent to staff backend:', applicationData);
      // console.log('📝 Complete application payload:', JSON.stringify(applicationData, null, 2));
      
      const response = await this.makeRequest<{ applicationId: string; signNowDocumentId?: string }>('/api/applications', {
        method: 'POST',
        body: JSON.stringify(applicationData),
      });
      
      // console.log('✅ Application creation response received:', {
      //   applicationId: response?.applicationId,
      //   signNowDocumentId: response?.signNowDocumentId,
      //   fullResponse: JSON.stringify(response, null, 2)
      // });
      
      // Verify critical fields for webhook integration
      if (response?.applicationId && response?.signNowDocumentId) {
        // console.log('🔗 Webhook verification: applicationId and signNowDocumentId both present');
        // console.log('🔗 Document ID for webhook matching:', response.signNowDocumentId);
      } else {
        console.warn('⚠️ Missing critical fields for SignNow integration:');
        console.warn('   - applicationId:', !!response?.applicationId);
        console.warn('   - signNowDocumentId:', !!response?.signNowDocumentId);
      }
      
      return response;
      
    } catch (error) {
      console.error('❌ Failed to create application:', error);
      throw error;
    }
  }

  // Document verification - check uploaded documents
  async getUploadedDocuments(applicationId: string): Promise<{
    documents: Array<{
      id: string;
      documentType: string;
      fileName: string;
      uploadedAt: string;
    }>;
    requiredDocuments: string[];
    missingDocuments: string[];
    isComplete: boolean;
  }> {
    const response = await this.makeRequest<any>(
      `/api/public/applications/${applicationId}/documents`
    );
    return response;
  }
}

export const staffApi = new StaffApiClient();