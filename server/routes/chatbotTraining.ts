/**
 * Server Routes for Chatbot Training System
 * Handles training data generation and management
 */

import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface TrainingExample {
  user: string;
  bot: string;
  metadata: {
    category: string;
    country: string;
    context: string;
  };
}

interface TrainingData {
  version: string;
  generated: string;
  totalExamples: number;
  categories: string[];
  examples: TrainingExample[];
}

/**
 * POST /api/save-training-data
 * Save generated training data to public directory
 */
router.post('/save-training-data', async (req, res) => {
  try {
    const trainingData: TrainingData = req.body;
    
    // Validate training data structure
    if (!trainingData.version || !trainingData.examples || !Array.isArray(trainingData.examples)) {
      return res.status(400).json({ 
        error: 'Invalid training data format' 
      });
    }
    
    // Save to public directory
    const publicPath = path.join(process.cwd(), 'public', 'chat-training.json');
    await fs.writeFile(publicPath, JSON.stringify(trainingData, null, 2));
    
    console.log(`💾 [TRAINING] Saved ${trainingData.totalExamples} training examples to chat-training.json`);
    
    res.json({ 
      success: true, 
      message: 'Training data saved successfully',
      totalExamples: trainingData.totalExamples,
      categories: trainingData.categories.length
    });
    
  } catch (error) {
    console.error('❌ [TRAINING] Failed to save training data:', error);
    res.status(500).json({ 
      error: 'Failed to save training data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/training-data
 * Retrieve current training data
 */
router.get('/training-data', async (req, res) => {
  try {
    const publicPath = path.join(process.cwd(), 'public', 'chat-training.json');
    
    try {
      const data = await fs.readFile(publicPath, 'utf-8');
      const trainingData = JSON.parse(data);
      
      console.log(`📚 [TRAINING] Loaded ${trainingData.totalExamples} training examples`);
      
      res.json(trainingData);
    } catch (fileError) {
      // Training data doesn't exist yet
      res.status(404).json({ 
        error: 'No training data found',
        message: 'Training data has not been generated yet'
      });
    }
    
  } catch (error) {
    console.error('❌ [TRAINING] Failed to load training data:', error);
    res.status(500).json({ 
      error: 'Failed to load training data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/generate-training
 * Generate new training data from lender products
 */
router.post('/generate-training', async (req, res) => {
  try {
    console.log('🤖 [TRAINING] Starting training data generation...');
    
    // Fetch lender products from the existing API endpoint
    const lenderResponse = await fetch('http://localhost:5000/api/public/lenders');
    if (!lenderResponse.ok) {
      throw new Error(`Failed to fetch lender products: ${lenderResponse.status}`);
    }
    
    const lenderData = await lenderResponse.json();
    const products = lenderData.products || lenderData || [];
    
    if (products.length === 0) {
      return res.status(400).json({
        error: 'No lender products available',
        message: 'Cannot generate training data without product data'
      });
    }
    
    console.log(`📡 [TRAINING] Loaded ${products.length} lender products for training`);
    
    // Generate training examples
    const examples = generateTrainingExamples(products);
    console.log(`🎯 [TRAINING] Generated ${examples.length} initial training examples`);
    
    // Enhance with OpenAI (optional - may fail if API key not available)
    let enhancedExamples = examples;
    try {
      if (process.env.OPENAI_API_KEY) {
        enhancedExamples = await enhanceWithOpenAI(examples.slice(0, 10));
        console.log('🧠 [TRAINING] Enhanced examples with OpenAI');
      }
    } catch (enhanceError) {
      console.warn('⚠️ [TRAINING] OpenAI enhancement failed, using original examples');
    }
    
    // Create training data object
    const trainingData: TrainingData = {
      version: "1.0",
      generated: new Date().toISOString(),
      totalExamples: enhancedExamples.length,
      categories: [...new Set(enhancedExamples.map(e => e.metadata.category))],
      examples: enhancedExamples
    };
    
    // Save to public directory
    const publicPath = path.join(process.cwd(), 'public', 'chat-training.json');
    await fs.writeFile(publicPath, JSON.stringify(trainingData, null, 2));
    
    console.log(`🎉 [TRAINING] Training complete! Generated ${trainingData.totalExamples} examples across ${trainingData.categories.length} categories`);
    
    res.json({
      success: true,
      message: 'Training data generated successfully',
      data: trainingData
    });
    
  } catch (error) {
    console.error('❌ [TRAINING] Training generation failed:', error);
    res.status(500).json({
      error: 'Training generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Generate training examples from lender product data
 */
function generateTrainingExamples(products: any[]): TrainingExample[] {
  const examples: TrainingExample[] = [];
  
  // Group products by category
  const productsByCategory = products.reduce((acc: Record<string, any[]>, product: any) => {
    const category = product.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {} as Record<string, any[]>);

  Object.entries(productsByCategory).forEach(([category, categoryProducts]: [string, any[]]) => {
    // Amount questions
    const amounts = categoryProducts.map((p: any) => ({
      min: p.minAmount ?? p.amountMin ?? p.amount_min ?? 0,
      max: p.maxAmount ?? p.amountMax ?? p.amount_max ?? Infinity
    }));
    const minAmount = Math.min(...amounts.map((a: any) => a.min));
    const maxAmount = Math.max(...amounts.filter((a: any) => a.max !== Infinity).map((a: any) => a.max));

    examples.push({
      user: `What is the minimum amount for ${category}?`,
      bot: `For ${category}, our lenders offer funding starting from $${minAmount.toLocaleString()}. The range varies by lender, with some offering up to $${maxAmount === Infinity ? '5M+' : maxAmount.toLocaleString()}. Would you like to see specific options?`,
      metadata: { category, country: 'ALL', context: 'amount_inquiry' }
    });

    // Geography questions
    const allCountries = Array.from(new Set(categoryProducts.flatMap((p: any) => 
      p.geography && Array.isArray(p.geography) ? p.geography : [p.country].filter(Boolean)
    )));

    allCountries.forEach(country => {
      const countryProducts = categoryProducts.filter((p: any) => {
        const geography = p.geography && Array.isArray(p.geography) ? p.geography : [p.country].filter(Boolean);
        return geography.includes(country);
      });

      examples.push({
        user: `Do you have ${category} options in ${country === 'CA' ? 'Canada' : country === 'US' ? 'United States' : country}?`,
        bot: `Yes! We have ${countryProducts.length} ${category} ${countryProducts.length === 1 ? 'option' : 'options'} available in ${country === 'CA' ? 'Canada' : country === 'US' ? 'United States' : country}. Should I show you the details?`,
        metadata: { category, country, context: 'geography_inquiry' }
      });
    });

    // Document requirements
    const allDocs = Array.from(new Set(categoryProducts.flatMap((p: any) => 
      p.requiredDocuments || p.doc_requirements || p.documentRequirements || []
    )));
    
    if (allDocs.length > 0) {
      examples.push({
        user: `What documents do I need for ${category}?`,
        bot: `For ${category}, you'll typically need: ${allDocs.slice(0, 3).join(', ')}${allDocs.length > 3 ? `, and ${allDocs.length - 3} more documents` : ''}. The exact requirements depend on your specific situation and chosen lender. I can help you prepare these during your application.`,
        metadata: { category, country: 'ALL', context: 'document_inquiry' }
      });
    }

    // Qualification questions
    examples.push({
      user: `Do I qualify for ${category}?`,
      bot: `${category} eligibility depends on factors like your business revenue, time in business, and credit score. Generally, you'll need at least 6 months in business and $10,000+ monthly revenue. Would you like to start an application to see your specific options?`,
      metadata: { category, country: 'ALL', context: 'qualification_inquiry' }
    });
  });

  // General questions
  examples.push(
    {
      user: "What types of business funding do you offer?",
      bot: `We offer ${Object.keys(productsByCategory).length} main types of business funding: ${Object.keys(productsByCategory).join(', ')}. Each has different requirements and use cases. What type of funding are you looking for?`,
      metadata: { category: 'GENERAL', country: 'ALL', context: 'product_overview' }
    },
    {
      user: "How fast can I get funded?",
      bot: "Funding speed varies by product type. Working Capital and Lines of Credit can fund in 1-3 business days, while Equipment Financing may take 3-7 days for final approval. Invoice Factoring can be same-day once approved. What type of funding interests you?",
      metadata: { category: 'GENERAL', country: 'ALL', context: 'timing_inquiry' }
    },
    {
      user: "What are your interest rates?",
      bot: "Interest rates vary significantly based on your business profile, funding type, and amount. Working Capital rates typically range from 8-40% APR, while Equipment Financing can be as low as 6-25%. I'd recommend starting an application to see your personalized rates.",
      metadata: { category: 'GENERAL', country: 'ALL', context: 'rates_inquiry' }
    }
  );

  return examples;
}

/**
 * Enhance training examples with OpenAI
 */
async function enhanceWithOpenAI(examples: TrainingExample[]): Promise<TrainingExample[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert at creating chatbot training data for business financing applications. 
          
          Review and enhance the provided training examples to make them more natural, helpful, and conversational. 
          
          Guidelines:
          - Keep responses helpful but concise (2-3 sentences max)
          - Use natural, friendly business language
          - Always end with a question or call-to-action when appropriate
          - Include specific numbers and details when available
          - Make the bot sound knowledgeable but approachable
          
          Return the enhanced examples in JSON format with the same structure.`
        },
        {
          role: "user",
          content: `Please enhance these training examples:\n\n${JSON.stringify(examples, null, 2)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const enhancedData = JSON.parse(response.choices[0].message.content || '{}');
    return enhancedData.examples || examples;
    
  } catch (error) {
    console.warn('⚠️ OpenAI enhancement failed:', error);
    return examples;
  }
}

export default router;