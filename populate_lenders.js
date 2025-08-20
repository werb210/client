#!/usr/bin/env node
/**
 * Populate database with sample lender products for testing
 */

import { db } from './server/db.js';
import { lenderProducts } from './shared/lenderSchema.js';

const sampleLenderProducts = [
  // Working Capital Products
  {
    name: "Business Line of Credit",
    type: "working_capital",
    description: "Flexible revolving credit line for business operations and cash flow management",
    min_amount: "10000",
    max_amount: "500000",
    interest_rate_min: "0.08",
    interest_rate_max: "0.24",
    term_min: 12,
    term_max: 60,
    requirements: ["bank_statements", "financial_statements", "tax_returns"],
    video_url: null,
    active: true
  },
  {
    name: "Cash Flow Financing", 
    type: "working_capital",
    description: "Short-term funding based on outstanding invoices and cash flow projections",
    min_amount: "25000",
    max_amount: "1000000", 
    interest_rate_min: "0.12",
    interest_rate_max: "0.28",
    term_min: 3,
    term_max: 24,
    requirements: ["bank_statements", "accounts_receivable_aging", "financial_statements"],
    video_url: null,
    active: true
  },

  // Equipment Financing Products
  {
    name: "Equipment Purchase Loan",
    type: "equipment_financing", 
    description: "Financing for purchasing new or used business equipment with competitive rates",
    min_amount: "15000",
    max_amount: "2000000",
    interest_rate_min: "0.06",
    interest_rate_max: "0.18",
    term_min: 24,
    term_max: 84,
    requirements: ["equipment_quote", "financial_statements", "bank_statements", "tax_returns"],
    video_url: null,
    active: true
  },
  {
    name: "Construction Equipment Finance",
    type: "equipment_financing",
    description: "Specialized financing for heavy machinery and construction equipment",
    min_amount: "50000", 
    max_amount: "5000000",
    interest_rate_min: "0.07",
    interest_rate_max: "0.16",
    term_min: 36,
    term_max: 96,
    requirements: ["equipment_quote", "financial_statements", "project_contracts", "insurance_docs"],
    video_url: null,
    active: true
  },

  // Term Loans
  {
    name: "Business Expansion Loan",
    type: "term_loan",
    description: "Long-term financing for business expansion, acquisitions, and major investments",
    min_amount: "100000",
    max_amount: "10000000",
    interest_rate_min: "0.05",
    interest_rate_max: "0.14", 
    term_min: 24,
    term_max: 120,
    requirements: ["business_plan", "financial_statements", "tax_returns", "bank_statements", "collateral_docs"],
    video_url: null,
    active: true
  },
  {
    name: "Commercial Real Estate Loan",
    type: "term_loan",
    description: "Financing for purchasing or refinancing commercial real estate properties",
    min_amount: "250000",
    max_amount: "25000000",
    interest_rate_min: "0.04",
    interest_rate_max: "0.10",
    term_min: 60,
    term_max: 300,
    requirements: ["property_appraisal", "environmental_report", "financial_statements", "rent_roll"],
    video_url: null, 
    active: true
  },

  // SBA Loans
  {
    name: "SBA 7(a) Business Loan", 
    type: "sba_loan",
    description: "Government-backed SBA loan for business acquisitions, equipment, and working capital",
    min_amount: "50000",
    max_amount: "5000000",
    interest_rate_min: "0.045",
    interest_rate_max: "0.12",
    term_min: 60,
    term_max: 300,
    requirements: ["sba_forms", "personal_financial_statement", "business_tax_returns", "business_plan"],
    video_url: null,
    active: true
  },
  {
    name: "SBA Express Loan",
    type: "sba_loan", 
    description: "Fast-track SBA loan with quicker approval process for smaller amounts",
    min_amount: "25000",
    max_amount: "500000",
    interest_rate_min: "0.05",
    interest_rate_max: "0.135",
    term_min: 12,
    term_max: 120,
    requirements: ["sba_express_forms", "financial_statements", "bank_statements"],
    video_url: null,
    active: true
  },

  // Invoice Factoring
  {
    name: "Invoice Factoring",
    type: "factoring",
    description: "Advance funding against outstanding invoices with quick approval",
    min_amount: "10000",
    max_amount: "2000000",
    interest_rate_min: "0.15",
    interest_rate_max: "0.35",
    term_min: 1,
    term_max: 6,
    requirements: ["invoice_copies", "customer_credit_check", "aging_reports"],
    video_url: null,
    active: true
  },

  // Merchant Cash Advance
  {
    name: "Merchant Cash Advance",
    type: "merchant_cash_advance",
    description: "Fast funding based on future credit card sales and daily revenue",
    min_amount: "5000", 
    max_amount: "500000",
    interest_rate_min: "0.20",
    interest_rate_max: "0.50",
    term_min: 3,
    term_max: 18,
    requirements: ["credit_card_processing_statements", "bank_statements"],
    video_url: null,
    active: true
  },

  // Line of Credit Products
  {
    name: "Revolving Credit Facility",
    type: "line_of_credit",
    description: "Flexible credit line that can be drawn upon and repaid as needed",
    min_amount: "20000",
    max_amount: "1000000", 
    interest_rate_min: "0.07",
    interest_rate_max: "0.22",
    term_min: 12,
    term_max: 60,
    requirements: ["financial_statements", "bank_statements", "collateral_evaluation"],
    video_url: null,
    active: true
  }
];

async function populateDatabase() {
  console.log('🔄 Populating database with sample lender products...');
  
  try {
    // Clear existing data
    await db.delete(lenderProducts);
    console.log('🧹 Cleared existing products');
    
    // Insert sample data
    for (const product of sampleLenderProducts) {
      await db.insert(lenderProducts).values(product);
    }
    
    console.log(`✅ Successfully inserted ${sampleLenderProducts.length} lender products`);
    
    // Verify insertion
    const count = await db.select().from(lenderProducts);
    console.log(`📊 Database now contains ${count.length} products`);
    
    // Show summary by type
    const summary = {};
    count.forEach(p => {
      summary[p.type] = (summary[p.type] || 0) + 1;
    });
    
    console.log('\n📈 Products by type:');
    Object.entries(summary).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} products`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Failed to populate database:', error);
    process.exit(1);
  }
}

populateDatabase();