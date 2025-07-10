// Staff API client for application submission and SignNow integration

const STAFF_API_URL = import.meta.env.VITE_API_BASE_URL || 'https://app.boreal.financial/api/public';

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
    numberOfEmployees: string;
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

export interface SigningStatusResponse {
  status: 'pending' | 'ready' | 'completed' | 'error';
  signUrl?: string;
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

  private async uploadFiles(files: File[]): Promise<Array<{
    id: string;
    name: string;
    documentType: string;
    size: number;
    type: string;
  }>> {
    // Upload files to staff backend and return metadata
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', file.name.toLowerCase().includes('bank') ? 'bank_statement' : 'business_document');

      const bearerToken = import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN;
      
      const response = await fetch(`${this.baseUrl}/uploads`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': bearerToken ? `Bearer ${bearerToken}` : '',
          'Origin': window.location.origin,
          'Referer': window.location.href,
        },
        body: formData,
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
      console.log('📤 Starting application submission to staff API...');
      
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
        console.log(`📁 Uploading ${files.length} documents...`);
        uploadedDocuments = await this.uploadFiles(files);
        console.log('✅ Documents uploaded successfully');
      }

      // Prepare application data using unified schema
      const applicationData: ApplicationSubmissionData = {
        formFields: {
          // Step 1 data
          headquarters: formData.headquarters || 'US',
          industry: formData.industry || '',
          lookingFor: formData.lookingFor || '',
          fundingAmount: formData.fundingAmount || 0,
          salesHistory: formData.salesHistory || '',
          averageMonthlyRevenue: formData.averageMonthlyRevenue || 0,
          accountsReceivableBalance: formData.accountsReceivableBalance || 0,
          fixedAssetsValue: formData.fixedAssetsValue || 0,
          equipmentValue: formData.equipmentValue,
          
          // Step 3 data
          businessName: formData.operatingName || formData.businessName || '',
          businessAddress: formData.businessStreetAddress || formData.businessAddress || '',
          businessCity: formData.businessCity || '',
          businessState: formData.businessState || '',
          businessZipCode: formData.businessPostalCode || formData.businessZipCode || '',
          businessPhone: formData.businessPhone || '',
          businessEmail: formData.businessEmail || '',
          businessWebsite: formData.businessWebsite || '',
          businessStructure: formData.businessStructure || '',
          businessRegistrationDate: formData.businessRegistrationDate || '',
          businessTaxId: formData.businessTaxId || '',
          businessDescription: formData.businessDescription || '',
          numberOfEmployees: formData.numberOfEmployees?.toString() || '',
          primaryBankName: formData.primaryBankName || '',
          bankingRelationshipLength: formData.bankingRelationshipLength || '',
          
          // Step 4 data
          firstName: formData.applicantFirstName || '',
          lastName: formData.applicantLastName || '',
          title: formData.applicantTitle || '',
          dateOfBirth: formData.applicantDateOfBirth || '',
          socialSecurityNumber: formData.applicantSSN || '',
          personalEmail: formData.applicantEmail || '',
          personalPhone: formData.applicantPhone || '',
          homeAddress: formData.applicantAddress || '',
          homeCity: formData.applicantCity || '',
          homeState: formData.applicantState || '',
          homeZipCode: formData.applicantZipCode || '',
          personalIncome: formData.personalIncome || '',
          creditScore: formData.creditScore || '',
          ownershipPercentage: formData.ownershipPercentage?.toString() || '',
          yearsWithBusiness: formData.yearsWithBusiness || '',
          previousLoans: formData.previousLoans || '',
          bankruptcyHistory: formData.bankruptcyHistory || '',
        },
        uploadedDocuments,
        productId: selectedProductId,
        clientId: 'client_' + crypto.randomUUID(), // Generate unique client ID
      };

      console.log('📋 Submitting application with data:', {
        formFieldsCount: Object.keys(applicationData.formFields).length,
        documentsCount: uploadedDocuments.length,
        productId: selectedProductId
      });

      // Submit to staff API - use correct endpoint and format
      const correctPayload = {
        step1: {
          headquarters: formData.headquarters || 'US',
          industry: formData.industry || '',
          lookingFor: formData.lookingFor || '',
          fundingAmount: formData.fundingAmount || 0,
          salesHistory: formData.salesHistory || '',
          averageMonthlyRevenue: formData.averageMonthlyRevenue || 0,
          accountsReceivableBalance: formData.accountsReceivableBalance || 0,
          fixedAssetsValue: formData.fixedAssetsValue || 0,
          equipmentValue: formData.equipmentValue,
        },
        step3: {
          operatingName: formData.operatingName || formData.businessName || '',
          legalName: formData.legalName || formData.operatingName || formData.businessName || '',
          businessStreetAddress: formData.businessStreetAddress || formData.businessAddress || '',
          businessCity: formData.businessCity || '',
          businessState: formData.businessState || '',
          businessPostalCode: formData.businessPostalCode || formData.businessZipCode || '',
          businessPhone: formData.businessPhone || '',
          businessWebsite: formData.businessWebsite || '',
          businessStructure: formData.businessStructure || '',
          businessRegistrationDate: formData.businessRegistrationDate || '',
          businessTaxId: formData.businessTaxId || '',
          businessDescription: formData.businessDescription || '',
          numberOfEmployees: formData.numberOfEmployees || 0,
          primaryBankName: formData.primaryBankName || '',
          bankingRelationshipLength: formData.bankingRelationshipLength || '',
        },
        step4: {
          applicantFirstName: formData.applicantFirstName || '',
          applicantLastName: formData.applicantLastName || '',
          applicantEmail: formData.applicantEmail || '',
          applicantPhone: formData.applicantPhone || '',
          applicantAddress: formData.applicantAddress || '',
          applicantCity: formData.applicantCity || '',
          applicantState: formData.applicantState || '',
          applicantZipCode: formData.applicantZipCode || '',
          applicantDateOfBirth: formData.applicantDateOfBirth || '',
          applicantSSN: formData.applicantSSN || '',
          ownershipPercentage: formData.ownershipPercentage || 100,
        },
        uploadedDocuments,
        productId: selectedProductId,
      };

      console.log('📋 Submitting with correct payload structure:', correctPayload);

      const response = await this.makeRequest<ApplicationSubmissionResponse>('/public/applications', {
        method: 'POST',
        body: JSON.stringify(correctPayload),
      });

      console.log('✅ Application submitted successfully:', response);
      return response;

    } catch (error) {
      console.error('❌ Application submission failed:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async checkSigningStatus(applicationId: string): Promise<SigningStatusResponse> {
    try {
      console.log(`🔍 Checking signing status for application: ${applicationId}`);
      
      const response = await this.makeRequest<SigningStatusResponse>(`/applications/${applicationId}/signing-status`);
      
      console.log('📋 Signing status:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to check signing status:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to check signing status'
      };
    }
  }

  async initiateSigning(applicationId: string, prefilData?: {
    step3BusinessDetails?: any;
    step4ApplicantInfo?: any;
  }): Promise<SigningStatusResponse> {
    try {
      console.log(`🖊️ Initiating signing for application: ${applicationId}`);
      
      // Prepare pre-fill data payload
      const payload = prefilData ? {
        step3BusinessDetails: {
          businessName: prefilData.step3BusinessDetails?.operatingName || prefilData.step3BusinessDetails?.legalName,
          operatingName: prefilData.step3BusinessDetails?.operatingName,
          legalName: prefilData.step3BusinessDetails?.legalName,
          businessStreetAddress: prefilData.step3BusinessDetails?.businessStreetAddress,
          businessCity: prefilData.step3BusinessDetails?.businessCity,
          businessState: prefilData.step3BusinessDetails?.businessState || prefilData.step3BusinessDetails?.province,
          businessZipCode: prefilData.step3BusinessDetails?.businessZipCode || prefilData.step3BusinessDetails?.businessPostalCode,
          businessPhone: prefilData.step3BusinessDetails?.businessPhone,
          businessStructure: prefilData.step3BusinessDetails?.businessStructure,
          businessStartDate: prefilData.step3BusinessDetails?.businessStartDate,
          numberOfEmployees: prefilData.step3BusinessDetails?.numberOfEmployees || prefilData.step3BusinessDetails?.employeeCount,
          estimatedYearlyRevenue: prefilData.step3BusinessDetails?.estimatedYearlyRevenue
        },
        step4ApplicantInfo: {
          firstName: prefilData.step4ApplicantInfo?.firstName,
          lastName: prefilData.step4ApplicantInfo?.lastName,
          email: prefilData.step4ApplicantInfo?.email,
          phone: prefilData.step4ApplicantInfo?.personalPhone,
          dateOfBirth: prefilData.step4ApplicantInfo?.dateOfBirth,
          homeAddress: prefilData.step4ApplicantInfo?.homeAddress,
          city: prefilData.step4ApplicantInfo?.city,
          province: prefilData.step4ApplicantInfo?.province,
          postalCode: prefilData.step4ApplicantInfo?.postalCode,
          sin: prefilData.step4ApplicantInfo?.sin,
          ownershipPercentage: prefilData.step4ApplicantInfo?.ownershipPercentage,
          netWorth: prefilData.step4ApplicantInfo?.netWorth,
          // Partner information if applicable
          partnerFirstName: prefilData.step4ApplicantInfo?.partnerFirstName,
          partnerLastName: prefilData.step4ApplicantInfo?.partnerLastName,
          partnerEmail: prefilData.step4ApplicantInfo?.partnerEmail,
          partnerPhone: prefilData.step4ApplicantInfo?.partnerPersonalPhone,
          partnerOwnershipPercentage: prefilData.step4ApplicantInfo?.partnerOwnershipPercentage,
          partnerSin: prefilData.step4ApplicantInfo?.partnerSin,
          partnerNetWorth: prefilData.step4ApplicantInfo?.partnerNetWorth
        }
      } : undefined;

      console.log('📋 Pre-fill data for SignNow:', payload);
      
      const response = await this.makeRequest<SigningStatusResponse>(`/applications/${applicationId}/initiate-signing`, {
        method: 'POST',
        body: payload ? JSON.stringify(payload) : undefined,
        headers: payload ? {
          'Content-Type': 'application/json'
        } : undefined
      });
      
      console.log('📝 Signing initiated:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to initiate signing:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to initiate signing'
      };
    }
  }

  async finalizeApplication(applicationId: string): Promise<FinalizationResponse> {
    try {
      console.log(`🏁 Finalizing application: ${applicationId}`);
      
      const response = await this.makeRequest<FinalizationResponse>(`/applications/${applicationId}/finalize`, {
        method: 'POST',
      });
      
      console.log('✅ Application finalized:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to finalize application:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to finalize application'
      };
    }
  }

  async createSignNowDocument(applicationId: string): Promise<SigningStatusResponse> {
    try {
      console.log(`📝 Creating SignNow document for application: ${applicationId}`);
      
      const response = await this.makeRequest<SigningStatusResponse>(`/applications/${applicationId}/signnow`, {
        method: 'POST',
        body: JSON.stringify({
          applicationId: applicationId
        }),
      });
      
      console.log('✅ SignNow document created:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to create SignNow document:', error);
      
      // Handle 501/500 errors gracefully
      if (error instanceof Error && (error.message.includes('501') || error.message.includes('500'))) {
        return {
          status: 'error',
          error: 'Signature system not yet implemented. Please try again later.'
        };
      }
      
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to create SignNow document'
      };
    }
  }

  async createApplication(applicationData: any): Promise<{ applicationId: string }> {
    try {
      console.log('📝 Creating new application via POST /api/public/applications');
      console.log('📝 Application data:', applicationData);
      
      const response = await this.makeRequest<{ applicationId: string }>('/public/applications', {
        method: 'POST',
        body: JSON.stringify(applicationData),
      });
      
      console.log('✅ Application created with ID:', response.applicationId);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to create application:', error);
      throw error;
    }
  }
}

export const staffApi = new StaffApiClient();