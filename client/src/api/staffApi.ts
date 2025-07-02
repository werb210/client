// Staff API client for application submission and SignNow integration

const STAFF_API_URL = import.meta.env.VITE_API_BASE_URL || 'https://staffportal.replit.app/api';

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
    
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Staff API error: ${response.status} - ${errorText}`);
    }

    return response.json();
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

      const response = await fetch(`${this.baseUrl}/uploads`, {
        method: 'POST',
        credentials: 'include',
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

      // Prepare application data
      const applicationData: ApplicationSubmissionData = {
        formFields: {
          // Step 1 data
          headquarters: formData.step1FinancialProfile?.headquarters || formData.headquarters || 'US',
          industry: formData.step1FinancialProfile?.industry || formData.industry || '',
          lookingFor: formData.step1FinancialProfile?.lookingFor || formData.lookingFor || '',
          fundingAmount: formData.step1FinancialProfile?.fundingAmount || formData.fundingAmount || 0,
          salesHistory: formData.step1FinancialProfile?.salesHistory || formData.salesHistory || '',
          averageMonthlyRevenue: formData.step1FinancialProfile?.averageMonthlyRevenue || formData.averageMonthlyRevenue || 0,
          accountsReceivableBalance: formData.step1FinancialProfile?.accountsReceivableBalance || formData.accountsReceivableBalance || 0,
          fixedAssetsValue: formData.step1FinancialProfile?.fixedAssetsValue || formData.fixedAssetsValue || 0,
          equipmentValue: formData.step1FinancialProfile?.equipmentValue || formData.equipmentValue,
          
          // Step 3 data
          businessName: formData.step3BusinessDetails?.businessName || '',
          businessAddress: formData.step3BusinessDetails?.businessAddress || '',
          businessCity: formData.step3BusinessDetails?.businessCity || '',
          businessState: formData.step3BusinessDetails?.businessState || '',
          businessZipCode: formData.step3BusinessDetails?.businessZipCode || '',
          businessPhone: formData.step3BusinessDetails?.businessPhone || '',
          businessEmail: formData.step3BusinessDetails?.businessEmail || '',
          businessWebsite: formData.step3BusinessDetails?.businessWebsite || '',
          businessStructure: formData.step3BusinessDetails?.businessStructure || '',
          businessRegistrationDate: formData.step3BusinessDetails?.businessRegistrationDate || '',
          businessTaxId: formData.step3BusinessDetails?.businessTaxId || '',
          businessDescription: formData.step3BusinessDetails?.businessDescription || '',
          numberOfEmployees: formData.step3BusinessDetails?.numberOfEmployees || '',
          primaryBankName: formData.step3BusinessDetails?.primaryBankName || '',
          bankingRelationshipLength: formData.step3BusinessDetails?.bankingRelationshipLength || '',
          
          // Step 4 data
          firstName: formData.step4ApplicantDetails?.firstName || '',
          lastName: formData.step4ApplicantDetails?.lastName || '',
          title: formData.step4ApplicantDetails?.title || '',
          dateOfBirth: formData.step4ApplicantDetails?.dateOfBirth || '',
          socialSecurityNumber: formData.step4ApplicantDetails?.socialSecurityNumber || '',
          personalEmail: formData.step4ApplicantDetails?.personalEmail || '',
          personalPhone: formData.step4ApplicantDetails?.personalPhone || '',
          homeAddress: formData.step4ApplicantDetails?.homeAddress || '',
          homeCity: formData.step4ApplicantDetails?.homeCity || '',
          homeState: formData.step4ApplicantDetails?.homeState || '',
          homeZipCode: formData.step4ApplicantDetails?.homeZipCode || '',
          personalIncome: formData.step4ApplicantDetails?.personalIncome || '',
          creditScore: formData.step4ApplicantDetails?.creditScore || '',
          ownershipPercentage: formData.step4ApplicantDetails?.ownershipPercentage || '',
          yearsWithBusiness: formData.step4ApplicantDetails?.yearsWithBusiness || '',
          previousLoans: formData.step4ApplicantDetails?.previousLoans || '',
          bankruptcyHistory: formData.step4ApplicantDetails?.bankruptcyHistory || '',
        },
        uploadedDocuments,
        productId: selectedProductId,
        clientId: 'client_' + Date.now(), // Generate unique client ID
      };

      console.log('📋 Submitting application with data:', {
        formFieldsCount: Object.keys(applicationData.formFields).length,
        documentsCount: uploadedDocuments.length,
        productId: selectedProductId
      });

      // Submit to staff API
      const response = await this.makeRequest<ApplicationSubmissionResponse>('/applications/submit', {
        method: 'POST',
        body: JSON.stringify(applicationData),
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

  async initiateSigning(applicationId: string): Promise<SigningStatusResponse> {
    try {
      console.log(`🖊️ Initiating signing for application: ${applicationId}`);
      
      const response = await this.makeRequest<SigningStatusResponse>(`/applications/${applicationId}/initiate-signing`, {
        method: 'POST',
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
}

export const staffApi = new StaffApiClient();