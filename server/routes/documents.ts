import express from 'express';
import { DocumentValidator, DocumentValidationResult } from '../documentValidator';

const router = express.Router();

// Validate single document endpoint
router.post('/validate', async (req, res) => {
  try {
    const { fileName, fileData, category, uploadedBy } = req.body;

    if (!fileName || !fileData || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields: fileName, fileData, category' 
      });
    }

    const validationResult = DocumentValidator.validateDocument(
      fileName, 
      fileData, 
      category, 
      uploadedBy || 'anonymous'
    );

    // Include security validation for sensitive documents
    const securityValidation = DocumentValidator.validateSensitiveDocument(
      fileName, 
      fileData, 
      category
    );

    res.json({
      validation: validationResult,
      security: securityValidation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Document validation error:', error);
    res.status(500).json({ error: 'Document validation failed' });
  }
});

// Validate multiple documents endpoint
router.post('/validate-batch', async (req, res) => {
  try {
    const { documents } = req.body;

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ 
        error: 'Documents array is required and must not be empty' 
      });
    }

    const batchValidation = DocumentValidator.validateDocumentSet(documents);

    // Generate validation metadata for transmission
    const metadata = DocumentValidator.generateValidationMetadata(batchValidation.results);

    res.json({
      ...batchValidation,
      metadata,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Batch document validation error:', error);
    res.status(500).json({ error: 'Batch document validation failed' });
  }
});

// Get document requirements by application type
router.get('/requirements/:applicationType', (req, res) => {
  try {
    const { applicationType } = req.params;

    const documentRequirements: Record<string, Array<{
      category: string;
      displayName: string;
      required: boolean;
      description: string;
      acceptedFormats: string[];
      minSize: number;
      maxSize: number;
    }>> = {
      'business_loan': [
        {
          category: 'bank_statements',
          displayName: 'Bank Statements',
          required: true,
          description: 'Last 3 months of business bank statements',
          acceptedFormats: ['.pdf', '.png', '.jpg', '.jpeg'],
          minSize: 50000,
          maxSize: 10485760
        },
        {
          category: 'tax_returns',
          displayName: 'Tax Returns',
          required: true,
          description: 'Last 2 years of business tax returns',
          acceptedFormats: ['.pdf'],
          minSize: 100000,
          maxSize: 20971520
        },
        {
          category: 'financial_statements',
          displayName: 'Financial Statements',
          required: true,
          description: 'Profit & Loss, Balance Sheet for last 2 years',
          acceptedFormats: ['.pdf', '.xlsx', '.xls'],
          minSize: 30000,
          maxSize: 10485760
        },
        {
          category: 'business_license',
          displayName: 'Business License',
          required: true,
          description: 'Current business registration or license',
          acceptedFormats: ['.pdf', '.png', '.jpg', '.jpeg'],
          minSize: 20000,
          maxSize: 5242880
        },
        {
          category: 'accounts_receivable',
          displayName: 'Accounts Receivable',
          required: false,
          description: 'Current AR aging report (if applicable)',
          acceptedFormats: ['.pdf', '.xlsx', '.csv'],
          minSize: 10000,
          maxSize: 5242880
        },
        {
          category: 'accounts_payable',
          displayName: 'Accounts Payable',
          required: false,
          description: 'Current AP aging report (if applicable)',
          acceptedFormats: ['.pdf', '.xlsx', '.csv'],
          minSize: 10000,
          maxSize: 5242880
        }
      ],
      'equipment_financing': [
        {
          category: 'equipment_quote',
          displayName: 'Equipment Quote',
          required: true,
          description: 'Detailed quote or invoice for equipment purchase',
          acceptedFormats: ['.pdf', '.png', '.jpg', '.jpeg'],
          minSize: 25000,
          maxSize: 10485760
        },
        {
          category: 'bank_statements',
          displayName: 'Bank Statements',
          required: true,
          description: 'Last 3 months of business bank statements',
          acceptedFormats: ['.pdf', '.png', '.jpg', '.jpeg'],
          minSize: 50000,
          maxSize: 10485760
        },
        {
          category: 'tax_returns',
          displayName: 'Tax Returns',
          required: true,
          description: 'Last 2 years of business tax returns',
          acceptedFormats: ['.pdf'],
          minSize: 100000,
          maxSize: 20971520
        },
        {
          category: 'business_license',
          displayName: 'Business License',
          required: true,
          description: 'Current business registration or license',
          acceptedFormats: ['.pdf', '.png', '.jpg', '.jpeg'],
          minSize: 20000,
          maxSize: 5242880
        }
      ],
      'line_of_credit': [
        {
          category: 'bank_statements',
          displayName: 'Bank Statements',
          required: true,
          description: 'Last 6 months of business bank statements',
          acceptedFormats: ['.pdf', '.png', '.jpg', '.jpeg'],
          minSize: 50000,
          maxSize: 15728640
        },
        {
          category: 'financial_statements',
          displayName: 'Financial Statements',
          required: true,
          description: 'Current year Profit & Loss and Balance Sheet',
          acceptedFormats: ['.pdf', '.xlsx', '.xls'],
          minSize: 30000,
          maxSize: 10485760
        },
        {
          category: 'accounts_receivable',
          displayName: 'Accounts Receivable',
          required: true,
          description: 'Detailed AR aging report',
          acceptedFormats: ['.pdf', '.xlsx', '.csv'],
          minSize: 15000,
          maxSize: 5242880
        },
        {
          category: 'business_license',
          displayName: 'Business License',
          required: true,
          description: 'Current business registration or license',
          acceptedFormats: ['.pdf', '.png', '.jpg', '.jpeg'],
          minSize: 20000,
          maxSize: 5242880
        }
      ]
    };

    const requirements = documentRequirements[applicationType];
    if (!requirements) {
      return res.status(404).json({ 
        error: 'Unknown application type',
        availableTypes: Object.keys(documentRequirements)
      });
    }

    res.json({
      applicationType,
      requirements,
      totalRequired: requirements.filter(r => r.required).length,
      totalOptional: requirements.filter(r => !r.required).length
    });
  } catch (error) {
    console.error('Error fetching document requirements:', error);
    res.status(500).json({ error: 'Failed to fetch document requirements' });
  }
});

// Document upload status endpoint
router.post('/upload-status', async (req, res) => {
  try {
    const { applicationId, documents } = req.body;

    if (!applicationId || !Array.isArray(documents)) {
      return res.status(400).json({ 
        error: 'applicationId and documents array are required' 
      });
    }

    // Validate all documents in the upload
    const validationResults = documents.map(doc => 
      DocumentValidator.validateDocument(doc.fileName, doc.fileData, doc.category)
    );

    // Calculate completion status
    const totalDocuments = documents.length;
    const validDocuments = validationResults.filter(r => r.isValid).length;
    const placeholderDocuments = validationResults.filter(r => r.validationStatus === 'placeholder').length;
    const suspiciousDocuments = validationResults.filter(r => r.validationStatus === 'suspicious').length;

    const completionPercentage = totalDocuments > 0 ? Math.round((validDocuments / totalDocuments) * 100) : 0;
    
    const status = placeholderDocuments > 0 ? 'incomplete_placeholder' :
                   suspiciousDocuments > 0 ? 'review_required' :
                   validDocuments === totalDocuments ? 'complete' : 'incomplete';

    res.json({
      applicationId,
      uploadStatus: {
        status,
        completionPercentage,
        totalDocuments,
        validDocuments,
        placeholderDocuments,
        suspiciousDocuments,
        requiresReview: suspiciousDocuments > 0 || placeholderDocuments > 0
      },
      validationResults,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Upload status check error:', error);
    res.status(500).json({ error: 'Failed to check upload status' });
  }
});

export { router as documentsRouter };