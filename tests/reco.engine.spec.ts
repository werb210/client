import { test, expect } from '@playwright/test';

// Import the actual recommendation engine
import { getProductRecommendations, type LenderProduct, type RecommendationFilters } from '../client/src/lib/strictRecommendationEngine';

test('engine selects eligible product based on amount & country', async () => {
  const products: LenderProduct[] = [
    { 
      id:'p1', 
      name:'US Term Loan', 
      lender:'TestLender1',
      category:'term_loan',
      country:'US', 
      minAmount:10000, 
      maxAmount:250000, 
      isActive:true 
    },
    { 
      id:'p2', 
      name:'CA Working Capital', 
      lender:'TestLender2',
      category:'working_capital',
      country:'CA', 
      minAmount:5000,  
      maxAmount:75000,  
      isActive:true 
    },
    { 
      id:'p3', 
      name:'Inactive Product', 
      lender:'TestLender3',
      category:'term_loan',
      country:'US', 
      minAmount:1000, 
      maxAmount:10000, 
      isActive:false 
    },
  ];

  const filtersUS: RecommendationFilters = { 
    country:'US', 
    fundingAmount:50000,
    lookingFor:'capital'
  };
  const filtersCA: RecommendationFilters = { 
    country:'CA', 
    fundingAmount:30000,
    lookingFor:'capital'
  };
  const filtersTooHigh: RecommendationFilters = { 
    country:'CA', 
    fundingAmount:999999,
    lookingFor:'capital'
  };

  // Test US recommendation
  const pickUS = getProductRecommendations(products, filtersUS);
  expect(pickUS.length).toBeGreaterThan(0);
  expect(pickUS[0].product.id).toBe('p1');
  expect(pickUS[0].product.country).toBe('US');

  // Test CA recommendation
  const pickCA = getProductRecommendations(products, filtersCA);
  expect(pickCA.length).toBeGreaterThan(0);
  expect(pickCA[0].product.id).toBe('p2');
  expect(pickCA[0].product.country).toBe('CA');

  // Test no matches (amount too high)
  const pickFail = getProductRecommendations(products, filtersTooHigh);
  expect(pickFail.length).toBe(0);

  // Test that inactive products are excluded
  const activeProducts = getProductRecommendations(products, filtersUS);
  const inactiveIncluded = activeProducts.some(r => !r.product.isActive);
  expect(inactiveIncluded).toBe(false);
});