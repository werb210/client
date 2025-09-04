import { Router } from 'express';
import OpenAI from 'openai';
import { logger } from '../utils/logger';

const router = Router();

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Sentiment & Intent Analysis endpoint
router.post('/analyze', async (req, res) => {
  try {
    const { text, sessionId } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a sentiment and intent analysis expert for a financial services chatbot. 
          Analyze the user's message and respond with JSON containing:
          - sentiment: "positive", "neutral", "negative", or "frustrated"
          - intent: one of "question", "complaint", "application_help", "product_inquiry", "status_check", "document_help", "technical_issue", "pricing", "general"
          - confidence: a number between 0 and 1
          - requires_handoff: boolean (true if user is frustrated, angry, or needs human assistance)
          - urgency: "low", "medium", "high"
          
          Consider financial context - users asking about loan denials, application issues, or expressing confusion should be flagged for handoff.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Log analysis for monitoring (sanitized for production)
    logger.debug('[SENTIMENT] Analysis completed', { 
      sessionId: '[REDACTED]', 
      textLength: text.length,
      sentiment: analysis.sentiment,
      intent: analysis.intent 
    });

    res.json(analysis);
  } catch (error) {
    logger.error('Sentiment analysis error', error);
    res.status(500).json({ 
      error: 'Analysis failed',
      sentiment: 'neutral',
      intent: 'general',
      confidence: 0.5,
      requires_handoff: false,
      urgency: 'low'
    });
  }
});

export default router;