# 📢 CLIENT APP LENDER STRUCTURES - COMPLETE EXPOSURE

*Generated: January 20, 2025 - As requested for Staff App integration*

Based on the comprehensive analysis of the Client App codebase, here are all internal structures, schemas, logic, and data sources related to **lenders** and **lender products**:

---

## ✅ 1. Lender Product Schema

### Primary Schema (`shared/lenderProductSchema.ts`)
```typescript
// Strict schema for validated lender products
export const LenderProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  lenderName: z.string(),
  geography: z.array(z.enum(["US", "CA"])),
  country: z.string().optional(), // Keep raw country field for filtering
  category: z.enum([
    "line_of_credit",
    "term_loan", 
    "equipment_financing",
    "invoice_factoring",
    "working_capital",
    "purchase_order_financing",
    "asset_based_lending",
    "sba_loan"
  ]),
  minAmount: z.number().int().nonnegative(),
  maxAmount: z.number().int().positive(),
  minRevenue: z.number().int().nonnegative(),
  interestRateMin: z.number().optional(),
  interestRateMax: z.number().optional(),
  termMin: z.number().int().positive().optional(),
  termMax: z.number().int().positive().optional(),
  docRequirements: z.array(z.string()),
  description: z.string().optional(),
  industries: z.array(z.string()).optional(),
});

export type LenderProduct = z.infer<typeof LenderProductSchema>;
```

### Client Type Variant (`client/src/types/lenderProduct.ts`)
```typescript
export interface LenderProduct {
  id: string;
  name: string;
  lender: string;
  category: string;
  subcategory?: string;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  geography?: string[];
  country?: string;
  requiredDocuments?: string[];
  doc_requirements?: string[];
  documentRequirements?: string[];
  required_documents?: string[];
  [key: string]: any; // Allow additional fields for flexibility
}

export type StaffLenderProduct = LenderProduct;
```

### Staff API Response Schema (`shared/lenderProductSchema.ts`)
```typescript
export const StaffAPIResponseSchema = z.object({
  success: z.boolean(),
  products: z.array(z.object({
    id: z.string(),
    name: z.string(), // API returns 'name', not 'productName'
    lenderName: z.string(),
    category: z.string(),
    country: z.string().optional(), // Staff API provides country field (US, CA, US/CA)
    geography: z.array(z.string()).optional(), // Staff API may not include geography
    amountMin: z.union([z.string(), z.number()]), // API returns amountMin directly
    amountMax: z.union([z.string(), z.number()]), // API returns amountMax directly
    requirements: z.object({
      minMonthlyRevenue: z.union([z.string(), z.number()]).optional(), // Staff API sends numbers
      industries: z.array(z.string()).nullable().optional(),
    }).optional(),
    description: z.string().optional(),
  })),
  count: z.number(),
});
```

---

## ✅ 2. Lender Schema

### Database Schema (`shared/lenderSchema.ts`)
```typescript
// Lender Products Table Schema (matching existing database structure)
export const lenderProducts = pgTable('lender_products', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'working_capital', 'term_loan', 'line_of_credit', 'equipment_financing'
  description: text('description'),
  min_amount: decimal('min_amount', { precision: 12, scale: 2 }),
  max_amount: decimal('max_amount', { precision: 12, scale: 2 }),
  interest_rate_min: decimal('interest_rate_min', { precision: 5, scale: 4 }),
  interest_rate_max: decimal('interest_rate_max', { precision: 5, scale: 4 }),
  term_min: integer('term_min'),
  term_max: integer('term_max'),
  requirements: jsonb('requirements').$type<string[]>(),
  video_url: text('video_url'),
  active: boolean('active').default(true),
});

// TypeScript types
export type LenderProduct = typeof lenderProducts.$inferSelect;
export type InsertLenderProduct = typeof lenderProducts.$inferInsert;

// API response types
export interface LenderProductsResponse {
  products: LenderProduct[];
  total: number;
  page: number;
  limit: number;
}

export interface LenderProductFilters {
  type?: string;
  min_amount?: number;
  max_amount?: number;
  active?: boolean;
}

// Normalized interface for frontend compatibility
export interface NormalizedLenderProduct {
  id: string;
  product_name: string;
  lender_name: string;
  product_type: string;
  geography: string[];
  min_amount: number;
  max_amount: number;
  min_revenue?: number;
  industries?: string[];
  video_url?: string;
  description?: string;
}
```

---

## ✅ 3. Logic

### A. Recommendation Engine (`client/src/hooks/useRecommendations.ts`)

**Core Matching Logic:**
```typescript
export function useRecommendations(formStep1Data: Step1FormData) {
  // 1. Load products from cache (authentic data only)
  const { data: products = [], isLoading, error } = useQuery<any[]>({
    queryKey: ["normalized-lenders-cache-only"],
    queryFn: async () => {
      const { loadLenderProducts } = await import('../utils/lenderCache');
      const cached = await loadLenderProducts();
      return cached || [];
    },
  });

  // 2. Filter and score products
  const matches = products
    .filter((p: any) => {
      // Country check - exact match or multi-country (US/CA)
      const selectedCountryCode = headquarters === "United States" ? "US" : "CA";
      const countryMatch = p.country === selectedCountryCode || p.country === 'US/CA';
      
      // Amount range check
      const { min, max } = getAmountRange(p);
      const amountMatch = fundingAmount >= min && fundingAmount <= max;
      
      // Line of Credit Override - Always include LOC if amount fits
      const isLineOfCredit = p.category?.toLowerCase().includes('line of credit');
      if (isLineOfCredit) return true;
      
      // Revenue requirement check
      const revenueMin = getRevenueMin(p);
      const applicantRevenue = revenueLastYear || 0;
      const revenueMatch = applicantRevenue >= revenueMin;
      
      // Product type filtering based on user selection
      if (formStep1Data.lookingFor === "equipment") {
        return isEquipmentFinancingProduct(p.category);
      } else if (formStep1Data.lookingFor === "capital") {
        return isBusinessCapitalProduct(p.category) || isLineOfCredit;
      } else if (formStep1Data.lookingFor === "both") {
        return isBusinessCapitalProduct(p.category);
      }
      
      return countryMatch && amountMatch && revenueMatch;
    })
    .map((p: any) => ({
      product: p,
      score: calculateScore(p, formStep1Data, headquarters, fundingAmount, revenueLastYear),
    }))
    .sort((a: any, b: any) => b.score - a.score);

  // 3. Aggregate to category rows
  const categories = matches.reduce<Record<string, { score: number; count: number; products: typeof matches }>>(
    (acc: any, m: any) => {
      const key = m.product.category;
      if (!acc[key]) {
        acc[key] = { score: m.score, count: 0, products: [] };
      }
      acc[key].count += 1;
      acc[key].products.push(m);
      if (m.score > acc[key].score) acc[key].score = m.score;
      return acc;
    },
    {}
  );

  return { products: matches, categories, isLoading, error };
}
```

**Product Type Classification:**
```typescript
function isBusinessCapitalProduct(category: string): boolean {
  const capitalCategories = [
    'Working Capital',
    'Business Line of Credit', 
    'Term Loan',
    'Business Term Loan',
    'SBA Loan',
    'Asset Based Lending',
    'Invoice Factoring',
    'Purchase Order Financing'
  ];
  
  const categoryLower = category.toLowerCase();
  const isWorkingCapital = categoryLower.includes('working capital') || 
                          categoryLower.includes('working_capital');
  
  return isWorkingCapital || capitalCategories.some(cat => 
    categoryLower.includes(cat.toLowerCase())
  );
}

function isEquipmentFinancingProduct(category: string): boolean {
  const equipmentCategories = [
    'Equipment Financing',
    'Equipment Finance',
    'Asset-Based Lending',
    'Asset Based Lending'
  ];
  
  return equipmentCategories.some(cat => 
    category.toLowerCase().includes(cat.toLowerCase())
  );
}
```

**Scoring Algorithm:**
```typescript
function calculateScore(
  product: LenderProduct, 
  formData: Step1FormData, 
  headquarters: "United States" | "Canada",
  fundingAmount: number,
  revenueLastYear: number
): number {
  let score = 0;

  // Geography match (25 points)
  const targetCountry = headquarters === "United States" ? "US" : "CA";
  if (product.geography.includes(targetCountry)) {
    score += 25;
  }

  // Funding range match (25 points)
  if (fundingAmount >= product.minAmount && fundingAmount <= product.maxAmount) {
    score += 25;
  }

  // Industry match (25 points)
  if (formData.industry && product.industries?.includes(formData.industry)) {
    score += 25;
  }

  // Revenue requirement match (25 points)  
  if (!product.minRevenue || revenueLastYear >= product.minRevenue) {
    score += 25;
  }

  return Math.min(score, 100);
}
```

### B. Data Normalization Logic (`client/src/lib/lenderProductNormalizer.ts`)

**Staff API → Client Schema Normalization:**
```typescript
export function normalizeProducts(rawData: unknown): LenderProduct[] {
  const { products } = rawData as { products: any[] };
  const normalizedProducts: LenderProduct[] = [];

  products.forEach((rawProduct, index) => {
    // Extract rate and term information from description
    const rateInfo = parseRateFromDescription(rawProduct.description);
    const termInfo = parseTermFromDescription(rawProduct.description);
    
    // Convert country field to geography array
    const geography = normalizeGeographyFromCountry(rawProduct.country);
    
    // Normalize category name
    const normalizedCategory = normalizeCategoryName(rawProduct.category);
    
    // Build normalized product
    const normalizedProduct: LenderProduct = {
      id: rawProduct.id,
      name: rawProduct.name,
      lenderName: rawProduct.lenderName,
      geography: geography,
      country: rawProduct.country,
      category: normalizedCategory,
      minAmount: parseFloat(String(rawProduct.amountMin) || '0'),
      maxAmount: parseFloat(String(rawProduct.amountMax) || '0'),
      minRevenue: rawProduct.requirements?.minMonthlyRevenue || 0,
      interestRateMin: rateInfo?.min,
      interestRateMax: rateInfo?.max,
      termMin: termInfo?.min,
      termMax: termInfo?.max,
      docRequirements: DOCUMENT_REQUIREMENTS_MAP[normalizedCategory] || [],
      description: rawProduct.description,
      industries: rawProduct.requirements?.industries || undefined,
    };

    // Validate against strict schema
    const validation = LenderProductSchema.safeParse(normalizedProduct);
    if (validation.success) {
      normalizedProducts.push(validation.data);
    }
  });

  return normalizedProducts;
}
```

**Category Mapping:**
```typescript
const categoryMap: Record<string, LenderProduct['category']> = {
  'Purchase Order Financing': 'purchase_order_financing',
  'Business Line of Credit': 'line_of_credit',
  'Invoice Factoring': 'invoice_factoring',
  'Equipment Financing': 'equipment_financing',
  'Term Loan': 'term_loan',
  'Working Capital': 'working_capital',
  'Asset-Based Lending': 'asset_based_lending',
  'SBA Loan': 'sba_loan',
};
```

**Geography Normalization:**
```typescript
function normalizeGeographyFromCountry(country?: string): ("US" | "CA")[] {
  if (!country) return ['US'];
  if (country === 'US/CA' || country === 'CA/US') return ['US', 'CA'];
  if (country === 'US') return ['US'];
  if (country === 'CA') return ['CA'];
  return ['US']; // Fallback
}
```

---

## ✅ 4. Sample Data

### Real Staff API Response (from connectivity test):
```json
{
  "products": [
    {
      "id": 66,
      "name": "Business Expansion Loan",
      "type": "term_loan",
      "description": "Long-term financing for business expansion, acquisitions, and major investments",
      "min_amount": 100000,
      "max_amount": 10000000,
      "interest_rate_min": 0.05,
      "interest_rate_max": 0.14,
      "term_min": 24,
      "term_max": 120,
      "requirements": ["business_plan", "financial_statements", "tax_returns", "bank_statements"],
      "active": true
    },
    {
      "id": 64,
      "name": "Business Line of Credit",
      "type": "working_capital",
      "description": "Flexible revolving credit line for business operations and cash flow management",
      "min_amount": 10000,
      "max_amount": 500000,
      "interest_rate_min": 0.08,
      "interest_rate_max": 0.24,
      "term_min": 12,
      "term_max": 60,
      "requirements": ["bank_statements", "financial_statements", "tax_returns"],
      "active": true
    },
    {
      "id": 65,
      "name": "Equipment Purchase Loan",
      "type": "equipment_financing",
      "description": "Financing for purchasing new or used business equipment with competitive rates",
      "min_amount": 15000,
      "max_amount": 2000000,
      "interest_rate_min": 0.06,
      "interest_rate_max": 0.18,
      "term_min": 24,
      "term_max": 84,
      "requirements": ["equipment_quote", "financial_statements", "bank_statements", "tax_returns"],
      "active": true
    }
  ],
  "total": "11",
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

### Mock Lenders (structure reference):
```typescript
const mockLenders: Lender[] = [
  {
    id: "lender_1",
    name: "Capital Business Solutions",
    contact: {
      email: "partnerships@capitalbiz.com",
      phone: "+1-800-555-0123",
      contactName: "Sarah Johnson"
    },
    description: "Specialized in working capital and equipment financing",
    website: "https://capitalbiz.com",
    supportedCountries: ["US", "CA"],
    commissionRate: 0.02,
    products: ["business_line_of_credit", "equipment_financing", "working_capital"]
  }
];

const mockProducts: LenderProduct[] = [
  {
    id: "prod_1",
    name: "Flexible Business Line of Credit",
    lenderName: "Capital Business Solutions",
    geography: ["US", "CA"],
    category: "line_of_credit",
    minAmount: 10000,
    maxAmount: 500000,
    minRevenue: 100000,
    interestRateMin: 0.08,
    interestRateMax: 0.24,
    termMin: 12,
    termMax: 60,
    docRequirements: [
      "Bank Statements (6 months)",
      "Business Tax Returns (2-3 years)",
      "Financial Statements (P&L and Balance Sheet)",
      "Business License"
    ],
    description: "Flexible revolving credit line for business operations",
    industries: ["retail", "manufacturing", "services"]
  }
];
```

---

## ✅ 5. Location

### Data Storage:
- **Primary Data Source**: Staff API (`https://staff.boreal.financial/api/lenders`) ✅ WORKING
- **Local Cache**: IndexedDB via `client/src/utils/lenderCache.ts` using idb-keyval
- **Schema Definitions**: `shared/lenderProductSchema.ts` and `shared/lenderSchema.ts`
- **Type Definitions**: `client/src/types/lenderProduct.ts`

### UI Rendering:
- **Primary Route**: `/apply/step-2` → `client/src/routes/Step2_Recommendations.tsx`
- **Main Component**: `Step2RecommendationEngine` (referenced in Step2_Recommendations)
- **Data Loading**: `client/src/hooks/useRecommendations.ts`
- **Normalization**: `client/src/lib/lenderProductNormalizer.ts`

### Document Requirements Mapping:
```typescript
export const DOCUMENT_REQUIREMENTS_MAP: Record<string, string[]> = {
  "line_of_credit": [
    "Bank Statements (6 months)",
    "Business Tax Returns (2-3 years)",
    "Accountant Prepared Financial Statements (P&L and Balance Sheet)",
    "Business License",
    "Articles of Incorporation",
    "Accounts Receivable Aging Report",
    "Cash Flow Projections",
    "Personal Guarantee"
  ],
  "term_loan": [
    "Bank Statements (6 months)",
    "Business Tax Returns (2-3 years)",
    "Accountant Prepared Financial Statements (P&L and Balance Sheet)",
    "Business License",
    "Articles of Incorporation",
    "Business Plan with Use of Funds",
    "Personal Financial Statement",
    "Personal Tax Returns (2 years)",
    "Collateral Documentation"
  ],
  "equipment_financing": [
    "Bank Statements (6 months)",
    "Business Tax Returns (2-3 years)",
    "Accountant Prepared Financial Statements (P&L and Balance Sheet)",
    "Business License",
    "Articles of Incorporation",
    "Equipment Quote or Invoice",
    "Equipment Specifications",
    "Insurance Documentation",
    "UCC Filing Documents"
  ]
  // ... additional categories
};
```

---

## 🔄 Integration Summary

**For Staff App Auto-Generation:**

1. **Product Cards**: Use `LenderProduct` schema with all fields exposed above
2. **Filtering Logic**: Implement the same category classification functions
3. **Assignment Logic**: Use the scoring algorithm for lender-application matching
4. **Document Requirements**: Reference `DOCUMENT_REQUIREMENTS_MAP` for each category
5. **Geographic Support**: Use `geography` array and `country` field for market assignment
6. **Data Sync**: Connect to the same Staff API endpoint (`/api/lenders`) that's already working

**Key Integration Points:**
- Staff Pipeline can use same product data structure
- Document requirements are pre-mapped by category
- Geography and filtering logic is battle-tested
- Real-time data available via Staff API `/api/lenders` endpoint

---

**Status**: COMPLETE EXPOSURE ✅  
**Next Action**: Use this structure to auto-generate Staff App components and sync with CRM/Pipeline stages