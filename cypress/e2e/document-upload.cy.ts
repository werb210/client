/**
 * Cypress E2E Test: Document Upload Flow
 * Tests document upload functionality with real file interactions
 */

describe('Document Upload Flow', () => {
  beforeEach(() => {
    // Navigate to Step 5 (Document Upload)
    cy.visit('/apply/step-5');
    
    // Mock the required documents API call
    cy.intercept('GET', '**/api/loan-products/required-documents/**', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          category: 'term_loan',
          requirements: [
            {
              id: 'bank_statements',
              name: 'Bank Statements',
              description: 'Last 3 months of business bank statements',
              required: true,
              acceptedFormats: ['pdf', 'jpg', 'png']
            },
            {
              id: 'tax_returns',
              name: 'Tax Returns',
              description: 'Last 2 years of business tax returns',
              required: true,
              acceptedFormats: ['pdf']
            },
            {
              id: 'financial_statements',
              name: 'Financial Statements',
              description: 'Profit & Loss and Balance Sheet',
              required: false,
              acceptedFormats: ['pdf', 'xlsx']
            }
          ]
        }
      }
    }).as('getRequiredDocs');
  });

  describe('Document Requirements Display', () => {
    it('should load and display required documents with API authentication', () => {
      // Wait for API call
      cy.wait('@getRequiredDocs').then((interception) => {
        // Verify authentication header is present
        expect(interception.request.headers).to.have.property('authorization');
        expect(interception.request.headers.authorization).to.include('Bearer');
      });
      
      // Verify document requirements are displayed
      cy.contains('Bank Statements').should('be.visible');
      cy.contains('Tax Returns').should('be.visible');
      cy.contains('Financial Statements').should('be.visible');
      
      // Verify required indicators
      cy.contains('Bank Statements').parent().should('contain', 'Required');
      cy.contains('Tax Returns').parent().should('contain', 'Required');
      cy.contains('Financial Statements').parent().should('contain', 'Optional');
    });

    it('should show accepted file formats', () => {
      cy.wait('@getRequiredDocs');
      
      // Verify format information is displayed
      cy.contains('PDF, JPG, PNG').should('be.visible');
      cy.contains('PDF only').should('be.visible');
      cy.contains('PDF, XLSX').should('be.visible');
    });
  });

  describe('File Upload Functionality', () => {
    beforeEach(() => {
      cy.wait('@getRequiredDocs');
    });

    it('should upload files with drag and drop', () => {
      // Create test file
      const fileName = 'bank_statement.pdf';
      const fileContent = 'Mock PDF content for testing';
      
      // Mock file upload API
      cy.intercept('POST', '**/api/upload/**', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            fileId: 'file_123',
            fileName: fileName,
            fileSize: fileContent.length,
            uploadedAt: new Date().toISOString()
          }
        }
      }).as('uploadFile');
      
      // Find the first upload area (Bank Statements)
      cy.get('[data-testid="upload-area"]').first().as('uploadArea');
      
      // Create and attach file
      cy.fixture('sample.pdf', 'base64').then(fileContent => {
        cy.get('@uploadArea').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: fileName,
          mimeType: 'application/pdf'
        }, { action: 'drag-drop' });
      });
      
      // Verify upload API call
      cy.wait('@uploadFile').then((interception) => {
        // Verify authentication header
        expect(interception.request.headers).to.have.property('authorization');
        expect(interception.request.headers.authorization).to.include('Bearer');
        
        // Verify form data includes file
        expect(interception.request.body).to.be.instanceOf(FormData);
      });
      
      // Verify upload success feedback
      cy.contains('Upload successful').should('be.visible');
      cy.get('@uploadArea').should('contain', fileName);
    });

    it('should upload files with file input click', () => {
      const fileName = 'tax_return.pdf';
      
      // Mock upload API
      cy.intercept('POST', '**/api/upload/**', {
        statusCode: 200,
        body: {
          success: true,
          data: { fileId: 'file_456', fileName: fileName }
        }
      }).as('uploadFile');
      
      // Find Tax Returns upload area
      cy.contains('Tax Returns').parent().find('[data-testid="upload-area"]').as('uploadArea');
      
      // Click to upload
      cy.get('@uploadArea').click();
      
      // Select file through input
      cy.fixture('sample.pdf', 'base64').then(fileContent => {
        cy.get('input[type="file"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: fileName,
          mimeType: 'application/pdf'
        });
      });
      
      // Verify upload
      cy.wait('@uploadFile');
      cy.contains('Upload successful').should('be.visible');
    });

    it('should show upload progress', () => {
      // Mock slow upload with progress
      cy.intercept('POST', '**/api/upload/**', (req) => {
        req.reply((res) => {
          res.delay(2000); // 2 second delay to show progress
          res.send({
            statusCode: 200,
            body: { success: true, data: { fileId: 'file_789' } }
          });
        });
      }).as('slowUpload');
      
      // Upload file
      cy.get('[data-testid="upload-area"]').first().as('uploadArea');
      cy.fixture('sample.pdf', 'base64').then(fileContent => {
        cy.get('@uploadArea').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test.pdf',
          mimeType: 'application/pdf'
        }, { action: 'drag-drop' });
      });
      
      // Verify progress indicators
      cy.contains('Uploading').should('be.visible');
      cy.get('[role="progressbar"]').should('be.visible');
      
      // Wait for completion
      cy.wait('@slowUpload');
      cy.contains('Upload successful').should('be.visible');
    });
  });

  describe('File Validation', () => {
    beforeEach(() => {
      cy.wait('@getRequiredDocs');
    });

    it('should reject invalid file types', () => {
      // Try to upload unsupported file type to PDF-only field
      cy.contains('Tax Returns').parent().find('[data-testid="upload-area"]').as('uploadArea');
      
      // Upload a .txt file
      cy.get('@uploadArea').selectFile({
        contents: 'Text file content',
        fileName: 'invalid.txt',
        mimeType: 'text/plain'
      }, { action: 'drag-drop' });
      
      // Verify error message
      cy.contains('Invalid file type').should('be.visible');
      cy.contains('PDF only').should('be.visible');
    });

    it('should reject files that are too large', () => {
      // Create large file content (simulate 50MB)
      const largeContent = 'x'.repeat(50 * 1024 * 1024);
      
      cy.get('[data-testid="upload-area"]').first().selectFile({
        contents: largeContent,
        fileName: 'large_file.pdf',
        mimeType: 'application/pdf'
      }, { action: 'drag-drop' });
      
      // Verify size error
      cy.contains('File too large').should('be.visible');
      cy.contains('maximum size').should('be.visible');
    });

    it('should accept valid file types and sizes', () => {
      // Mock successful upload
      cy.intercept('POST', '**/api/upload/**', {
        statusCode: 200,
        body: { success: true, data: { fileId: 'file_valid' } }
      }).as('validUpload');
      
      // Upload valid PDF
      cy.fixture('sample.pdf', 'base64').then(fileContent => {
        cy.get('[data-testid="upload-area"]').first().selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'valid_document.pdf',
          mimeType: 'application/pdf'
        }, { action: 'drag-drop' });
      });
      
      // Verify acceptance
      cy.wait('@validUpload');
      cy.contains('Upload successful').should('be.visible');
      cy.contains('valid_document.pdf').should('be.visible');
    });
  });

  describe('File Management', () => {
    beforeEach(() => {
      cy.wait('@getRequiredDocs');
      
      // Upload a test file first
      cy.intercept('POST', '**/api/upload/**', {
        statusCode: 200,
        body: {
          success: true,
          data: { fileId: 'file_manage', fileName: 'test_document.pdf' }
        }
      }).as('uploadFile');
      
      cy.fixture('sample.pdf', 'base64').then(fileContent => {
        cy.get('[data-testid="upload-area"]').first().selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test_document.pdf',
          mimeType: 'application/pdf'
        }, { action: 'drag-drop' });
      });
      
      cy.wait('@uploadFile');
    });

    it('should allow file replacement', () => {
      // Mock replacement upload
      cy.intercept('POST', '**/api/upload/**', {
        statusCode: 200,
        body: {
          success: true,
          data: { fileId: 'file_replaced', fileName: 'new_document.pdf' }
        }
      }).as('replaceFile');
      
      // Find replace button and click
      cy.contains('test_document.pdf').parent().find('[data-testid="replace-file"]').click();
      
      // Upload new file
      cy.fixture('sample.pdf', 'base64').then(fileContent => {
        cy.get('input[type="file"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'new_document.pdf',
          mimeType: 'application/pdf'
        });
      });
      
      // Verify replacement
      cy.wait('@replaceFile');
      cy.contains('new_document.pdf').should('be.visible');
      cy.contains('test_document.pdf').should('not.exist');
    });

    it('should allow file deletion', () => {
      // Mock deletion API
      cy.intercept('DELETE', '**/api/upload/**', {
        statusCode: 200,
        body: { success: true }
      }).as('deleteFile');
      
      // Find and click delete button
      cy.contains('test_document.pdf').parent().find('[data-testid="delete-file"]').click();
      
      // Confirm deletion
      cy.contains('Confirm').click();
      
      // Verify deletion
      cy.wait('@deleteFile').then((interception) => {
        expect(interception.request.headers).to.have.property('authorization');
      });
      
      cy.contains('test_document.pdf').should('not.exist');
    });
  });

  describe('Form Completion and Navigation', () => {
    it('should prevent navigation until required documents are uploaded', () => {
      cy.wait('@getRequiredDocs');
      
      // Try to proceed without uploading required docs
      cy.get('[data-cy="next"]').should('be.disabled');
      
      // Upload required documents
      cy.intercept('POST', '**/api/upload/**', {
        statusCode: 200,
        body: { success: true, data: { fileId: 'file_req' } }
      }).as('uploadRequired');
      
      // Upload Bank Statements (required)
      cy.fixture('sample.pdf', 'base64').then(fileContent => {
        cy.contains('Bank Statements').parent().find('[data-testid="upload-area"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'bank_statements.pdf',
          mimeType: 'application/pdf'
        }, { action: 'drag-drop' });
      });
      
      cy.wait('@uploadRequired');
      
      // Upload Tax Returns (required)
      cy.contains('Tax Returns').parent().find('[data-testid="upload-area"]').selectFile({
        contents: Cypress.Buffer.from('pdf content', 'base64'),
        fileName: 'tax_returns.pdf',
        mimeType: 'application/pdf'
      }, { action: 'drag-drop' });
      
      cy.wait('@uploadRequired');
      
      // Now should be able to proceed
      cy.get('[data-cy="next"]').should('be.enabled');
      cy.get('[data-cy="next"]').click();
      
      // Should navigate to Step 6
      cy.url().should('include', '/apply/step-6');
    });

    it('should show upload completion status', () => {
      cy.wait('@getRequiredDocs');
      
      // Mock successful uploads
      cy.intercept('POST', '**/api/upload/**', {
        statusCode: 200,
        body: { success: true, data: { fileId: 'file_complete' } }
      }).as('uploadComplete');
      
      // Upload all required documents
      cy.fixture('sample.pdf', 'base64').then(fileContent => {
        // Bank Statements
        cy.contains('Bank Statements').parent().find('[data-testid="upload-area"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'bank_statements.pdf',
          mimeType: 'application/pdf'
        }, { action: 'drag-drop' });
        
        cy.wait('@uploadComplete');
        
        // Tax Returns
        cy.contains('Tax Returns').parent().find('[data-testid="upload-area"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'tax_returns.pdf',
          mimeType: 'application/pdf'
        }, { action: 'drag-drop' });
        
        cy.wait('@uploadComplete');
      });
      
      // Verify completion indicators
      cy.contains('All required documents uploaded').should('be.visible');
      cy.get('[data-testid="completion-checkmark"]').should('have.length', 2);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      cy.wait('@getRequiredDocs');
    });

    it('should handle upload failures gracefully', () => {
      // Mock upload failure
      cy.intercept('POST', '**/api/upload/**', {
        statusCode: 500,
        body: { error: 'Upload failed' }
      }).as('uploadFail');
      
      // Attempt upload
      cy.fixture('sample.pdf', 'base64').then(fileContent => {
        cy.get('[data-testid="upload-area"]').first().selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test.pdf',
          mimeType: 'application/pdf'
        }, { action: 'drag-drop' });
      });
      
      // Verify error handling
      cy.wait('@uploadFail');
      cy.contains('Upload failed').should('be.visible');
      cy.contains('Try again').should('be.visible');
    });

    it('should retry failed uploads', () => {
      // Mock initial failure then success
      let uploadAttempts = 0;
      cy.intercept('POST', '**/api/upload/**', (req) => {
        uploadAttempts++;
        if (uploadAttempts === 1) {
          req.reply({ statusCode: 500, body: { error: 'Server error' } });
        } else {
          req.reply({ statusCode: 200, body: { success: true, data: { fileId: 'retry_success' } } });
        }
      }).as('retryUpload');
      
      // Initial upload attempt
      cy.fixture('sample.pdf', 'base64').then(fileContent => {
        cy.get('[data-testid="upload-area"]').first().selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'retry.pdf',
          mimeType: 'application/pdf'
        }, { action: 'drag-drop' });
      });
      
      // Wait for failure
      cy.wait('@retryUpload');
      cy.contains('Upload failed').should('be.visible');
      
      // Click retry
      cy.contains('Try again').click();
      
      // Verify retry success
      cy.wait('@retryUpload');
      cy.contains('Upload successful').should('be.visible');
    });
  });
});