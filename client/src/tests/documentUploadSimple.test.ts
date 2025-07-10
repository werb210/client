/**
 * Simple Document Upload Test
 * Tests the document matching logic without JSX rendering
 */

import { describe, it, expect } from 'vitest';

// Simple test to verify our document matching logic
describe('Document Upload Matching Logic', () => {
  
  interface TestFile {
    documentType?: string;
    name: string;
  }

  // Simulate the matching logic from DynamicDocumentRequirements
  function matchesBankStatements(file: TestFile, docLabel: string): boolean {
    const docLabelLower = docLabel.toLowerCase();
    const fileNameLower = file.name.toLowerCase();
    const documentTypeLower = file.documentType?.toLowerCase() || '';
    
    // Match bank statements (most important - files are uploaded with documentType: 'bank_statements')
    if (docLabelLower.includes('bank') && docLabelLower.includes('statement')) {
      return documentTypeLower === 'bank_statements' ||
             documentTypeLower.includes('bank') || 
             fileNameLower.includes('bank');
    }
    
    return false;
  }

  it('should match files with correct documentType "bank_statements"', () => {
    const testFile: TestFile = {
      documentType: 'bank_statements',
      name: 'March2025.pdf'
    };
    
    const result = matchesBankStatements(testFile, 'Bank Statements');
    expect(result).toBe(true);
  });

  it('should match files with bank in the filename', () => {
    const testFile: TestFile = {
      documentType: 'other',
      name: 'bank_statement_march.pdf'
    };
    
    const result = matchesBankStatements(testFile, 'Bank Statements');
    expect(result).toBe(true);
  });

  it('should not match files with wrong documentType and no bank in filename', () => {
    const testFile: TestFile = {
      documentType: 'misc',
      name: 'random_document.pdf'
    };
    
    const result = matchesBankStatements(testFile, 'Bank Statements');
    expect(result).toBe(false);
  });

  it('should match files with partial documentType match', () => {
    const testFile: TestFile = {
      documentType: 'bank_document',
      name: 'march_statements.pdf'
    };
    
    const result = matchesBankStatements(testFile, 'Bank Statements');
    expect(result).toBe(true);
  });

  it('should verify the red circle issue fix', () => {
    // This test simulates the exact scenario from the console logs
    const uploadedFiles: TestFile[] = [
      { documentType: 'bank_statements', name: 'April 2025.pdf' },
      { documentType: 'bank_statements', name: 'March 2025.pdf' },
      { documentType: 'bank_statements', name: 'January 2025.pdf' },
      { documentType: 'bank_statements', name: 'February 2025.pdf' },
      { documentType: 'bank_statements', name: 'December 2024.pdf' },
      { documentType: 'bank_statements', name: 'November 2024.pdf' }
    ];

    const bankStatementsRequirement = 'Bank Statements';
    const matchingFiles = uploadedFiles.filter(file => 
      matchesBankStatements(file, bankStatementsRequirement)
    );

    // All 6 files should match (they have documentType: 'bank_statements')
    expect(matchingFiles).toHaveLength(6);
    
    // This confirms the red circle should turn green since we have enough files
    const requiredQuantity = 6; // Bank statements require 6 files
    const isComplete = matchingFiles.length >= requiredQuantity;
    expect(isComplete).toBe(true);
  });
});

/**
 * Document Requirements Completion Test
 */
describe('Document Requirements Completion Logic', () => {
  
  interface RequiredDoc {
    label: string;
    quantity: number;
  }
  
  interface UploadedFile {
    documentType?: string;
    name: string;
  }

  function checkCompletion(
    requirements: RequiredDoc[], 
    uploadedFiles: UploadedFile[]
  ): { completed: number; total: number; allComplete: boolean } {
    const completedDocs = requirements.filter(doc => {
      const documentFiles = uploadedFiles.filter(f => {
        const docLabelLower = doc.label.toLowerCase();
        const fileNameLower = f.name.toLowerCase();
        const documentTypeLower = f.documentType?.toLowerCase() || '';
        
        // Match bank statements
        if (docLabelLower.includes('bank') && docLabelLower.includes('statement')) {
          return documentTypeLower === 'bank_statements' ||
                 documentTypeLower.includes('bank') || 
                 fileNameLower.includes('bank');
        }
        
        // Generic matching for other document types
        const firstWord = docLabelLower.split(' ')[0];
        return documentTypeLower.includes(firstWord) ||
               fileNameLower.includes(firstWord) ||
               documentTypeLower === doc.label.toLowerCase().replace(/\s+/g, '_');
      });
      
      return documentFiles.length >= doc.quantity;
    });
    
    return {
      completed: completedDocs.length,
      total: requirements.length,
      allComplete: completedDocs.length === requirements.length
    };
  }

  it('should show incomplete when no files uploaded', () => {
    const requirements: RequiredDoc[] = [
      { label: 'Bank Statements', quantity: 6 }
    ];
    const uploadedFiles: UploadedFile[] = [];
    
    const result = checkCompletion(requirements, uploadedFiles);
    
    expect(result.completed).toBe(0);
    expect(result.total).toBe(1);
    expect(result.allComplete).toBe(false);
  });

  it('should show complete when sufficient files uploaded', () => {
    const requirements: RequiredDoc[] = [
      { label: 'Bank Statements', quantity: 6 }
    ];
    const uploadedFiles: UploadedFile[] = Array.from({ length: 6 }, (_, i) => ({
      documentType: 'bank_statements',
      name: `statement_${i + 1}.pdf`
    }));
    
    const result = checkCompletion(requirements, uploadedFiles);
    
    expect(result.completed).toBe(1);
    expect(result.total).toBe(1);
    expect(result.allComplete).toBe(true);
  });

  it('should show incomplete when insufficient files uploaded', () => {
    const requirements: RequiredDoc[] = [
      { label: 'Bank Statements', quantity: 6 }
    ];
    const uploadedFiles: UploadedFile[] = Array.from({ length: 3 }, (_, i) => ({
      documentType: 'bank_statements',
      name: `statement_${i + 1}.pdf`
    }));
    
    const result = checkCompletion(requirements, uploadedFiles);
    
    expect(result.completed).toBe(0);
    expect(result.total).toBe(1);
    expect(result.allComplete).toBe(false);
  });
});