import { db } from '../server/db';
import { lenderProducts } from '../shared/lenderSchema';

const sampleLenderData = [
  {
    product_name: "Business Line of Credit",
    lender_name: "Capital One",
    product_type: "line_of_credit",
    geography: ["US", "CA"],
    min_amount: "10000",
    max_amount: "500000",
    min_revenue: "100000",
    industries: ["retail", "technology", "manufacturing", "healthcare"],
    interest_rate_min: "0.08",
    interest_rate_max: "0.18",
    term_months_min: 12,
    term_months_max: 60,
    description: "Flexible business line of credit for working capital needs with competitive rates",
    video_url: "https://www.capitalone.com/business/video-line-of-credit",
    application_url: "https://www.capitalone.com/business/line-of-credit/apply",
    requirements: ["Minimum 2 years in business", "Annual revenue $100,000+", "Personal credit score 650+"],
    features: ["Draw funds as needed", "Interest only on used amount", "Online account management"],
    is_active: true
  },
  {
    product_name: "Equipment Financing",
    lender_name: "Wells Fargo",
    product_type: "equipment_financing",
    geography: ["US"],
    min_amount: "25000",
    max_amount: "2000000",
    min_revenue: "250000",
    industries: ["construction", "manufacturing", "transportation", "agriculture"],
    interest_rate_min: "0.06",
    interest_rate_max: "0.15",
    term_months_min: 24,
    term_months_max: 84,
    description: "Finance new or used equipment for your business with competitive rates and flexible terms",
    video_url: "https://www.wellsfargo.com/business/equipment-financing-video",
    application_url: "https://www.wellsfargo.com/business/loans/equipment-financing/apply",
    requirements: ["Minimum 2 years in business", "Annual revenue $250,000+", "Equipment as collateral"],
    features: ["Up to 100% financing", "Fixed or variable rates", "Seasonal payment options"],
    is_active: true
  },
  {
    product_name: "SBA 7(a) Loan",
    lender_name: "Bank of America",
    product_type: "term_loan",
    geography: ["US"],
    min_amount: "50000",
    max_amount: "5000000",
    min_revenue: "500000",
    industries: ["retail", "professional_services", "manufacturing", "technology"],
    interest_rate_min: "0.055",
    interest_rate_max: "0.125",
    term_months_min: 60,
    term_months_max: 300,
    description: "SBA-backed term loan for business expansion, real estate, and working capital",
    video_url: "https://www.bankofamerica.com/business/sba-loans-video",
    application_url: "https://www.bankofamerica.com/business/loans/sba-loans/apply",
    requirements: ["SBA eligibility criteria", "Personal guarantee", "Down payment may be required"],
    features: ["Government backing", "Competitive rates", "Long repayment terms"],
    is_active: true
  },
  {
    product_name: "Business Term Loan",
    lender_name: "Bank of Montreal",
    product_type: "term_loan",
    geography: ["CA"],
    min_amount: "50000",
    max_amount: "1000000",
    min_revenue: "300000",
    industries: ["technology", "healthcare", "professional_services", "retail"],
    interest_rate_min: "0.07",
    interest_rate_max: "0.16",
    term_months_min: 12,
    term_months_max: 84,
    description: "Fixed-term business loan for expansion and growth with competitive Canadian rates",
    video_url: "https://www.bmo.com/business/term-loan-video",
    application_url: "https://www.bmo.com/business/loans/term-loan/apply",
    requirements: ["Minimum 2 years in business", "Strong credit history", "Business plan required"],
    features: ["Fixed interest rates", "Flexible repayment", "No prepayment penalties"],
    is_active: true
  },
  {
    product_name: "Working Capital Loan",
    lender_name: "TD Bank",
    product_type: "working_capital",
    geography: ["US", "CA"],
    min_amount: "25000",
    max_amount: "750000",
    min_revenue: "200000",
    industries: ["retail", "wholesale", "manufacturing", "services"],
    interest_rate_min: "0.075",
    interest_rate_max: "0.19",
    term_months_min: 6,
    term_months_max: 36,
    description: "Short-term financing for inventory, payroll, and operational expenses",
    video_url: "https://www.td.com/business/working-capital-video",
    application_url: "https://www.td.com/business/loans/working-capital/apply",
    requirements: ["Minimum 1 year in business", "Positive cash flow", "Asset-based lending"],
    features: ["Quick approval", "Seasonal flexibility", "Asset-based options"],
    is_active: true
  },
  {
    product_name: "Commercial Real Estate Loan",
    lender_name: "RBC Royal Bank",
    product_type: "commercial_real_estate",
    geography: ["CA"],
    min_amount: "100000",
    max_amount: "10000000",
    min_revenue: "1000000",
    industries: ["real_estate", "retail", "manufacturing", "professional_services"],
    interest_rate_min: "0.045",
    interest_rate_max: "0.095",
    term_months_min: 60,
    term_months_max: 300,
    description: "Finance commercial property purchase, refinancing, or construction projects",
    video_url: "https://www.rbc.com/business/commercial-real-estate-video",
    application_url: "https://www.rbc.com/business/loans/commercial-real-estate/apply",
    requirements: ["Property appraisal", "Down payment 20-30%", "Debt service coverage ratio 1.25+"],
    features: ["Competitive rates", "Flexible terms", "Construction options"],
    is_active: true
  },
  {
    product_name: "Merchant Cash Advance",
    lender_name: "OnDeck",
    product_type: "merchant_cash_advance",
    geography: ["US", "CA"],
    min_amount: "5000",
    max_amount: "250000",
    min_revenue: "100000",
    industries: ["retail", "restaurant", "services", "e-commerce"],
    interest_rate_min: "0.15",
    interest_rate_max: "0.35",
    term_months_min: 3,
    term_months_max: 18,
    description: "Fast funding based on future credit card sales with daily repayment",
    video_url: "https://www.ondeck.com/merchant-cash-advance-video",
    application_url: "https://www.ondeck.com/apply/merchant-cash-advance",
    requirements: ["$100k+ annual revenue", "Processing credit cards", "3+ months in business"],
    features: ["24-48 hour funding", "No fixed payments", "Based on sales volume"],
    is_active: true
  },
  {
    product_name: "Invoice Factoring",
    lender_name: "BlueVine",
    product_type: "invoice_factoring",
    geography: ["US"],
    min_amount: "1000",
    max_amount: "5000000",
    min_revenue: "120000",
    industries: ["manufacturing", "wholesale", "services", "transportation"],
    interest_rate_min: "0.005",
    interest_rate_max: "0.03",
    term_months_min: 1,
    term_months_max: 3,
    description: "Turn outstanding invoices into immediate cash flow with competitive factor rates",
    video_url: "https://www.bluevine.com/invoice-factoring-video",
    application_url: "https://www.bluevine.com/products/invoice-factoring/apply",
    requirements: ["B2B invoices", "Creditworthy customers", "Invoice aging less than 90 days"],
    features: ["Same-day funding", "No long-term contracts", "Credit protection"],
    is_active: true
  }
];

async function seedLenders() {
  try {
    console.log('Starting lender database seeding...');
    
    // Clear existing data
    await db.delete(lenderProducts);
    console.log('Cleared existing lender products');
    
    // Insert new data
    const insertedProducts = await db.insert(lenderProducts).values(sampleLenderData).returning();
    
    console.log(`Successfully seeded ${insertedProducts.length} lender products:`);
    insertedProducts.forEach(product => {
      console.log(`- ${product.lender_name}: ${product.product_name} (${product.product_type})`);
    });
    
    // Verify data
    const totalCount = await db.select().from(lenderProducts);
    console.log(`\nTotal products in database: ${totalCount.length}`);
    
    console.log('\nLender database seeding completed successfully!');
    
  } catch (error) {
    console.error('Failed to seed lender database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedLenders().then(() => {
  console.log('Seeding process finished');
  process.exit(0);
}).catch((error) => {
  console.error('Seeding process failed:', error);
  process.exit(1);
});