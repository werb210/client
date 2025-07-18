import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function definitions for OpenAI function calling
const functions = [
  {
    name: 'get_product_recommendations',
    description: 'Get personalized product recommendations based on user criteria',
    parameters: {
      type: 'object',
      properties: {
        fundingAmount: { type: 'number', description: 'Requested funding amount' },
        businessType: { type: 'string', description: 'Type of business' },
        creditScore: { type: 'number', description: 'Credit score range' },
        location: { type: 'string', description: 'Business location (Canada/US)' }
      },
      required: ['fundingAmount']
    }
  },
  {
    name: 'get_step_guidance',
    description: 'Provide guidance for a specific application step',
    parameters: {
      type: 'object',
      properties: {
        step: { type: 'number', description: 'Current step number (1-7)' },
        issue: { type: 'string', description: 'Specific issue or question' }
      },
      required: ['step']
    }
  },
  {
    name: 'get_document_requirements',
    description: 'Get required documents for application',
    parameters: {
      type: 'object',
      properties: {
        productType: { type: 'string', description: 'Type of financing product' },
        businessLocation: { type: 'string', description: 'Business location' }
      }
    }
  }
];

// Chat endpoint with RAG integration
router.post('/chat', async (req, res) => {
  try {
    const { message, context, messages, sessionId, sentiment, intent } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build system message with enhanced context
    const systemMessage = buildSystemMessage(context, sentiment, intent);
    
    // RAG: Embed query and retrieve relevant documentation chunks
    const relevantDocs = await retrieveRelevantDocs(message, context);
    
    // Convert previous messages to OpenAI format
    const conversationHistory = messages?.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    })) || [];

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemMessage },
        ...relevantDocs.map(doc => ({ role: 'system', content: `Knowledge: ${doc}` })),
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: message }
      ],
      functions,
      function_call: 'auto',
      temperature: sentiment === 'negative' || sentiment === 'frustrated' ? 0.3 : 0.7,
      max_tokens: 1000
    });

    const choice = completion.choices[0];
    
    if (choice.message.function_call) {
      // Handle function call
      const functionResult = await handleFunctionCall(
        choice.message.function_call.name,
        JSON.parse(choice.message.function_call.arguments),
        context
      );
      
      return res.json({ 
        reply: functionResult,
        function_called: choice.message.function_call.name
      });
    } else {
      // Regular response
      return res.json({ 
        reply: choice.message.content || 'I apologize, but I couldn\'t generate a response. Please try rephrasing your question.'
      });
    }

  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      return res.status(500).json({ 
        error: 'OpenAI API configuration issue. Please check API key setup.' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to process chat request. Please try again.' 
    });
  }
});

// Enhanced RAG: Retrieve relevant documentation chunks with product database access
async function retrieveRelevantDocs(query: string, context: any): Promise<string[]> {
  const relevantDocs = [];
  const queryLower = query.toLowerCase();
  
  // Knowledge base of financial terms and processes
  const knowledgeBase = [
    "Working Capital loans provide funding for day-to-day business operations, inventory, and short-term expenses. Typical amounts range from $10,000 to $500,000.",
    "Equipment Financing helps businesses purchase machinery, vehicles, or technology. The equipment serves as collateral, often offering better rates.",
    "Lines of Credit offer flexible access to funds when needed. Draw funds up to your limit and only pay interest on what you use.",
    "Invoice Factoring converts outstanding invoices into immediate cash by selling them to a factoring company at a discount.",
    "Term Loans provide a lump sum for major business investments with fixed monthly payments over 1-10 years.",
    "Required documents typically include: Bank Statements (3-6 months), Tax Returns (2 years), Financial Statements, Business License, and ID.",
    "Canadian businesses may need additional documents including GST/HST returns and CRA business registration.",
    "DSCR (Debt Service Coverage Ratio) measures your ability to repay debt. A ratio above 1.25 is generally considered good.",
    "Business credit scores range from 0-100, with scores above 75 considered excellent for lending purposes.",
    "Application processing typically takes 2-5 business days, with funding available within 1-2 weeks of approval."
  ];

  // Add relevant knowledge base entries
  const relevantKnowledge = knowledgeBase.filter(doc => {
    const docLower = doc.toLowerCase();
    return queryLower.split(' ').some(word => 
      word.length > 3 && docLower.includes(word)
    );
  });
  
  relevantDocs.push(...relevantKnowledge.slice(0, 3));
  
  // Enhanced product retrieval with higher k value (up to 20 products)
  const { products } = context || {};
  if (products && products.length > 0) {
    console.log(`🤖 [RAG] Processing ${products.length} total products for query: "${query}"`);
    
    // Product-specific keyword matching with expanded retrieval
    const productKeywords = [
      'rate', 'rates', 'lowest', 'best', 'cheap', 'expensive', 'cost', 'price', 'pricing',
      'working capital', 'equipment', 'line of credit', 'loc', 'term loan', 'factoring',
      'invoice', 'business loan', 'financing', 'credit', 'loan', 'amount', 'maximum',
      'minimum', 'canada', 'canadian', 'us', 'american', 'requirements', 'documents'
    ];
    
    const hasProductQuery = productKeywords.some(keyword => 
      queryLower.includes(keyword)
    );
    
    if (hasProductQuery) {
      // Retrieve up to 20 relevant products (increased from 5)
      const k = 20;
      
      // Enhanced product filtering with multiple criteria
      const relevantProducts = products.filter((product: any) => {
        const productText = JSON.stringify(product).toLowerCase();
        const productName = (product.name || product.product || '').toLowerCase();
        const productCategory = (product.category || '').toLowerCase();
        
        // Check if query matches product content
        const matchesQuery = queryLower.split(' ').some(word => {
          if (word.length < 3) return false;
          return productText.includes(word) || productName.includes(word) || productCategory.includes(word);
        });
        
        // Priority matching for specific product types
        const isSpecificProductType = (
          (queryLower.includes('working capital') && productCategory.includes('working')) ||
          (queryLower.includes('equipment') && productCategory.includes('equipment')) ||
          (queryLower.includes('line of credit') && productCategory.includes('line')) ||
          (queryLower.includes('loc') && productCategory.includes('line')) ||
          (queryLower.includes('factoring') && productCategory.includes('factoring')) ||
          (queryLower.includes('term loan') && productCategory.includes('term'))
        );
        
        return matchesQuery || isSpecificProductType;
      }).slice(0, k);
      
      console.log(`🤖 [RAG] Found ${relevantProducts.length} relevant products out of ${products.length} total`);
      
      // Create product documentation chunks
      relevantProducts.forEach((product: any, index: number) => {
        const productDoc = `Product ${index + 1}: ${product.name || product.product || 'Unknown'} - ` +
          `Category: ${product.category || 'N/A'}, ` +
          `Rate: ${product.rate || 'Contact for rates'}, ` +
          `Amount: $${product.min_amount?.toLocaleString() || '0'} - $${product.max_amount?.toLocaleString() || 'Contact for max'}, ` +
          `Geography: ${product.geography || product.country || 'N/A'}, ` +
          `Requirements: ${product.doc_requirements || product.documentRequirements || 'Standard business docs'}`;
        
        relevantDocs.push(productDoc);
      });
      
      // Add comprehensive product summary
      if (relevantProducts.length > 0) {
        const productSummary = `Product Database Access: Successfully retrieved ${relevantProducts.length} products from ${products.length} total available products. ` +
          `Categories include: ${[...new Set(relevantProducts.map((p: any) => p.category).filter(Boolean))].join(', ')}`;
        relevantDocs.push(productSummary);
      }
    } else {
      // For non-product queries, still include basic product overview
      const productOverview = `Product Database: ${products.length} total financing products available including Working Capital, Equipment Financing, Lines of Credit, Term Loans, and Invoice Factoring across Canadian and US markets.`;
      relevantDocs.push(productOverview);
    }
  } else {
    console.warn('🤖 [RAG] WARNING: No products available in context for enhanced retrieval');
  }

  console.log(`🤖 [RAG] Final retrieval: ${relevantDocs.length} documentation chunks for AI context`);
  return relevantDocs;
}

function buildSystemMessage(context: any, sentiment?: string, intent?: string): string {
  const { currentStep, applicationData, products } = context || {};
  
  let systemMessage = `You are FinBot, a knowledgeable financing assistant for Boreal Financial. You provide expert guidance on business loans and applications with empathy and precision.

Core Capabilities:
- Business financing consultation (working capital, equipment, lines of credit, term loans)
- Step-by-step application guidance through our 7-step process
- Document requirement explanation and assistance
- Canadian and US market expertise
- Financial term definitions and education

Communication Style:
- Be conversational but professional
- Use clear, jargon-free explanations
- Offer specific next steps when possible
- Proactively suggest human handoff for complex situations

Product Database Access: ${products?.length || 0} total financing products available across all categories and markets. You have full access to product details including rates, amounts, requirements, and geographic availability through the RAG system.`;

  if (currentStep) {
    systemMessage += `\n\nCurrent Context:
- User is on Step ${currentStep} of 7: ${getStepDescription(currentStep)}
- Tailor your response to their current stage`;
  }

  if (applicationData) {
    systemMessage += `\n\nApplication Data: ${JSON.stringify(applicationData)}`;
  }

  // Enhanced sentiment and intent handling
  if (sentiment || intent) {
    systemMessage += `\n\nUser State Analysis:
- Sentiment: ${sentiment || 'neutral'}
- Intent: ${intent || 'general'}
- Confidence Level: High`;
    
    if (sentiment === 'negative' || sentiment === 'frustrated') {
      systemMessage += `\n\n🚨 PRIORITY RESPONSE: User shows frustration. Respond with:
1. Immediate empathy and acknowledgment
2. Clear, simple solution or next step
3. Offer human assistance: "I can connect you with a specialist"
4. Avoid complex explanations - keep it simple and direct`;
    }
    
    if (intent === 'product_inquiry') {
      systemMessage += `\n\n💡 FOCUS: User is researching products. Provide specific recommendations based on their business type and needs.`;
    }
  }

  systemMessage += `\n\nGuidelines:
- Be helpful, professional, and concise
- Provide specific guidance based on the user's current step
- Use function calls when appropriate to provide structured recommendations
- If asked about documents, be specific about requirements
- Guide users toward completing their application
- Explain technical terms in simple language`;

  return systemMessage;
}

function getStepDescription(step: number): string {
  const descriptions = {
    1: 'Financial Profile - Basic funding requirements',
    2: 'Product Recommendations - Choosing the right product',
    3: 'Business Details - Company information',
    4: 'Applicant Information - Personal details',
    5: 'Document Upload - Required documentation',
    6: 'Application Review - Final review',
    7: 'Submission - Application completion'
  };
  return descriptions[step as keyof typeof descriptions] || 'Unknown step';
}

async function handleFunctionCall(functionName: string, args: any, context: any): string {
  switch (functionName) {
    case 'get_product_recommendations':
      return handleProductRecommendations(args, context);
    
    case 'get_step_guidance':
      return handleStepGuidance(args, context);
    
    case 'get_document_requirements':
      return handleDocumentRequirements(args, context);
    
    default:
      return 'I encountered an issue with that request. Please try asking in a different way.';
  }
}

function handleProductRecommendations(args: any, context: any): string {
  const { fundingAmount, businessType, creditScore, location } = args;
  const { products } = context || {};
  
  if (!products || products.length === 0) {
    return 'I don\'t have access to current product information. Please check our Step 2 recommendations page for available financing options.';
  }

  console.log(`🤖 [FUNCTION_CALL] Processing product recommendations with ${products.length} total products available`);

  // Enhanced filtering with more flexible criteria
  let recommendations = products.filter((product: any) => {
    // More flexible amount matching
    if (fundingAmount && product.max_amount && fundingAmount > product.max_amount * 1.2) return false;
    if (fundingAmount && product.min_amount && fundingAmount < product.min_amount * 0.8) return false;
    
    // Geography matching with variations
    if (location) {
      const locationLower = location.toLowerCase();
      const productGeo = (product.geography || product.country || '').toLowerCase();
      const isCanada = locationLower.includes('ca') || locationLower.includes('canada');
      const isUS = locationLower.includes('us') || locationLower.includes('united states');
      
      if (isCanada && !productGeo.includes('ca') && !productGeo.includes('canada')) return false;
      if (isUS && !productGeo.includes('us') && !productGeo.includes('united states')) return false;
    }
    
    return true;
  });

  if (recommendations.length === 0) {
    return `I searched through all ${products.length} available products. Based on your funding amount of $${fundingAmount?.toLocaleString()}, I recommend reviewing our full product catalog in Step 2. Our recommendation engine will provide personalized matches based on your specific needs.`;
  }

  // Show more products when available (up to 5)
  const topProducts = recommendations.slice(0, 5);
  let response = `I found ${recommendations.length} products from our database of ${products.length} total options. Here are the top matches for your ${fundingAmount ? `$${fundingAmount.toLocaleString()} funding` : 'funding needs'}:\n\n`;
  
  topProducts.forEach((product: any, index: number) => {
    response += `${index + 1}. **${product.name || product.product || 'Product Name'}**\n`;
    if (product.rate) response += `   • Rate: ${product.rate}\n`;
    if (product.min_amount && product.max_amount) {
      response += `   • Amount: $${product.min_amount?.toLocaleString()} - $${product.max_amount?.toLocaleString()}\n`;
    }
    if (product.category) response += `   • Type: ${product.category}\n`;
    if (product.geography || product.country) response += `   • Available in: ${product.geography || product.country}\n`;
    response += '\n';
  });

  if (recommendations.length > 5) {
    response += `Plus ${recommendations.length - 5} more products available. `;
  }
  
  response += 'Would you like me to help you start an application for any of these products?';
  return response;
}

function handleStepGuidance(args: any, context: any): string {
  const { step, issue } = args;
  
  const stepGuidance = {
    1: 'In Step 1, you\'ll provide basic information about your funding needs including the amount required, business location, and intended use of funds. This helps our system recommend the most suitable products for your situation.',
    
    2: 'Step 2 shows personalized product recommendations based on your Step 1 information. Review the available options and select the category that best matches your needs. Each product shows rates, terms, and requirements.',
    
    3: 'Step 3 collects detailed business information including legal name, operating name, address, business structure, revenue, and employee count. All fields marked with * are required.',
    
    4: 'Step 4 gathers applicant information including personal details, contact information, and ownership percentage. This creates your application ID for document uploads.',
    
    5: 'Step 5 handles document uploads. Based on your selected product, you\'ll see specific document requirements. Upload files directly - they\'re processed immediately.',
    
    6: 'Step 6 allows you to review all your information before final submission. Check all details carefully as changes after submission may require additional processing time.',
    
    7: 'Step 7 is the final submission. Once submitted, you\'ll receive confirmation and our team will begin reviewing your application.'
  };

  let guidance = stepGuidance[step as keyof typeof stepGuidance] || 'I can help with any step of the application process.';
  
  if (issue) {
    guidance += `\n\nRegarding your specific issue: "${issue}" - Please let me know what specific problem you're encountering and I'll provide targeted assistance.`;
  }
  
  return guidance;
}

function handleDocumentRequirements(args: any, context: any): string {
  const { productType, businessLocation } = args;
  
  let requirements = 'Common document requirements include:\n\n';
  requirements += '**Business Documents:**\n';
  requirements += '• Bank statements (last 3-6 months)\n';
  requirements += '• Business registration/incorporation documents\n';
  requirements += '• Financial statements\n';
  requirements += '• Tax returns (business and personal)\n\n';
  
  requirements += '**Personal Documents:**\n';
  requirements += '• Government-issued ID (driver\'s license, passport)\n';
  requirements += '• Social Insurance Number (Canada) or Social Security Number (US)\n';
  requirements += '• Personal bank statements\n\n';
  
  if (businessLocation === 'canada') {
    requirements += '**Canada-Specific:**\n';
    requirements += '• GST/HST registration (if applicable)\n';
    requirements += '• Articles of incorporation\n\n';
  }
  
  if (productType) {
    requirements += `**Additional for ${productType}:**\n`;
    if (productType.toLowerCase().includes('equipment')) {
      requirements += '• Equipment quotes or invoices\n';
      requirements += '• Equipment specifications\n';
    } else if (productType.toLowerCase().includes('invoice')) {
      requirements += '• Accounts receivable aging report\n';
      requirements += '• Sample invoices\n';
    }
  }
  
  requirements += '\nThe exact requirements will be displayed in Step 5 based on your selected product and business details.';
  
  return requirements;
}

export default router;