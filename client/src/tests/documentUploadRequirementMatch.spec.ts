/**
 * Document Upload Requirement Matching Test
 * Verifies that uploading documents with correct documentType satisfies requirements
 * and updates UI from "Required" (red) to "Complete" (green)
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DynamicDocumentRequirements } from '../components/DynamicDocumentRequirements';

// Define UploadedFile type locally for testing
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  status: 'uploading' | 'completed' | 'error';
  documentType?: string;
}

// Mock the useToast hook
vi.mock('../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock fetch for file uploads
global.fetch = vi.fn();

describe('Document Upload Requirement Matching', () => {
  const mockOnFilesUploaded = vi.fn();
  const mockOnRequirementsChange = vi.fn();
  const mockApplicationId = 'test-app-123';

  const defaultProps = {
    requirements: ['Bank Statements'],
    uploadedFiles: [] as UploadedFile[],
    onFilesUploaded: mockOnFilesUploaded,
    onRequirementsChange: mockOnRequirementsChange,
    applicationId: mockApplicationId,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful API response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
      text: () => Promise.resolve('Success'),
    });
  });

  it('should show "Required" badge initially for Bank Statements', () => {
    render(<DynamicDocumentRequirements {...defaultProps} />);
    
    expect(screen.getByText('Bank Statements')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('Required')).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('should show "Complete" badge after uploading correct documentType', async () => {
    const user = userEvent.setup();
    
    // Start with empty files
    const { rerender } = render(<DynamicDocumentRequirements {...defaultProps} />);
    
    // Verify initial "Required" state
    expect(screen.getByText('Required')).toBeInTheDocument();
    
    // Create mock uploaded files with correct documentType
    const uploadedFiles: UploadedFile[] = [
      {
        id: 'file-1',
        name: 'March2025.pdf',
        size: 1024 * 1024, // 1MB
        type: 'application/pdf',
        file: new File([''], 'March2025.pdf', { type: 'application/pdf' }),
        status: 'completed',
        documentType: 'bank_statements' // Correct documentType for Bank Statements
      }
    ];
    
    // Re-render with uploaded files
    rerender(
      <DynamicDocumentRequirements 
        {...defaultProps} 
        uploadedFiles={uploadedFiles}
      />
    );
    
    // Should now show "Complete" badge
    await waitFor(() => {
      expect(screen.getByText('Complete')).toBeInTheDocument();
      expect(screen.getByText('Complete')).toHaveClass('bg-green-100', 'text-green-800');
    });
  });

  it('should remain "Required" with wrong documentType', async () => {
    // Create mock uploaded files with wrong documentType
    const uploadedFiles: UploadedFile[] = [
      {
        id: 'file-1',
        name: 'randombank.pdf',
        size: 1024 * 1024,
        type: 'application/pdf',
        file: new File([''], 'randombank.pdf', { type: 'application/pdf' }),
        status: 'completed',
        documentType: 'misc' // Wrong documentType
      }
    ];
    
    render(
      <DynamicDocumentRequirements 
        {...defaultProps} 
        uploadedFiles={uploadedFiles}
      />
    );
    
    // Should still show "Required" badge
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
  });

  it('should handle multiple document types correctly', async () => {
    const requirements = ['Bank Statements', 'Financial Statements', 'Tax Returns'];
    const uploadedFiles: UploadedFile[] = [
      {
        id: 'file-1',
        name: 'bank_march.pdf',
        size: 1024 * 1024,
        type: 'application/pdf',
        file: new File([''], 'bank_march.pdf', { type: 'application/pdf' }),
        status: 'completed',
        documentType: 'bank_statements'
      },
      {
        id: 'file-2',
        name: 'financial_2024.pdf',
        size: 1024 * 1024,
        type: 'application/pdf',
        file: new File([''], 'financial_2024.pdf', { type: 'application/pdf' }),
        status: 'completed',
        documentType: 'financial_statements'
      }
    ];
    
    render(
      <DynamicDocumentRequirements 
        {...defaultProps} 
        requirements={requirements}
        uploadedFiles={uploadedFiles}
      />
    );
    
    // Bank Statements and Financial Statements should be complete
    const completeElements = screen.getAllByText('Complete');
    expect(completeElements).toHaveLength(2);
    
    // Tax Returns should still be required
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('should handle quantity requirements correctly', async () => {
    // Bank Statements require 6 files
    const uploadedFiles: UploadedFile[] = Array.from({ length: 6 }, (_, i) => ({
      id: `file-${i + 1}`,
      name: `statement_${i + 1}.pdf`,
      size: 1024 * 1024,
      type: 'application/pdf',
      file: new File([''], `statement_${i + 1}.pdf`, { type: 'application/pdf' }),
      status: 'completed' as const,
      documentType: 'bank_statements'
    }));
    
    render(
      <DynamicDocumentRequirements 
        {...defaultProps} 
        uploadedFiles={uploadedFiles}
      />
    );
    
    // Should show "Complete" with 6 files
    await waitFor(() => {
      expect(screen.getByText('Complete')).toBeInTheDocument();
      expect(screen.getByText('Uploaded: 6')).toBeInTheDocument();
    });
  });

  it('should not complete with insufficient quantity', async () => {
    // Only 3 files for Bank Statements (need 6)
    const uploadedFiles: UploadedFile[] = Array.from({ length: 3 }, (_, i) => ({
      id: `file-${i + 1}`,
      name: `statement_${i + 1}.pdf`,
      size: 1024 * 1024,
      type: 'application/pdf',
      file: new File([''], `statement_${i + 1}.pdf`, { type: 'application/pdf' }),
      status: 'completed' as const,
      documentType: 'bank_statements'
    }));
    
    render(
      <DynamicDocumentRequirements 
        {...defaultProps} 
        uploadedFiles={uploadedFiles}
      />
    );
    
    // Should still show "Required" with only 3 files
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('Uploaded: 3')).toBeInTheDocument();
    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
  });

  it('should call onRequirementsChange with correct completion status', async () => {
    const uploadedFiles: UploadedFile[] = [
      {
        id: 'file-1',
        name: 'complete_bank_statement.pdf',
        size: 1024 * 1024,
        type: 'application/pdf',
        file: new File([''], 'complete_bank_statement.pdf', { type: 'application/pdf' }),
        status: 'completed',
        documentType: 'bank_statements'
      }
    ];
    
    render(
      <DynamicDocumentRequirements 
        {...defaultProps} 
        uploadedFiles={uploadedFiles}
      />
    );
    
    // Should call onRequirementsChange with completion status
    await waitFor(() => {
      expect(mockOnRequirementsChange).toHaveBeenCalledWith(true, 1);
    });
  });

  it('should show uploaded file with correct status indicators', async () => {
    const uploadedFiles: UploadedFile[] = [
      {
        id: 'file-1',
        name: 'March2025.pdf',
        size: 1024 * 1024,
        type: 'application/pdf',
        file: new File([''], 'March2025.pdf', { type: 'application/pdf' }),
        status: 'completed',
        documentType: 'bank_statements'
      }
    ];
    
    render(
      <DynamicDocumentRequirements 
        {...defaultProps} 
        uploadedFiles={uploadedFiles}
      />
    );
    
    // Should show the uploaded file
    expect(screen.getByText('March2025.pdf')).toBeInTheDocument();
    
    // Should show file size
    expect(screen.getByText('(1.00 MB)')).toBeInTheDocument();
  });
});

/**
 * Integration Test: Full Upload Workflow
 * Tests the complete file upload process including API calls
 */
describe('Document Upload Integration', () => {
  const mockApplicationId = 'test-app-123';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full upload workflow and update status', async () => {
    const user = userEvent.setup();
    let currentFiles: UploadedFile[] = [];
    
    const mockOnFilesUploaded = vi.fn((files: UploadedFile[]) => {
      currentFiles = files;
    });
    
    // Mock successful upload response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
      text: () => Promise.resolve('Upload successful'),
    });
    
    const { rerender } = render(
      <DynamicDocumentRequirements 
        requirements={['Bank Statements']}
        uploadedFiles={currentFiles}
        onFilesUploaded={mockOnFilesUploaded}
        onRequirementsChange={vi.fn()}
        applicationId={mockApplicationId}
      />
    );
    
    // Create a file to upload
    const file = new File(['test content'], 'test_bank_statement.pdf', {
      type: 'application/pdf',
    });
    
    // Find and interact with file input
    const fileInput = screen.getByLabelText(/choose files/i);
    await user.upload(fileInput, file);
    
    // Verify API call was made
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/documents', {
        method: 'POST',
        headers: {
          'Authorization': expect.stringContaining('Bearer'),
        },
        body: expect.any(FormData),
        credentials: 'include',
      });
    });
    
    // Verify onFilesUploaded was called
    expect(mockOnFilesUploaded).toHaveBeenCalled();
  });
});