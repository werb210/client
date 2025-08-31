import { describe, it, expect } from 'vitest';
import { normalizeProducts } from '@/lib/products/normalize';
import { recommend } from '@/lib/reco/engine';
import { eligibleProductsForDocs, computeRequiredDocs } from '@/lib/docs/requirements';
import { allRequiredDocsComplete } from '@/lib/docs/validate';

it('recommend + docs union follows rules', () => {
  const raw = [
    {id:'p1', country:'US', amount_min:10000, amount_max:250000, category:'term_loan', active:1},
    {id:'p2', country:'US', amount_min:5000,  amount_max:75000,  category:'equipment_financing', active:1},
  ];
  const products = normalizeProducts(raw);
  const filters = { country:'US', fundingAmount:50000, productPreference:'both', estRevenue:100000, hasAR:false, purpose:'general' };
  const ranked = recommend(products, filters);
  expect(ranked.length).toBeGreaterThan(0);

  const elig = eligibleProductsForDocs(products, { country:'US', fundingAmount:50000, productPreference:'both' });
  const reqDocs = computeRequiredDocs({
    country:'US', fundingAmount:50000, productPreference:'both',
    structure:'llc', owners:[{name:'A', ownershipPct:60, hasSSN:true}],
    hasSSN:true, hasAR:false, purpose:'general'
  }, elig);
  const { ok, missing } = allRequiredDocsComplete(reqDocs, { bank_statements_6m:'uploaded', tax_returns_3y:'uploaded', financials_pl_bs:'uploaded',
    business_license:'uploaded', articles_of_incorporation:'uploaded', operating_agreement:'uploaded', articles_of_organization:'uploaded',
    member_resolution:'uploaded', personal_guarantee:'uploaded', personal_financial_statement:'uploaded', credit_report_auth:'uploaded',
    driver_license:'uploaded', ssn_card_copy:'uploaded' });
  expect(ok).toBe(true);
  expect(missing.length).toBe(0);
});