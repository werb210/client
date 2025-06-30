import { Router } from 'express';

const router = Router();

// Get loan product categories based on filters
router.get('/categories', async (req, res) => {
  try {
    const { country, lookingFor, accountsReceivableBalance, fundingAmount, fundsPurpose } = req.query;

    // Mock category data based on filters for demonstration
    const mockCategories = [
      {
        category: 'Term Loan',
        count: 15,
        percentage: 35,
        matchScore: 85,
        products: []
      },
      {
        category: 'Line of Credit',
        count: 12,
        percentage: 28,
        matchScore: 78,
        products: []
      },
      {
        category: 'Equipment Financing',
        count: 8,
        percentage: 18,
        matchScore: 72,
        products: []
      },
      {
        category: 'Working Capital',
        count: 8,
        percentage: 19,
        matchScore: 69,
        products: []
      }
    ];

    // Filter categories based on lookingFor parameter
    let filteredCategories = mockCategories;
    if (lookingFor === 'equipment') {
      filteredCategories = mockCategories.filter(cat => 
        cat.category.toLowerCase().includes('equipment')
      );
    } else if (lookingFor === 'capital') {
      filteredCategories = mockCategories.filter(cat => 
        !cat.category.toLowerCase().includes('equipment')
      );
    }

    res.json({
      categories: filteredCategories,
      totalProducts: filteredCategories.reduce((sum, cat) => sum + cat.count, 0),
      filters: { country, lookingFor, accountsReceivableBalance, fundingAmount, fundsPurpose }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get required documents for a specific loan category
router.get('/required-documents/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { fundingAmount, country, lookingFor, accountsReceivableBalance } = req.query;

    // Define document requirements by category
    const documentRequirements: { [key: string]: any } = {
      term_loan: {
        category: 'Term Loan',
        requirements: [
          {
            name: "Bank Statements",
            description: "Recent 6 months of business bank statements",
            quantity: 1,
            required: true,
            examples: ["Monthly bank statements", "Account summaries", "Transaction records"]
          },
          {
            name: "Financial Statements",
            description: "Profit & Loss statement and Balance Sheet",
            quantity: 1,
            required: true,
            examples: ["Income statement", "Balance sheet", "Cash flow statement"]
          },
          {
            name: "Tax Returns",
            description: "Business tax returns for previous 2 years",
            quantity: 2,
            required: true,
            examples: ["Corporate tax returns", "Business income tax", "CRA/IRS filings"]
          },
          {
            name: "Business License",
            description: "Current business registration and operating licenses",
            quantity: 1,
            required: true,
            examples: ["Business registration certificate", "Operating license", "Professional licenses"]
          }
        ]
      },
      line_of_credit: {
        category: 'Line of Credit',
        requirements: [
          {
            name: "Bank Statements",
            description: "Recent 3-6 months of business bank statements",
            quantity: 1,
            required: true,
            examples: ["Monthly bank statements", "Daily balance reports", "Transaction summaries"]
          },
          {
            name: "Accounts Receivable Aging",
            description: "Current accounts receivable aging report",
            quantity: 1,
            required: true,
            examples: ["AR aging report", "Outstanding invoices", "Customer payment history"]
          },
          {
            name: "Financial Statements",
            description: "Recent financial statements",
            quantity: 1,
            required: true,
            examples: ["Profit & Loss statement", "Balance sheet", "Cash flow statement"]
          },
          {
            name: "Business License",
            description: "Current business registration",
            quantity: 1,
            required: true,
            examples: ["Business registration certificate", "Operating license"]
          }
        ]
      },
      equipment_financing: {
        category: 'Equipment Financing',
        requirements: [
          {
            name: "Equipment Quote",
            description: "Detailed quote or invoice for equipment purchase",
            quantity: 1,
            required: true,
            examples: ["Equipment purchase quote", "Vendor invoice", "Equipment specification sheet"]
          },
          {
            name: "Bank Statements",
            description: "Recent 3 months of business bank statements",
            quantity: 1,
            required: true,
            examples: ["Monthly bank statements", "Account summaries"]
          },
          {
            name: "Financial Statements",
            description: "Business financial statements",
            quantity: 1,
            required: true,
            examples: ["Profit & Loss statement", "Balance sheet"]
          },
          {
            name: "Business License",
            description: "Current business registration",
            quantity: 1,
            required: true,
            examples: ["Business registration certificate", "Operating license"]
          }
        ]
      },
      working_capital: {
        category: 'Working Capital',
        requirements: [
          {
            name: "Bank Statements",
            description: "Recent 6 months of business bank statements",
            quantity: 1,
            required: true,
            examples: ["Monthly bank statements", "Account summaries", "Transaction records"]
          },
          {
            name: "Financial Statements",
            description: "Recent financial statements including cash flow",
            quantity: 1,
            required: true,
            examples: ["Profit & Loss statement", "Balance sheet", "Cash flow statement"]
          },
          {
            name: "Tax Returns",
            description: "Business tax returns for previous year",
            quantity: 1,
            required: true,
            examples: ["Corporate tax returns", "Business income tax"]
          },
          {
            name: "Business License",
            description: "Current business registration",
            quantity: 1,
            required: true,
            examples: ["Business registration certificate", "Operating license"]
          }
        ]
      },
      invoice_factoring: {
        category: 'Invoice Factoring',
        requirements: [
          {
            name: "Accounts Receivable Aging",
            description: "Current accounts receivable aging report",
            quantity: 1,
            required: true,
            examples: ["AR aging report", "Outstanding invoices", "Customer payment history"]
          },
          {
            name: "Sample Invoices",
            description: "Recent invoices to be factored",
            quantity: 3,
            required: true,
            examples: ["Customer invoices", "Service invoices", "Product invoices"]
          },
          {
            name: "Bank Statements",
            description: "Recent 3 months of business bank statements",
            quantity: 1,
            required: true,
            examples: ["Monthly bank statements", "Account summaries"]
          },
          {
            name: "Business License",
            description: "Current business registration",
            quantity: 1,
            required: true,
            examples: ["Business registration certificate", "Operating license"]
          }
        ]
      }
    };

    // Get requirements for the specified category
    const categoryRequirements = documentRequirements[category] || documentRequirements.term_loan;

    // Add conditional requirements based on funding amount
    if (fundingAmount && parseInt(fundingAmount as string) > 500000) {
      categoryRequirements.requirements.push({
        name: "CPA Prepared Statements",
        description: "CPA prepared financial statements for loans over $500K",
        quantity: 1,
        required: true,
        examples: ["CPA compiled statements", "Audited financial statements", "Reviewed statements"]
      });
    }

    // Add AR-specific requirements if AR balance exists
    if (accountsReceivableBalance && parseInt(accountsReceivableBalance as string) > 0) {
      const hasArRequirement = categoryRequirements.requirements.some(
        (req: any) => req.name.toLowerCase().includes('receivable')
      );
      
      if (!hasArRequirement) {
        categoryRequirements.requirements.push({
          name: "Accounts Receivable Report",
          description: "Detailed accounts receivable report",
          quantity: 1,
          required: false,
          examples: ["AR aging report", "Customer payment history", "Outstanding invoices"]
        });
      }
    }

    res.json(categoryRequirements);
  } catch (error) {
    console.error('Error fetching document requirements:', error);
    res.status(500).json({ error: 'Failed to fetch document requirements' });
  }
});

// Get document upload status and completion tracking
router.get('/document-status/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    // In a real implementation, this would fetch from a documents table
    // For now, return a mock status structure
    res.json({
      applicationId,
      totalRequired: 4,
      totalUploaded: 0,
      completionPercentage: 0,
      documents: [],
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching document status:', error);
    res.status(500).json({ error: 'Failed to fetch document status' });
  }
});

// Validate document upload
router.post('/validate-document', async (req, res) => {
  try {
    const { fileName, fileSize, fileType, documentCategory } = req.body;

    // Basic validation rules
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    const validation = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    // File size validation
    if (fileSize > maxFileSize) {
      validation.isValid = false;
      validation.errors.push('File size exceeds 10MB limit');
    }

    // File type validation
    if (!allowedTypes.includes(fileType)) {
      validation.isValid = false;
      validation.errors.push('File type not supported. Please use PDF, DOC, DOCX, JPG, or PNG');
    }

    // File name validation
    if (!fileName || fileName.length < 3) {
      validation.isValid = false;
      validation.errors.push('Invalid file name');
    }

    // Category-specific validations
    if (documentCategory === 'bank_statements' && !fileName.toLowerCase().includes('bank')) {
      validation.warnings.push('File name should indicate it\'s a bank statement');
    }

    res.json(validation);
  } catch (error) {
    console.error('Error validating document:', error);
    res.status(500).json({ error: 'Failed to validate document' });
  }
});

export default router;