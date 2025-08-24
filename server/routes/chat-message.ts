// server/routes/chat-message.ts - AI chat message processing
import express from 'express';
// OpenAI import will be dynamic to handle missing dependency gracefully

const router = express.Router();

// OpenAI client will be initialized dynamically when needed

// POST /api/chat/message - Process AI chat messages
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, language = 'en', context = {} } = req.body;
    
    if (!message || !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'sessionId and message are required'
      });
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        success: true,
        response: "I'm here to help! However, the AI service is temporarily unavailable. Please use the 'Talk to Human' button for immediate assistance.",
        recommendations: []
      });
    }

    // Get lender products for context
    const lenderProducts = context.lenderProducts || [];
    
    // Create AI prompt with context
    const systemPrompt = `You are a helpful financial assistant for Boreal Financial. 
    
Your role:
- Help customers understand business financing options
- Provide information about loan products and lenders
- Guide customers through the application process
- Be professional, helpful, and encouraging

Available lender products context:
${lenderProducts.map((p: any) => `- ${p.lender}: ${p.name} (${p.description || 'No description'})`).join('\n')}

Customer context:
- Name: ${context.name || 'Customer'}
- Email: ${context.email || 'Not provided'}
- Language: ${language}

Guidelines:
- Keep responses conversational and helpful
- Don't share sensitive information
- Suggest appropriate products when relevant
- Encourage customers to complete applications
- If asked about specific loan amounts, provide general guidance
- Always be supportive and professional`;

    const userPrompt = `Customer message: ${message}`;

    try {
      // Dynamically import and initialize OpenAI
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      // Call OpenAI API (using gpt-5 - the newest model as per blueprint)
      const completion = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const response = completion.choices[0].message.content;

      // Simple keyword-based lender recommendations
      const recommendations: any[] = [];
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('equipment') || lowerMessage.includes('machinery')) {
        const equipmentLenders = lenderProducts.filter((p: any) => 
          p.name.toLowerCase().includes('equipment') || 
          p.description?.toLowerCase().includes('equipment')
        );
        recommendations.push(...equipmentLenders.slice(0, 2));
      }
      
      if (lowerMessage.includes('working capital') || lowerMessage.includes('cash flow')) {
        const workingCapitalLenders = lenderProducts.filter((p: any) => 
          p.name.toLowerCase().includes('working') || 
          p.name.toLowerCase().includes('capital') ||
          p.description?.toLowerCase().includes('working capital')
        );
        recommendations.push(...workingCapitalLenders.slice(0, 2));
      }

      // Remove duplicates
      const uniqueRecommendations = recommendations.filter((rec: any, index: number, self: any[]) => 
        index === self.findIndex((r: any) => r.id === rec.id)
      );

      res.json({
        success: true,
        response: response || "Thank you for your message. How else can I help you with your financing needs?",
        recommendations: uniqueRecommendations.slice(0, 3), // Max 3 recommendations
        sessionId
      });

    } catch (aiError) {
      console.error('❌ [CHAT] OpenAI API error:', aiError);
      
      // Fallback response
      res.json({
        success: true,
        response: "Thank you for your question about business financing. I'd be happy to help you explore funding options. You can start an application or speak with our specialists for personalized assistance.",
        recommendations: lenderProducts.slice(0, 2), // Show first 2 products as fallback
        sessionId
      });
    }

  } catch (error) {
    console.error('❌ [CHAT] Message processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Message processing failed',
      message: 'Please try again or contact support'
    });
  }
});

export default router;