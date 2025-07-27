import express from 'express';

const router = express.Router();

// Chat escalation endpoint - connects user to human support
router.post('/api/public/chat/escalate', async (req, res) => {
  try {
    console.log('🤝 [CHAT ESCALATION] Received escalation request:', req.body);
    
    const { sessionId, userEmail, userName, currentStep, context, timestamp } = req.body;
    
    // Validate required fields
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    // Log escalation request for staff CRM system
    console.log('📧 [CRM] Creating contact for chat escalation');
    console.log('📊 [ESCALATION DATA]:', {
      sessionId,
      userEmail: userEmail || 'anonymous',
      userName: userName || 'Anonymous User',
      currentStep,
      escalationType: 'chat_escalation',
      timestamp
    });
    
    // Forward to staff backend CRM system
    try {
      const staffBackendUrl = process.env.VITE_API_BASE_URL || 'https://staff.boreal.financial/api';
      const crmResponse = await fetch(`${staffBackendUrl}/crm/contacts/auto-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        },
        body: JSON.stringify({
          name: userName || 'Anonymous User',
          email: userEmail || '',
          source: 'chat_escalation',
          notes: `Chat escalation from step ${currentStep}. Session: ${sessionId}`,
          metadata: {
            sessionId,
            currentStep,
            escalationTime: timestamp,
            context: context || {}
          }
        })
      });
      
      if (crmResponse.ok) {
        console.log('✅ [CRM] Chat escalation contact created successfully');
      } else {
        console.warn('⚠️ [CRM] Failed to create contact, continuing with escalation');
      }
    } catch (crmError) {
      console.warn('⚠️ [CRM] CRM integration failed:', crmError);
      // Continue with escalation even if CRM fails
    }
    
    // Store escalation data for staff notification system
    const escalationData = {
      sessionId,
      userEmail: userEmail || 'anonymous',
      userName: userName || 'Anonymous User',
      currentStep: currentStep || 'unknown',
      status: 'pending',
      createdAt: new Date().toISOString(),
      context: context || {},
      priority: currentStep === 'step-6' ? 'high' : 'normal'
    };
    
    // In a real system, this would be stored in a database
    // For now, log for staff monitoring systems
    console.log('🚨 [STAFF NOTIFICATION] New chat escalation:', escalationData);
    
    res.json({
      success: true,
      message: 'Chat escalation request received',
      sessionId,
      status: 'escalated',
      estimatedResponseTime: '5-10 minutes'
    });
    
  } catch (error) {
    console.error('❌ [CHAT ESCALATION] Error processing request:', error);
    res.status(500).json({ 
      error: 'Failed to process escalation request',
      message: 'Please try again or contact support directly'
    });
  }
});

// Issue reporting endpoint with screenshot support
router.post('/api/public/chat/report', async (req, res) => {
  try {
    console.log('🐛 [ISSUE REPORT] Received issue report:', req.body);
    
    const { name, email, message, page, screenshot, timestamp } = req.body;
    
    // Validate required fields
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Issue description is required' });
    }
    
    // Log issue report for staff system
    console.log('📧 [CRM] Creating contact for issue report');
    console.log('🐛 [ISSUE DATA]:', {
      name: name || 'Anonymous',
      email: email || 'anonymous',
      message: message.substring(0, 100) + '...',
      page,
      hasScreenshot: !!screenshot,
      timestamp
    });
    
    // Forward to staff backend CRM system
    try {
      const staffBackendUrl = process.env.VITE_API_BASE_URL || 'https://staff.boreal.financial/api';
      const crmResponse = await fetch(`${staffBackendUrl}/crm/contacts/auto-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        },
        body: JSON.stringify({
          name: name || 'Anonymous User',
          email: email || '',
          source: 'issue_report',
          notes: `Issue report from ${page}: ${message}`,
          metadata: {
            page,
            reportTime: timestamp,
            hasScreenshot: !!screenshot,
            screenshotSize: screenshot ? screenshot.length : 0
          }
        })
      });
      
      if (crmResponse.ok) {
        console.log('✅ [CRM] Issue report contact created successfully');
      } else {
        console.warn('⚠️ [CRM] Failed to create contact, continuing with report');
      }
    } catch (crmError) {
      console.warn('⚠️ [CRM] CRM integration failed:', crmError);
      // Continue with report even if CRM fails
    }
    
    // Store issue report data
    const issueData = {
      reportId: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name || 'Anonymous',
      email: email || 'anonymous',
      message,
      page: page || 'unknown',
      hasScreenshot: !!screenshot,
      screenshotSize: screenshot ? screenshot.length : 0,
      createdAt: new Date().toISOString(),
      status: 'reported',
      priority: message.toLowerCase().includes('urgent') || message.toLowerCase().includes('critical') ? 'high' : 'normal'
    };
    
    // Log for staff bug tracking system
    console.log('🚨 [STAFF NOTIFICATION] New issue report:', issueData);
    
    res.json({
      success: true,
      message: 'Issue report submitted successfully',
      reportId: issueData.reportId,
      status: 'submitted'
    });
    
  } catch (error) {
    console.error('❌ [ISSUE REPORT] Error processing request:', error);
    res.status(500).json({ 
      error: 'Failed to submit issue report',
      message: 'Please try again or contact support directly'
    });
  }
});

export default router;