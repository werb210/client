/**
 * UUID Utilities for Application ID Management
 * Handles extraction of clean UUIDs from prefixed application IDs
 */

export const extractUuid = (id: string): string => {
  return id.replace(/^app_prod_/, '').replace(/^app_fallback_/, '');
};

export const formatApplicationId = (uuid: string): string => {
  // Return clean UUID without prefix for API calls
  return uuid;
};