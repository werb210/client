/**
 * Enhanced form validation with better error messages
 */

import { z } from 'zod';

export interface ValidationResult {
  isValid: boolean;
  errors: FieldError[];
  warnings: FieldWarning[];
}

export interface FieldError {
  field: string;
  message: string;
  code: string;
}

export interface FieldWarning {
  field: string;
  message: string;
  suggestion: string;
}

/**
 * Enhanced validation schemas with user-friendly messages
 */
export const validationSchemas = {
  businessName: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-\.\&]+$/, 'Business name contains invalid characters'),

  email: z.string()
    .email('Please enter a valid email address (e.g., name@example.com)')
    .max(254, 'Email address is too long'),

  phone: z.string()
    .regex(/^(\+1\s?)?(\([0-9]{3}\)|[0-9]{3})[\s\-]?[0-9]{3}[\s\-]?[0-9]{4}$/, 
           'Please enter a valid phone number (e.g., (416) 555-0123)'),

  postalCode: z.string()
    .regex(/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/, 
           'Please enter a valid Canadian postal code (e.g., M5V 3A8)'),

  sin: z.string()
    .regex(/^[0-9]{3}-?[0-9]{3}-?[0-9]{3}$/, 
           'Please enter a valid SIN (e.g., 123-456-789)'),

  revenue: z.number()
    .min(0, 'Revenue cannot be negative')
    .max(1000000000, 'Revenue amount is too large')
    .refine(val => !isNaN(val), 'Please enter a valid revenue amount'),

  fundingAmount: z.number()
    .min(1000, 'Minimum funding amount is $1,000')
    .max(10000000, 'Maximum funding amount is $10,000,000')
    .refine(val => val % 1000 === 0, 'Funding amount should be rounded to nearest $1,000'),

  yearsInBusiness: z.number()
    .min(0, 'Years in business cannot be negative')
    .max(150, 'Years in business seems too high')
    .refine(val => Number.isInteger(val), 'Years in business must be a whole number')
};

/**
 * Real-time field validation with suggestions
 */
export function validateFieldRealTime(
  fieldName: string, 
  value: any,
  schema: z.ZodSchema
): ValidationResult {
  const errors: FieldError[] = [];
  const warnings: FieldWarning[] = [];

  try {
    schema.parse(value);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        errors.push({
          field: fieldName,
          message: err.message,
          code: err.code
        });
      });
    }
  }

  // Add contextual warnings and suggestions
  if (fieldName === 'email' && value && !errors.length) {
    if (!value.includes('.com') && !value.includes('.ca')) {
      warnings.push({
        field: fieldName,
        message: 'Email domain looks unusual',
        suggestion: 'Double-check your email domain'
      });
    }
  }

  if (fieldName === 'phone' && value && !errors.length) {
    if (!value.startsWith('(') && !value.startsWith('+1')) {
      warnings.push({
        field: fieldName,
        message: 'Phone format could be clearer',
        suggestion: 'Consider using format: (416) 555-0123'
      });
    }
  }

  if (fieldName === 'fundingAmount' && value && !errors.length) {
    if (value > 5000000) {
      warnings.push({
        field: fieldName,
        message: 'Large funding amounts may require additional documentation',
        suggestion: 'Prepare additional financial statements'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Progressive validation - validate as user types
 */
export class ProgressiveValidator {
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private validationResults: Map<string, ValidationResult> = new Map();

  validate(fieldName: string, value: any, schema: z.ZodSchema, delay = 500): Promise<ValidationResult> {
    return new Promise((resolve) => {
      // Clear existing timeout for this field
      const existingTimeout = this.timeouts.get(fieldName);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout for delayed validation
      const timeout = setTimeout(() => {
        const result = validateFieldRealTime(fieldName, value, schema);
        this.validationResults.set(fieldName, result);
        resolve(result);
      }, delay);

      this.timeouts.set(fieldName, timeout);
    });
  }

  getResult(fieldName: string): ValidationResult | null {
    return this.validationResults.get(fieldName) || null;
  }

  clearField(fieldName: string): void {
    const timeout = this.timeouts.get(fieldName);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(fieldName);
    }
    this.validationResults.delete(fieldName);
  }

  clearAll(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
    this.validationResults.clear();
  }
}

/**
 * Smart field completion suggestions
 */
export function getFieldSuggestions(fieldName: string, value: string): string[] {
  const suggestions: string[] = [];

  switch (fieldName) {
    case 'businessIndustry':
      const industries = [
        'Manufacturing', 'Technology', 'Healthcare', 'Retail', 'Construction',
        'Professional Services', 'Transportation', 'Agriculture', 'Finance'
      ];
      return industries.filter(industry => 
        industry.toLowerCase().includes(value.toLowerCase())
      );

    case 'businessStructure':
      const structures = [
        'Sole Proprietorship', 'Partnership', 'Corporation', 'LLC'
      ];
      return structures.filter(structure => 
        structure.toLowerCase().includes(value.toLowerCase())
      );

    case 'fundingPurpose':
      const purposes = [
        'Equipment Purchase', 'Working Capital', 'Business Expansion',
        'Inventory', 'Real Estate', 'Debt Consolidation'
      ];
      return purposes.filter(purpose => 
        purpose.toLowerCase().includes(value.toLowerCase())
      );

    default:
      return suggestions;
  }
}