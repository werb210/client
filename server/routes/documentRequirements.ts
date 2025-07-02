import { Router } from 'express';
import { db } from '../db';
import { lenderProducts } from '../../shared/lenderSchema';
import { eq, and, sql, isNotNull } from 'drizzle-orm';

const router = Router();

// Document requirements endpoint
router.get('/required-documents/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { headquarters = 'united_states', fundingAmount = '$50,000' } = req.query as { headquarters?: string; fundingAmount?: string };

    console.log(`🔍 FETCHING DOCUMENT REQUIREMENTS:`, { category, headquarters, fundingAmount });

    // Build filter conditions
    const conditions = [
      eq(lenderProducts.active, true),
      eq(lenderProducts.type, category),
      isNotNull(lenderProducts.requirements)
    ];

    // Execute query to get document requirements
    const results = await db
      .select({
        name: lenderProducts.name,
        requirements: lenderProducts.requirements
      })
      .from(lenderProducts)
      .where(and(...conditions))
      .limit(10);

    console.log(`📋 Found ${results.length} products with requirements for ${category}`);

    // Extract unique documents from all matching products
    const allDocs = new Set<string>();
    results.forEach(product => {
      if (product.requirements && Array.isArray(product.requirements)) {
        product.requirements.forEach((doc: string) => {
          if (doc && typeof doc === 'string') {
            allDocs.add(doc.trim());
          }
        });
      }
    });

    // Convert to required format with descriptions
    const documentRequirements = Array.from(allDocs).map(docName => ({
      name: docName,
      description: getDocumentDescription(docName, category),
      quantity: getDocumentQuantity(docName)
    }));

    // Fallback documents if no specific requirements found
    if (documentRequirements.length === 0) {
      console.log(`⚠️ No specific requirements found for ${category}, using fallback documents`);
      
      const fallbackDocs = getFallbackDocuments(category);
      res.json({ 
        success: true, 
        data: fallbackDocs,
        source: 'fallback',
        category,
        message: `No specific requirements found for ${category}. Using standard business loan documents.`
      });
      return;
    }

    console.log(`✅ Returning ${documentRequirements.length} document requirements for ${category}`);

    res.json({ 
      success: true, 
      data: documentRequirements,
      source: 'database',
      category,
      productsFound: results.length
    });

  } catch (error) {
    console.error('❌ Error fetching document requirements:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch document requirements',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to get document descriptions
function getDocumentDescription(docName: string, category: string): string {
  const descriptions: Record<string, string> = {
    'Bank Statements': 'Last 6 months of business bank statements',
    'Tax Returns': 'Business tax returns for last 2-3 years',
    'Financial Statements': 'Profit & Loss and Balance Sheet',
    'Business License': 'Current business registration and licenses',
    'Equipment Quotes': 'Quotes for equipment to be financed',
    'Invoice Samples': 'Recent customer invoices for factoring',
    'Accounts Receivable Aging': 'Current AR aging report',
    'Purchase Orders': 'Customer purchase orders',
    'Personal Financial Statement': 'Owner personal financial information',
    'Business Plan': 'Current business plan and projections',
    'Credit Report Authorization': 'Authorization for credit check',
    'Collateral Documentation': 'Documentation of business assets'
  };

  return descriptions[docName] || `Required for ${category} applications`;
}

// Helper function to determine document quantity needed
function getDocumentQuantity(docName: string): number {
  const quantities: Record<string, number> = {
    'Bank Statements': 6, // 6 months
    'Tax Returns': 3,     // 3 years
    'Financial Statements': 3, // 3 years
    'Invoice Samples': 10,     // 10 recent invoices
    'Equipment Quotes': 1,     // 1 quote minimum
    'Purchase Orders': 5       // 5 recent POs
  };

  return quantities[docName] || 1;
}

// Fallback documents by category
function getFallbackDocuments(category: string) {
  const fallbackMap: Record<string, any[]> = {
    'term_loan': [
      { name: "Bank Statements", description: "Last 6 months of business bank statements", quantity: 6 },
      { name: "Tax Returns", description: "Business tax returns for last 3 years", quantity: 3 },
      { name: "Financial Statements", description: "Profit & Loss and Balance Sheet", quantity: 3 },
      { name: "Business License", description: "Current business registration", quantity: 1 }
    ],
    'line_of_credit': [
      { name: "Bank Statements", description: "Last 6 months of business bank statements", quantity: 6 },
      { name: "Financial Statements", description: "Current P&L and Balance Sheet", quantity: 2 },
      { name: "Business License", description: "Current business registration", quantity: 1 }
    ],
    'equipment_financing': [
      { name: "Bank Statements", description: "Last 6 months of business bank statements", quantity: 6 },
      { name: "Equipment Quotes", description: "Quotes for equipment to be financed", quantity: 1 },
      { name: "Business License", description: "Current business registration", quantity: 1 },
      { name: "Tax Returns", description: "Business tax returns for last 2 years", quantity: 2 }
    ],
    'invoice_factoring': [
      { name: "Bank Statements", description: "Last 3 months of business bank statements", quantity: 3 },
      { name: "Invoice Samples", description: "Recent customer invoices", quantity: 10 },
      { name: "Accounts Receivable Aging", description: "Current AR aging report", quantity: 1 },
      { name: "Business License", description: "Current business registration", quantity: 1 }
    ],
    'working_capital': [
      { name: "Bank Statements", description: "Last 6 months of business bank statements", quantity: 6 },
      { name: "Tax Returns", description: "Business tax returns for last 2 years", quantity: 2 },
      { name: "Financial Statements", description: "Current P&L and Balance Sheet", quantity: 2 }
    ]
  };

  return fallbackMap[category] || fallbackMap['term_loan']; // Default to term loan requirements
}

export default router;