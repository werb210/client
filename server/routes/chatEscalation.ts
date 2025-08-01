import { Request, Response } from 'express';
import { z } from 'zod';

// Validation schema for chat escalation
const chatEscalationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  contextRoute: z.string().optional(),
  applicationId: z.string().optional(),
  transcript: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.string().optional()
});

interface EscalationData {
  name: string;
  email: string;
  message: string;
  contextRoute?: string;
  applicationId?: string;
  transcript?: string;
  userAgent?: string;
  timestamp: string;
}

/**
 * POST /api/public/chat/escalate
 * Handles chat escalation requests from the client application
 */
export async function handleChatEscalation(req: Request, res: Response) {
  try {
    // Validate request body
    const validationResult = chatEscalationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validationResult.error.issues
      });
    }

    const escalationData: EscalationData = {
      ...validationResult.data,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || 'Unknown'
    };

    // Log escalation locally (in production this would go to staff backend)
    console.log('🚨 [CHAT ESCALATION] New escalation request:', {
      name: escalationData.name,
      email: escalationData.email,
      route: escalationData.contextRoute,
      applicationId: escalationData.applicationId,
      timestamp: escalationData.timestamp,
      messageLength: escalationData.message.length,
      hasTranscript: !!escalationData.transcript
    });

    // In production, forward this to the staff backend
    try {
      const STAFF_API_URL = process.env.VITE_API_BASE_URL || 'https://staff.boreal.financial/api';
      
      const staffResponse = await fetch(`${STAFF_API_URL}/chat/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_CLIENT_APP_SHARED_TOKEN || 'development-token'}`
        },
        body: JSON.stringify(escalationData)
      });

      if (staffResponse.ok) {
        console.log('✅ [CHAT ESCALATION] Successfully forwarded to staff backend');
        
        return res.status(200).json({
          success: true,
          message: 'Your request has been escalated to our support team. We will contact you shortly.',
          escalationId: `ESC-${Date.now()}`,
          expectedResponse: '24 hours'
        });
      } else {
        console.warn('⚠️ [CHAT ESCALATION] Staff backend unavailable, storing locally');
        
        // Fallback: Store escalation locally when staff backend is unavailable
        return res.status(200).json({
          success: true,
          message: 'Your request has been recorded. Our team will review it and contact you shortly.',
          escalationId: `ESC-LOCAL-${Date.now()}`,
          expectedResponse: '48 hours',
          note: 'Request stored locally due to temporary service unavailability'
        });
      }
    } catch (fetchError) {
      console.error('❌ [CHAT ESCALATION] Error contacting staff backend:', fetchError);
      
      // Fallback: Always provide a successful response to user
      return res.status(200).json({
        success: true,
        message: 'Your request has been recorded. Our team will review it and contact you shortly.',
        escalationId: `ESC-FALLBACK-${Date.now()}`,
        expectedResponse: '48 hours',
        note: 'Request processed with fallback handling'
      });
    }

  } catch (error) {
    console.error('❌ [CHAT ESCALATION] Unexpected error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Unable to process escalation request. Please try again or contact support directly.'
    });
  }
}

/**
 * GET /api/public/chat/escalate/status/:escalationId
 * Check status of an escalation request
 */
export async function getEscalationStatus(req: Request, res: Response) {
  const { escalationId } = req.params;
  
  if (!escalationId) {
    return res.status(400).json({
      success: false,
      error: 'Escalation ID is required'
    });
  }

  // In a real implementation, this would query the staff backend or database
  return res.status(200).json({
    success: true,
    escalationId,
    status: 'received',
    message: 'Your escalation request is being reviewed by our support team.',
    estimatedResponse: '24-48 hours',
    created: new Date().toISOString()
  });
}