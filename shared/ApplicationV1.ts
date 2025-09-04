// shared/ApplicationV1.ts
export type CurrencyNumber = number; // store as number in cents or whole units—be consistent

export interface ApplicationV1 {
  applicationId?: string;
  // Step 1 – financial profile
  businessLocation?: string;
  headquarters?: string;
  headquartersState?: string;
  industry?: string;
  lookingFor?: 'capital' | 'equipment' | 'invoice_factoring' | string;
  fundingAmount?: CurrencyNumber;
  fundsPurpose?: string;
  salesHistory?: string;
  revenueLastYear?: CurrencyNumber;
  averageMonthlyRevenue?: CurrencyNumber;
  accountsReceivableBalance?: CurrencyNumber;
  fixedAssetsValue?: CurrencyNumber;
  equipmentValue?: CurrencyNumber;

  // Step 2 – user selection
  selectedCategory?: string | null;

  // …keep room for later fields
  [k: string]: unknown;
}