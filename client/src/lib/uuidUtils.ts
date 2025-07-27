/**
 * UUID Utilities for Application ID Management
 * Handles consistent application ID generation, validation, and storage
 */

import { v4 as uuidv4 } from 'uuid';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Generate a new UUID v4
 */
export const generateApplicationId = (): string => {
  return uuidv4();
};

/**
 * Validate if a string is a valid UUID
 */
export const isValidUUID = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  return UUID_REGEX.test(id);
};

/**
 * Get application ID from localStorage with validation
 * ✅ CLIENT APPLICATION FIX 4: Check both 'applicationId' and 'lastApplicationId'
 */
export const getStoredApplicationId = (): string | null => {
  // First check primary applicationId
  let stored = localStorage.getItem('applicationId');
  if (stored && isValidUUID(stored)) {
    return stored;
  }
  
  // ✅ Fallback to lastApplicationId for document upload follow-up
  stored = localStorage.getItem('lastApplicationId');
  if (stored && isValidUUID(stored)) {
    console.log('💾 [UUID] Using lastApplicationId fallback:', stored);
    return stored;
  }
  
  return null;
};

/**
 * Store application ID in localStorage
 */
export const storeApplicationId = (applicationId: string): void => {
  if (!isValidUUID(applicationId)) {
    throw new Error(`Invalid UUID format: ${applicationId}`);
  }
  localStorage.setItem('applicationId', applicationId);
  console.log('💾 [UUID] Application ID stored:', applicationId);
};

/**
 * Initialize application ID - generates new one if none exists or invalid
 */
export const initializeApplicationId = (): string => {
  let applicationId = getStoredApplicationId();
  
  if (!applicationId) {
    applicationId = generateApplicationId();
    storeApplicationId(applicationId);
    console.log('🆕 [UUID] New application ID generated:', applicationId);
  } else {
    console.log('♻️ [UUID] Existing application ID found:', applicationId);
  }
  
  return applicationId;
};

/**
 * Clear stored application ID (for new applications)
 */
export const clearApplicationId = (): void => {
  localStorage.removeItem('applicationId');
  console.log('🗑️ [UUID] Application ID cleared');
};

/**
 * Validate application ID before API calls
 */
export const validateApplicationIdForAPI = (applicationId: string | null): string => {
  if (!applicationId || !isValidUUID(applicationId)) {
    throw new Error('Invalid application session. Please restart the application.');
  }
  return applicationId;
};

// Legacy support functions
export const extractUuid = (id: string): string => {
  return id.replace(/^app_prod_/, '').replace(/^app_fallback_/, '');
};

export const formatApplicationId = (uuid: string): string => {
  // Return clean UUID without prefix for API calls
  return uuid;
};