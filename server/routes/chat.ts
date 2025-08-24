import express from 'express';
import { openaiService } from '../services/openaiService';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// In-memory chat sessions storage (replace with database in production)
const chatSessions = new Map<string, {
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
  context: any;
  userId?: string;
  applicationId?: string;
  escalated: boolean;
  createdAt: Date;
  updatedAt: Date;
}>();

/**
 * POST /api/chat/start
 * Start a new chat session
 */
router.post('/start', async (req, res) => {
  try {
    const { userId, applicationId, context } = req.body;
    const sessionId = uuidv4();

    const session = {
      sessionId,
      messages: [],
      context: context || {},
      userId,
      applicationId,
      escalated: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    chatSessions.set(sessionId, session);

    console.log(`✅ New chat session started: ${sessionId}`);

    res.json({
      success: true,
      sessionId,
      message: "Hello! I'm your Boreal Financial assistant. How can I help you with your lending application today?"
    });
  } catch (error) {
    console.error('❌ Chat start error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start chat session'
    });
  }
});

/**
 * POST /api/chat/message
 * Send a message to the chatbot
 */
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, context } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and message are required'
      });
    }

    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Chat session not found'
      });
    }

    // Add user message to session
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date()
    };
    session.messages.push(userMessage);

    // Update context if provided
    if (context) {
      session.context = { ...session.context, ...context };
    }

    // Analyze sentiment for escalation detection
    const sentimentAnalysis = await openaiService.analyzeSentiment(message);
    
    // Get AI response with enhanced lender context
    const aiResponse = await openaiService.createChatCompletion(
      session.messages,
      session.context
    );

    // Try to extract lender recommendations from context
    let recommendations = [];
    try {
      if (session.context?.lenderProducts && Array.isArray(session.context.lenderProducts)) {
        // Smart filtering based on message intent
        const messageWords = message.toLowerCase().split(' ');
        const isSeekingFinancing = messageWords.some((word: string) => 
          ['loan', 'financing', 'money', 'fund', 'capital', 'credit', 'amount', 'borrow'].includes(word)
        );
        
        if (isSeekingFinancing) {
          // Filter products that might match user's request
          recommendations = session.context.lenderProducts
            .filter((product: any) => product.isActive !== false)
            .slice(0, 3); // Top 3 recommendations
          
          console.log(`🎯 [CHAT] Generated ${recommendations.length} lender recommendations for financing inquiry`);
        }
      }
    } catch (error) {
      console.error('❌ Error processing lender recommendations:', error);
    }

    // Add assistant response to session
    const assistantMessage = {
      role: 'assistant' as const,
      content: aiResponse,
      timestamp: new Date()
    };
    session.messages.push(assistantMessage);

    // Check if escalation is needed
    if (sentimentAnalysis.escalationRecommended && !session.escalated) {
      session.escalated = true;
      console.log(`🚨 Chat session ${sessionId} flagged for escalation`);
      
      // You could trigger a notification to staff here
      // await triggerStaffNotification(sessionId, 'chat-escalation');
    }

    session.updatedAt = new Date();
    chatSessions.set(sessionId, session);

    res.json({
      success: true,
      response: aiResponse,
      sentiment: sentimentAnalysis,
      escalated: session.escalated,
      recommendations: recommendations.length > 0 ? recommendations : undefined
    });

  } catch (error) {
    console.error('❌ Chat message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
});

/**
 * GET /api/chat/history/:sessionId
 * Get chat history for a session
 */
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = chatSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      sessionId,
      messages: session.messages,
      escalated: session.escalated,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    });

  } catch (error) {
    console.error('❌ Chat history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get chat history'
    });
  }
});

/**
 * POST /api/chat/escalate
 * Manually escalate a chat session to human agent
 */
router.post('/escalate', async (req, res) => {
  try {
    const { sessionId, reason, applicationId, transcript, user_input } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Chat session not found'
      });
    }

    // Generate conversation summary for staff
    const summary = await openaiService.summarizeConversation(session.messages);

    // Prepare escalation data matching the expected format
    const escalationData = {
      sessionId,
      applicationId: applicationId || session.applicationId,
      transcript: transcript || session.messages,
      user_input: user_input || reason || 'User requested human assistance',
      summary,
      escalatedAt: new Date().toISOString(),
      reason: reason || 'Manual escalation requested'
    };

    session.escalated = true;
    session.updatedAt = new Date();
    chatSessions.set(sessionId, session);

    console.log(`🚨 Chat session ${sessionId} escalated to human agent`);
    console.log(`📝 Escalation data:`, escalationData);

    // Send push notification to staff about escalation
    try {
      const notificationResponse = await fetch(`${req.protocol}://${req.get('host')}/api/notifications/agent-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: escalationData.applicationId,
          message: `Chat escalation: ${escalationData.user_input}`
        })
      });
      
      if (notificationResponse.ok) {
        console.log('✅ Staff notification sent for chat escalation');
      }
    } catch (notifyError) {
      console.warn('⚠️ Failed to send staff notification:', notifyError);
    }

    res.json({
      success: true,
      message: 'Chat escalated to human agent. You should receive a response shortly.',
      summary,
      escalationData
    });

  } catch (error) {
    console.error('❌ Chat escalation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to escalate chat'
    });
  }
});

/**
 * GET /api/chat/sessions
 * Get all chat sessions (for staff dashboard)
 */
router.get('/sessions', async (req, res) => {
  try {
    const sessions = Array.from(chatSessions.values()).map(session => ({
      sessionId: session.sessionId,
      userId: session.userId,
      applicationId: session.applicationId,
      messageCount: session.messages.length,
      escalated: session.escalated,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      lastMessage: session.messages[session.messages.length - 1]?.content?.substring(0, 100) || 'No messages'
    }));

    res.json({
      success: true,
      sessions: sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    });

  } catch (error) {
    console.error('❌ Get chat sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get chat sessions'
    });
  }
});

/**
 * POST /api/chat/initialize-assistant
 * Initialize the OpenAI Assistant (for setup)
 */
router.post('/initialize-assistant', async (req, res) => {
  try {
    const assistantId = await openaiService.initializeAssistant();
    
    res.json({
      success: true,
      assistantId,
      message: 'OpenAI Assistant initialized successfully'
    });

  } catch (error) {
    console.error('❌ Assistant initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize OpenAI Assistant'
    });
  }
});

export default router;