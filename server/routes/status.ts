import { Router } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// Application status check endpoint
router.get('/status/:applicationId?', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const sessionId = req.headers['x-session-id'] || 'anonymous';

    // If no applicationId provided, check session storage or return guest status
    if (!applicationId) {
      return res.json({
        status: 'not_started',
        message: 'No application found. Ready to start your financing application?',
        missing: [],
        nextStep: 1,
        progress: 0
      });
    }

    // Mock status check - in production, this would query the staff backend
    // For now, return realistic status based on applicationId pattern
    const mockStatuses = [
      {
        status: 'in_progress',
        message: 'Your application is being processed',
        missing: ['Bank Statements', 'Tax Returns'],
        nextStep: 5,
        progress: 70,
        estimatedCompletion: '2-3 business days'
      },
      {
        status: 'under_review',
        message: 'Application submitted and under review',
        missing: [],
        nextStep: null,
        progress: 100,
        estimatedCompletion: '5-7 business days'
      },
      {
        status: 'approved',
        message: 'Congratulations! Your application has been approved',
        missing: [],
        nextStep: null,
        progress: 100,
        loanAmount: 50000,
        interestRate: 8.5
      },
      {
        status: 'additional_info_required',
        message: 'We need additional information to process your application',
        missing: ['Proof of Income', 'Business License'],
        nextStep: 5,
        progress: 60,
        dueDate: '2025-07-25'
      }
    ];

    // Select status based on applicationId hash
    const statusIndex = applicationId.length % mockStatuses.length;
    const applicationStatus = mockStatuses[statusIndex];

    logger.auditLog('status_check', undefined, { 
      applicationId: '[REDACTED]', 
      status: applicationStatus.status 
    });

    res.json({
      applicationId,
      ...applicationStatus,
      lastUpdated: new Date().toISOString(),
      supportContact: 'info@boreal.financial'
    });

  } catch (error) {
    logger.error('Status check error', error);
    res.status(500).json({ 
      error: 'Status check failed',
      status: 'unknown',
      message: 'Unable to retrieve application status. Please contact support.'
    });
  }
});

export default router;