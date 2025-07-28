import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory queue for demo (use Redis/database in production)
interface HandoffRequest {
  id: string;
  sessionId: string;
  userMessage: string;
  chatHistory: any[];
  sentiment: string;
  timestamp: Date;
  status: 'pending' | 'assigned' | 'completed';
  assignedAgent?: string;
}

const handoffQueue: HandoffRequest[] = [];

// Request human handoff
router.post('/handoff/request', async (req, res) => {
  try {
    const { sessionId, userMessage, chatHistory, sentiment } = req.body;

    const handoffRequest: HandoffRequest = {
      id: uuidv4(),
      sessionId,
      userMessage: userMessage || 'User requested human assistance',
      chatHistory: chatHistory || [],
      sentiment: sentiment || 'neutral',
      timestamp: new Date(),
      status: 'pending'
    };

    handoffQueue.push(handoffRequest);

    console.log(`✅ [HANDOFF] New request added: ${handoffRequest.id}, Session: ${sessionId}, Sentiment: ${sentiment}`);
    console.log(`📋 [HANDOFF] Queue now has ${handoffQueue.length} total requests`);

    res.json({
      success: true,
      handoffId: handoffRequest.id,
      message: 'Your request has been submitted. A human agent will assist you shortly.',
      estimatedWaitTime: getEstimatedWaitTime()
    });

  } catch (error) {
    console.error('Handoff request error:', error);
    res.status(500).json({ 
      error: 'Failed to submit handoff request',
      message: 'Please try again or contact support directly.'
    });
  }
});

// Get handoff queue (for staff dashboard)
router.get('/handoff/queue', async (req, res) => {
  try {
    console.log('🔍 [HANDOFF ROUTER] Queue requested - current queue size:', handoffQueue.length);
    console.log('📋 [HANDOFF ROUTER] Full queue:', handoffQueue.map(r => ({ id: r.id, status: r.status, timestamp: r.timestamp })));
    
    const pendingRequests = handoffQueue
      .filter(req => req.status === 'pending')
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    console.log('✅ [HANDOFF ROUTER] Returning', pendingRequests.length, 'pending requests');

    res.json({
      success: true,
      queue: pendingRequests,
      count: pendingRequests.length
    });

  } catch (error) {
    console.error('Queue fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch handoff queue' });
  }
});

// Accept handoff (for staff)
router.post('/handoff/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const { agentName } = req.body;

    const request = handoffQueue.find(r => r.id === id);
    if (!request) {
      return res.status(404).json({ error: 'Handoff request not found' });
    }

    request.status = 'assigned';
    request.assignedAgent = agentName;

    console.log(`[HANDOFF] Request ${id} assigned to ${agentName}`);

    res.json({
      success: true,
      message: `Handoff request assigned to ${agentName}`,
      request
    });

  } catch (error) {
    console.error('Handoff accept error:', error);
    res.status(500).json({ error: 'Failed to accept handoff request' });
  }
});

// Get estimated wait time
function getEstimatedWaitTime(): string {
  const queueSize = handoffQueue.filter(r => r.status === 'pending').length;
  
  if (queueSize === 0) return 'Immediate';
  if (queueSize <= 2) return '2-5 minutes';
  if (queueSize <= 5) return '5-10 minutes';
  return '10-15 minutes';
}

export default router;