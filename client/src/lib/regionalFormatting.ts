/**
 * Regional Formatting Utilities for Steps 3-4 Forms
 * Handles US/Canada specific formatting for phone, postal codes, and SSN/SIN
 */

export const formatPhoneNumber = (value: string, isCanadian: boolean): string => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, '');

  // Both US and Canada use (XXX) XXX-XXXX format
  if (phoneNumber.length < 4) {
    return phoneNumber;
  } else if (phoneNumber.length < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  } else if (phoneNumber.length <= 10) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
  }
  return phoneNumber.slice(0, 10);
};

export const formatSSN = (value: string, isCanadian: boolean): string => {
  if (!value) return value;
  const ssn = value.replace(/[^\d]/g, '');

  if (isCanadian) {
    // Canadian SIN format: XXX XXX XXX
    if (ssn.length < 4) return ssn;
    else if (ssn.length < 7) return `${ssn.slice(0, 3)} ${ssn.slice(3)}`;
    else if (ssn.length <= 9) return `${ssn.slice(0, 3)} ${ssn.slice(3, 6)} ${ssn.slice(6)}`;
  } else {
    // US SSN format: XXX-XX-XXXX
    if (ssn.length < 4) return ssn;
    else if (ssn.length < 6) return `${ssn.slice(0, 3)}-${ssn.slice(3)}`;
    else if (ssn.length <= 9) return `${ssn.slice(0, 3)}-${ssn.slice(3, 5)}-${ssn.slice(5)}`;
  }
  return ssn.slice(0, 9);
};

export const formatPostalCode = (value: string, isCanadian: boolean): string => {
  if (!value) return value;

  if (isCanadian) {
    // Canadian postal code format: A1A 1A1
    const postal = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (postal.length <= 3) return postal;
    else if (postal.length <= 6) return `${postal.slice(0, 3)} ${postal.slice(3)}`;
    return `${postal.slice(0, 3)} ${postal.slice(3, 6)}`;
  } else {
    // US ZIP code format: 12345 or 12345-6789
    const zip = value.replace(/[^\d]/g, '');
    if (zip.length <= 5) return zip;
    else if (zip.length <= 9) return `${zip.slice(0, 5)}-${zip.slice(5)}`;
    return `${zip.slice(0, 5)}-${zip.slice(5, 9)}`;
  }
};

export const formatCurrency = (value: string): string => {
  const numericValue = value.replace(/[^\d]/g, '');
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const getRegionalLabels = (isCanadian: boolean) => {
  if (isCanadian) {
    return {
      sin: "SIN",
      postalCode: "Postal Code",
      postalCodePlaceholder: "Enter postal code (A1A 1A1)",
      stateProvince: "Province",
      country: "Canada",
      currency: "CAD",
      currencySymbol: "C$",
      phoneFormat: "(555) 123-4567",
      phoneExample: "(416) 555-0123",
      businessStructures: [
        { value: "sole_proprietorship", label: "Sole Proprietorship" },
        { value: "partnership", label: "Partnership" },
        { value: "corporation", label: "Corporation" },
        { value: "cooperative", label: "Cooperative" },
        { value: "not_for_profit", label: "Not-for-Profit" }
      ],
      industryTerms: {
        taxId: "Business Number (BN)",
        taxIdFormat: "123456789RP0001",
        revenue: "Annual Revenue",
        employees: "Full-Time Employees"
      }
    };
  } else {
    return {
      sin: "SSN",
      postalCode: "ZIP Code",
      postalCodePlaceholder: "Enter ZIP code (12345)",
      stateProvince: "State",
      country: "United States",
      currency: "USD",
      currencySymbol: "$",
      phoneFormat: "(555) 123-4567",
      phoneExample: "(555) 123-4567",
      businessStructures: [
        { value: "sole_proprietorship", label: "Sole Proprietorship" },
        { value: "partnership", label: "Partnership" },
        { value: "llc", label: "Limited Liability Company (LLC)" },
        { value: "corporation", label: "Corporation (C-Corp)" },
        { value: "s_corp", label: "S Corporation" },
        { value: "non_profit", label: "Non-Profit Organization" }
      ],
      industryTerms: {
        taxId: "Tax ID / EIN",
        taxIdFormat: "12-3456789",
        revenue: "Annual Revenue",
        employees: "Number of Employees"
      }
    };
  }
};

export const getStateProvinceOptions = (isCanadian: boolean) => {
  if (isCanadian) {
    return [
      { value: "AB", label: "Alberta" },
      { value: "BC", label: "British Columbia" },
      { value: "MB", label: "Manitoba" },
      { value: "NB", label: "New Brunswick" },
      { value: "NL", label: "Newfoundland and Labrador" },
      { value: "NS", label: "Nova Scotia" },
      { value: "ON", label: "Ontario" },
      { value: "PE", label: "Prince Edward Island" },
      { value: "QC", label: "Quebec" },
      { value: "SK", label: "Saskatchewan" },
      { value: "NT", label: "Northwest Territories" },
      { value: "NU", label: "Nunavut" },
      { value: "YT", label: "Yukon" },
    ];
  } else {
    return [
      { value: "AL", label: "Alabama" },
      { value: "AK", label: "Alaska" },
      { value: "AZ", label: "Arizona" },
      { value: "AR", label: "Arkansas" },
      { value: "CA", label: "California" },
      { value: "CO", label: "Colorado" },
      { value: "CT", label: "Connecticut" },
      { value: "DE", label: "Delaware" },
      { value: "FL", label: "Florida" },
      { value: "GA", label: "Georgia" },
      { value: "HI", label: "Hawaii" },
      { value: "ID", label: "Idaho" },
      { value: "IL", label: "Illinois" },
      { value: "IN", label: "Indiana" },
      { value: "IA", label: "Iowa" },
      { value: "KS", label: "Kansas" },
      { value: "KY", label: "Kentucky" },
      { value: "LA", label: "Louisiana" },
      { value: "ME", label: "Maine" },
      { value: "MD", label: "Maryland" },
      { value: "MA", label: "Massachusetts" },
      { value: "MI", label: "Michigan" },
      { value: "MN", label: "Minnesota" },
      { value: "MS", label: "Mississippi" },
      { value: "MO", label: "Missouri" },
      { value: "MT", label: "Montana" },
      { value: "NE", label: "Nebraska" },
      { value: "NV", label: "Nevada" },
      { value: "NH", label: "New Hampshire" },
      { value: "NJ", label: "New Jersey" },
      { value: "NM", label: "New Mexico" },
      { value: "NY", label: "New York" },
      { value: "NC", label: "North Carolina" },
      { value: "ND", label: "North Dakota" },
      { value: "OH", label: "Ohio" },
      { value: "OK", label: "Oklahoma" },
      { value: "OR", label: "Oregon" },
      { value: "PA", label: "Pennsylvania" },
      { value: "RI", label: "Rhode Island" },
      { value: "SC", label: "South Carolina" },
      { value: "SD", label: "South Dakota" },
      { value: "TN", label: "Tennessee" },
      { value: "TX", label: "Texas" },
      { value: "UT", label: "Utah" },
      { value: "VT", label: "Vermont" },
      { value: "VA", label: "Virginia" },
      { value: "WA", label: "Washington" },
      { value: "WV", label: "West Virginia" },
      { value: "WI", label: "Wisconsin" },
      { value: "WY", label: "Wyoming" },
      { value: "DC", label: "District of Columbia" },
    ];
  }
};

export const getTitleOptions = () => [
  { value: "owner_operator", label: "Owner/Operator" },
  { value: "president", label: "President" },
  { value: "partner_shareholder", label: "Partner/Shareholder" },
  { value: "executive", label: "Executive" },
  { value: "financial_officer", label: "Financial Officer" },
];

/**
 * Determines if business is Canadian based on Step 1 Business Location
 */
export const isCanadianBusiness = (businessLocation: string): boolean => {
  // Handle all possible Canadian values from Step 1 dropdown
  return businessLocation === 'canada' || businessLocation === 'CA' || businessLocation === 'Canada' || businessLocation === 'canadian';
};

/**
 * Formats Tax ID based on region (EIN for US, BN for Canada)
 */
export const formatTaxId = (value: string, isCanadian: boolean): string => {
  if (!value) return value;
  const digits = value.replace(/[^\d]/g, '');
  
  if (isCanadian) {
    // Canadian Business Number format: 123456789RP0001
    if (digits.length <= 9) return digits;
    return `${digits.slice(0, 9)}RP${digits.slice(9, 13).padEnd(4, '0')}`;
  } else {
    // US EIN format: XX-XXXXXXX
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}-${digits.slice(2, 9)}`;
  }
};

/**
 * Validates Tax ID format based on region
 */
export const validateTaxId = (value: string, isCanadian: boolean): boolean => {
  if (!value) return false;
  
  if (isCanadian) {
    // Canadian BN: 9 digits + RP + 4 digits
    return /^\d{9}RP\d{4}$/.test(value);
  } else {
    // US EIN: XX-XXXXXXX
    return /^\d{2}-\d{7}$/.test(value);
  }
};

/**
 * Gets regional field validation patterns
 */
export const getRegionalValidation = (isCanadian: boolean) => {
  return {
    phonePattern: /^\(\d{3}\) \d{3}-\d{4}$/,
    postalCodePattern: isCanadian ? /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/ : /^\d{5}(-\d{4})?$/,
    ssnPattern: isCanadian ? /^\d{3} \d{3} \d{3}$/ : /^\d{3}-\d{2}-\d{4}$/,
    taxIdPattern: isCanadian ? /^\d{9}RP\d{4}$/ : /^\d{2}-\d{7}$/,
  };
};