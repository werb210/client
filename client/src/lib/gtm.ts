/**
 * Google Tag Manager (GTM) Event Tracking Utilities
 * 
 * This utility provides functions to send events to GTM's dataLayer
 * for tracking user interactions throughout the application.
 */

// Extend the Window interface to include dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Initialize dataLayer if it doesn't exist
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

/**
 * Send a custom event to GTM dataLayer
 */
export const sendGTMEvent = (eventName: string, eventData: Record<string, any> = {}) => {
  if (typeof window === 'undefined') return;
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...eventData
  });
  
  console.log(`📊 GTM Event: ${eventName}`, eventData);
};

/**
 * Track step completion in the multi-step form
 */
export const trackStepCompleted = (step: number, applicationId?: string, additionalData: Record<string, any> = {}) => {
  sendGTMEvent('step_completed', {
    step,
    application_id: applicationId,
    ...additionalData
  });
};

/**
 * Track when a user starts the application form
 */
export const trackFormStarted = (applicationId?: string, userCountry?: string) => {
  sendGTMEvent('form_started', {
    application_id: applicationId,
    user_country: userCountry,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track successful application submission
 */
export const trackApplicationSubmitted = (applicationId: string, productType?: string, fundingAmount?: number) => {
  sendGTMEvent('application_submitted', {
    application_id: applicationId,
    product_type: productType,
    funding_amount: fundingAmount,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track document upload events
 */
export const trackDocumentUploaded = (applicationId: string, docType: string, fileName?: string) => {
  sendGTMEvent('document_uploaded', {
    application_id: applicationId,
    doc_type: docType,
    file_name: fileName,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track error events
 */
export const trackError = (errorMessage: string, errorCode?: string, step?: number, applicationId?: string) => {
  sendGTMEvent('error_occurred', {
    message: errorMessage,
    error_code: errorCode,
    step,
    application_id: applicationId,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track product selection
 */
export const trackProductSelected = (applicationId: string, productType: string, lenderName?: string) => {
  sendGTMEvent('product_selected', {
    application_id: applicationId,
    product_type: productType,
    lender_name: lenderName,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track signature completion
 */
export const trackSignatureCompleted = (applicationId: string, documentId?: string) => {
  sendGTMEvent('signature_completed', {
    application_id: applicationId,
    document_id: documentId,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track page views for single-page application routing
 */
export const trackPageView = (pagePath: string, pageTitle?: string, applicationId?: string) => {
  sendGTMEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
    application_id: applicationId
  });
};