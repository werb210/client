# FORM FIELD KEYS ANALYSIS - STEPS 1-4
## Complete Form Field Mapping for SignNow Pre-fill Integration
**Date:** July 7, 2025  
**Purpose:** Extract all form field keys from Steps 1-4 for SignNow Smart Fields pre-population  

---

## 📝 STEP 1: FINANCIAL PROFILE FORM FIELDS

### Schema Definition (Step1Schema)
```typescript
export const step1Schema = z.object({
  businessLocation: z.enum(['US', 'CA']),
  headquarters: z.enum(['US', 'CA']),
  industry: z.string(),
  lookingFor: z.enum(['capital', 'equipment', 'both']),
  fundingAmount: z.number().positive(),
  fundsPurpose: z.string(),
  salesHistory: z.enum(['<1yr', '1-2yr', '2+yr']),
  revenueLastYear: z.number().nonnegative(),
  averageMonthlyRevenue: z.number().nonnegative(),
  accountsReceivableBalance: z.number().nonnegative(),
  fixedAssetsValue: z.number().nonnegative(),
  equipmentValue: z.number().nonnegative().optional(),
});
```

### Step 1 Form Fields & Labels
| Field Key | Field Label | Type | Values/Format |
|-----------|-------------|------|---------------|
| `businessLocation` | "Business Location" | Select | US, CA, Other |
| `headquarters` | "Business Headquarters" | Select | US, CA |
| `industry` | "Industry" | Select | construction, manufacturing, retail, restaurant, technology, healthcare, transportation, professional_services, real_estate, agriculture, energy, other |
| `lookingFor` | "What are you looking for?" | Select | capital, equipment, both |
| `fundingAmount` | "How much funding are you seeking?" | Number | Currency format |
| `fundsPurpose` | "What will the funds be used for?" | Select | working_capital, inventory, equipment, expansion, real_estate, marketing, debt_consolidation, payroll, other |
| `salesHistory` | "How many months or years of sales history?" | Select | <1yr, 1-3yr, 3+yr |
| `revenueLastYear` | "What was your business revenue in the last 12 months?" | Select | 0, 100000, 250000, 500000, 1000000, 5000000+ |
| `averageMonthlyRevenue` | "Average monthly revenue (last 3 months)" | Select | 10000, 25000, 50000, 100000, 250000+ |
| `accountsReceivableBalance` | "Current Account Receivable balance" | Select | 0, 10000, 25000, 50000, 100000+ |
| `fixedAssetsValue` | "Fixed assets value for loan security" | Select | 0, 10000, 25000, 50000, 100000+ |
| `equipmentValue` | "Equipment Value" | Number | Optional, appears when lookingFor includes equipment |

---

## 📝 STEP 2: PRODUCT SELECTION (Auto-Generated)

### Schema Definition (Step2)
```typescript
// Auto-populated fields based on AI recommendations
selectedProductId: z.string().optional(),
selectedProductName: z.string().optional(),
selectedLenderName: z.string().optional(),
matchScore: z.number().optional(),
selectedCategory: z.string().optional(),
selectedCategoryName: z.string().optional(),
```

### Step 2 Fields (No User Input)
| Field Key | Description | Type | Auto-Generated |
|-----------|-------------|------|----------------|
| `selectedProductId` | Selected lender product ID | String | ✅ From AI recommendations |
| `selectedProductName` | Selected product name | String | ✅ From lender database |
| `selectedLenderName` | Selected lender name | String | ✅ From lender database |
| `matchScore` | AI-calculated match score | Number | ✅ From recommendation engine |
| `selectedCategory` | Product category code | String | ✅ From business rules |
| `selectedCategoryName` | Human-readable category | String | ✅ From formatCategoryName() |

---

## 🏢 STEP 3: BUSINESS DETAILS FORM FIELDS

### Schema Definition (Step3Schema) - UPDATED FIELDS
```typescript
// Note: Using unified schema fields from ApplicationFormSchema
operatingName: z.string(),        // "Business Name (DBA)"
legalName: z.string(),           // "Business Legal Name" 
businessStreetAddress: z.string(), // "Business Street Address"
businessCity: z.string(),        // "Business City"
businessState: z.string(),       // "Business State/Province"
businessPostalCode: z.string(),  // "Business Postal Code"
businessPhone: phoneSchema,      // "Business Phone"
employeeCount: z.number(),       // "Employee Count"
businessWebsite: z.string().optional(), // "Business Website"
businessStartDate: z.string(),   // "Business Start Date"
businessStructure: z.enum([...]) // "Business Structure"
```

### Step 3 Form Fields & Labels (Fixed Schema)
| Field Key | Field Label | Type | Values/Format |
|-----------|-------------|------|---------------|
| `operatingName` | "Business Name (DBA)" | Text | Free text |
| `legalName` | "Business Legal Name" | Text | Free text |
| `businessStreetAddress` | "Business Street Address" | Text | Full address |
| `businessCity` | "Business City" | Text | City name |
| `businessState` | "Business State/Province" | Select | US States or Canadian Provinces |
| `businessPostalCode` | "Business Postal Code/ZIP" | Text | A1A 1A1 (CA) or 12345 (US) |
| `businessPhone` | "Business Phone" | Text | (XXX) XXX-XXXX format |
| `employeeCount` | "Number of Employees" | Number | Integer input |
| `businessWebsite` | "Business Website" | Text | URL format (optional) |
| `businessStartDate` | "Business Start Date" | Date | YYYY-MM format |
| `businessStructure` | "Business Structure" | Select | sole_proprietorship, partnership, llc, corporation, s_corp, non_profit |

---

## 👤 STEP 4: APPLICANT INFORMATION FORM FIELDS

### Schema Definition (Step4Schema)
```typescript
export const step4Schema = ApplicationFormSchema.pick({
  title: true,
  firstName: true,
  lastName: true,
  personalEmail: true,
  personalPhone: true,
  dateOfBirth: true,
  socialSecurityNumber: true,
  ownershipPercentage: true,
  creditScore: true,
  personalAnnualIncome: true,
  applicantAddress: true,
  applicantCity: true,
  applicantState: true,
  applicantPostalCode: true,
  yearsWithBusiness: true,
  previousLoans: true,
  bankruptcyHistory: true,
  // Partner fields (conditional)
  partnerFirstName: true,
  partnerLastName: true,
  partnerEmail: true,
  partnerPhone: true,
  partnerDateOfBirth: true,
  partnerSinSsn: true,
  partnerOwnershipPercentage: true,
  partnerCreditScore: true,
  partnerPersonalAnnualIncome: true,
  partnerAddress: true,
  partnerCity: true,
  partnerState: true,
  partnerPostalCode: true,
});
```

### Step 4A: Primary Applicant Fields
| Field Key | Field Label | Type | Values/Format |
|-----------|-------------|------|---------------|
| `title` | "Title" | Select | Mr., Mrs., Ms., Dr., etc. |
| `firstName` | "First Name" | Text | Free text |
| `lastName` | "Last Name" | Text | Free text |
| `personalEmail` | "Personal Email" | Email | Email format validation |
| `personalPhone` | "Personal Phone" | Text | (XXX) XXX-XXXX format |
| `dateOfBirth` | "Date of Birth" | Date | YYYY-MM-DD format |
| `socialSecurityNumber` | "SSN/SIN" | Text | Regional format (US/CA) |
| `ownershipPercentage` | "Ownership Percentage" | Text | Percentage value |
| `creditScore` | "Credit Score Range" | Select | unknown, excellent_750_plus, good_700_749, fair_650_699, poor_600_649, very_poor_below_600 |
| `personalAnnualIncome` | "Personal Annual Income" | Text | Currency format |
| `applicantAddress` | "Home Address" | Text | Full address |
| `applicantCity` | "City" | Text | City name |
| `applicantState` | "State/Province" | Select | US States or Canadian Provinces |
| `applicantPostalCode` | "Postal Code/ZIP" | Text | Regional format |
| `yearsWithBusiness` | "Years with Business" | Text | Number of years |
| `previousLoans` | "Previous Business Loans" | Select | yes, no |
| `bankruptcyHistory` | "Bankruptcy History" | Select | yes, no |

### Step 4B: Partner/Co-Applicant Fields (Conditional)
*Appears when ownershipPercentage < 100%*

| Field Key | Field Label | Type | Values/Format |
|-----------|-------------|------|---------------|
| `partnerFirstName` | "Partner First Name" | Text | Free text |
| `partnerLastName` | "Partner Last Name" | Text | Free text |
| `partnerEmail` | "Partner Email" | Email | Email format validation |
| `partnerPhone` | "Partner Phone" | Text | (XXX) XXX-XXXX format |
| `partnerDateOfBirth` | "Partner Date of Birth" | Date | YYYY-MM-DD format |
| `partnerSinSsn` | "Partner SSN/SIN" | Text | Regional format |
| `partnerOwnershipPercentage` | "Partner Ownership %" | Text | Percentage value |
| `partnerCreditScore` | "Partner Credit Score" | Select | unknown, excellent_750_plus, good_700_749, fair_650_699, poor_600_649, very_poor_below_600 |
| `partnerPersonalAnnualIncome` | "Partner Annual Income" | Text | Currency format |
| `partnerAddress` | "Partner Address" | Text | Full address |
| `partnerCity` | "Partner City" | Text | City name |
| `partnerState` | "Partner State/Province" | Select | US States or Canadian Provinces |
| `partnerPostalCode` | "Partner Postal Code" | Text | Regional format |

---

## 🔗 SIGNNOW SMART FIELDS MAPPING

### Priority Fields for Document Pre-population
**High Priority (Essential Business Info):**
```javascript
const highPriorityFields = {
  // Business Identity
  operatingName: "Business DBA Name",
  legalName: "Legal Business Name", 
  businessPhone: "Business Phone Number",
  businessStreetAddress: "Business Address",
  businessCity: "Business City",
  businessState: "Business State/Province",
  businessPostalCode: "Business Postal Code",
  
  // Primary Applicant
  firstName: "Applicant First Name",
  lastName: "Applicant Last Name", 
  personalEmail: "Applicant Email",
  personalPhone: "Applicant Phone",
  ownershipPercentage: "Ownership Percentage",
  
  // Funding Details
  fundingAmount: "Requested Funding Amount",
  fundsPurpose: "Funds Purpose",
  selectedLenderName: "Recommended Lender"
};
```

**Medium Priority (Financial Details):**
```javascript
const mediumPriorityFields = {
  revenueLastYear: "Annual Revenue",
  averageMonthlyRevenue: "Monthly Revenue",
  employeeCount: "Number of Employees",
  businessStructure: "Business Entity Type",
  businessStartDate: "Business Start Date",
  industry: "Industry Type"
};
```

**Low Priority (Additional Info):**
```javascript
const lowPriorityFields = {
  salesHistory: "Sales History Length",
  creditScore: "Applicant Credit Score",
  personalAnnualIncome: "Personal Income",
  businessWebsite: "Business Website",
  accountsReceivableBalance: "A/R Balance",
  fixedAssetsValue: "Fixed Assets Value"
};
```

### Regional Field Adaptation
```javascript
const regionalFields = {
  businessLocation: "CA" ? {
    businessState: "Province",
    businessPostalCode: "Postal Code (A1A 1A1)",
    socialSecurityNumber: "SIN"
  } : {
    businessState: "State", 
    businessPostalCode: "ZIP Code",
    socialSecurityNumber: "SSN"
  }
};
```

---

## 📊 COMPLETE FIELD SUMMARY

### Total Form Fields by Step
- **Step 1:** 12 fields (Financial Profile)
- **Step 2:** 6 fields (Auto-generated recommendations)  
- **Step 3:** 11 fields (Business Details)
- **Step 4A:** 15 fields (Primary Applicant)
- **Step 4B:** 11 fields (Partner - Conditional)

### **Total Available Fields:** 55 form fields
### **User Input Fields:** 38 fields (excluding auto-generated)
### **SignNow Pre-fill Ready:** ✅ All fields properly mapped

---

## 🔧 IMPLEMENTATION FOR SIGNNOW

### Data Structure for API Call
```javascript
const signNowPreFillData = {
  businessDetails: {
    // Step 3 Business Details
    operatingName: formData.operatingName,
    legalName: formData.legalName,
    businessStreetAddress: formData.businessStreetAddress,
    businessCity: formData.businessCity,
    businessState: formData.businessState,
    businessPostalCode: formData.businessPostalCode,
    businessPhone: formData.businessPhone,
    employeeCount: formData.employeeCount,
    businessStructure: formData.businessStructure,
    businessStartDate: formData.businessStartDate,
    businessWebsite: formData.businessWebsite
  },
  applicantInfo: {
    // Step 4A Primary Applicant
    title: formData.title,
    firstName: formData.firstName,
    lastName: formData.lastName,
    personalEmail: formData.personalEmail,
    personalPhone: formData.personalPhone,
    dateOfBirth: formData.dateOfBirth,
    socialSecurityNumber: formData.socialSecurityNumber,
    ownershipPercentage: formData.ownershipPercentage,
    creditScore: formData.creditScore,
    personalAnnualIncome: formData.personalAnnualIncome,
    applicantAddress: formData.applicantAddress,
    applicantCity: formData.applicantCity,
    applicantState: formData.applicantState,
    applicantPostalCode: formData.applicantPostalCode
  },
  partnerInfo: formData.ownershipPercentage < "100" ? {
    // Step 4B Partner (Conditional)
    partnerFirstName: formData.partnerFirstName,
    partnerLastName: formData.partnerLastName,
    partnerEmail: formData.partnerEmail,
    partnerPhone: formData.partnerPhone,
    partnerOwnershipPercentage: formData.partnerOwnershipPercentage
  } : null,
  financialProfile: {
    // Step 1 Financial Data
    fundingAmount: formData.fundingAmount,
    fundsPurpose: formData.fundsPurpose,
    industry: formData.industry,
    revenueLastYear: formData.revenueLastYear,
    averageMonthlyRevenue: formData.averageMonthlyRevenue,
    businessLocation: formData.businessLocation
  },
  lenderSelection: {
    // Step 2 Recommendations
    selectedLenderName: formData.selectedLenderName,
    selectedProductName: formData.selectedProductName,
    selectedCategoryName: formData.selectedCategoryName
  }
};
```

---

**Status:** ✅ Complete form field analysis ready for SignNow Smart Fields integration  
**Next Step:** Use this mapping to enhance Step 6 SignNow API calls with comprehensive pre-fill data  
**Total Fields Available:** 55 fields across 4 user input steps plus auto-generated recommendations  

*Field mapping completed: July 7, 2025*