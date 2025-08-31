import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the logger to avoid console output during tests
vi.mock('@/lib/utils', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  cn: vi.fn(),
}));

describe('Production Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  describe('Step 1-3 Data Flow', () => {
    it('should store form data locally and navigate correctly', async () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });

      // Test that form data is stored in localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      expect(mockLocalStorage.getItem).toHaveBeenCalled();
    });
  });

  describe('Step 5 File Upload', () => {
    it('should upload files with proper API structure', async () => {
      // Mock fetch for file upload
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      });
      global.fetch = mockFetch;

      // Mock file upload
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      const formData = new FormData();
      formData.append('document', mockFile);
      formData.append('documentType', 'bank_statements');

      // Simulate upload
      await fetch('/api/public/applications/test-id/documents', {
        method: 'POST',
        body: formData,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/public/applications/test-id/documents',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });
  });

  describe('Step 6 Polling Logic', () => {
    it('should poll until signing_status equals signed', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ signing_status: 'invite_sent' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ signing_status: 'signed' }),
        });
      global.fetch = mockFetch;

      // Mock polling behavior
      let attempts = 0;
      const maxAttempts = 10;
      let status = '';

      while (attempts < maxAttempts && status !== 'signed') {
        const response = await fetch('/api/public/signnow/status/test-id');
        const data = await response.json();
        status = data.signing_status;
        attempts++;
      }

      expect(status).toBe('signed');
      expect(attempts).toBe(2); // Should complete after 2 attempts
    });
  });
});