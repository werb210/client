/**
 * Chatbot Training Script - Generate Training Data from Lender Product Schema
 * Parses lender products and creates training examples for Step 2 support
 */

import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface LenderProduct {
  id: string;
  name: string;
  lender_name?: string;
  lenderName?: string;
  category: string;
  country: string;
  geography?: string[];
  minAmount?: number;
  maxAmount?: number;
  amountMin?: number;
  amountMax?: number;
  amount_min?: number;
  amount_max?: number;
  requiredDocuments?: string[];
  doc_requirements?: string[];
  documentRequirements?: string[];
}

interface TrainingExample {
  user: string;
  bot: string;
  metadata: {
    category: string;
    country: string;
    context: string;
  };
}

/**
 * Unified field access functions (mirrored from lib/fieldAccess.ts)
 */
const getAmountRange = (product: LenderProduct): { min: number; max: number } => {
  const min = product.minAmount ?? product.amountMin ?? product.amount_min ?? 0;
  const max = product.maxAmount ?? product.amountMax ?? product.amount_max ?? Infinity;
  return { min, max };
};

const getGeography = (product: LenderProduct): string[] => {
  if (product.geography && Array.isArray(product.geography)) {
    return product.geography;
  }
  return product.country ? [product.country] : ['US'];
};

const getLenderName = (product: LenderProduct): string => {
  return product.lender_name || product.lenderName || 'Unknown Lender';
};

const getRequiredDocuments = (product: LenderProduct): string[] => {
  return product.requiredDocuments || product.doc_requirements || product.documentRequirements || [];
};

/**
 * Fetch lender products from the API
 */
async function fetchLenderProducts(): Promise<LenderProduct[]> {
  try {
    const response = await fetch('http://localhost:5000/api/public/lenders');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.products || data || [];
  } catch (error) {
    console.error('Failed to fetch lender products:', error);
    return [];
  }
}

/**
 * Generate training examples from product data
 */
function generateTrainingExamples(products: LenderProduct[]): TrainingExample[] {
  const examples: TrainingExample[] = [];
  
  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {} as Record<string, LenderProduct[]>);
  
  // Generate examples for each category
  Object.entries(productsByCategory).forEach(([category, categoryProducts]) => {
    // Amount range questions
    const amounts = categoryProducts.map(p => getAmountRange(p));
    const minAmount = Math.min(...amounts.map(a => a.min));
    const maxAmount = Math.max(...amounts.filter(a => a.max !== Infinity).map(a => a.max));
    
    examples.push({
      user: `What is the minimum amount for ${category}?`,
      bot: `For ${category}, our lenders offer funding starting from $${minAmount.toLocaleString()}. The range varies by lender, with some offering up to $${maxAmount === Infinity ? '5M+' : maxAmount.toLocaleString()}. Would you like to see specific options?`,
      metadata: {
        category,
        country: 'ALL',
        context: 'amount_inquiry'
      }
    });
    
    // Geography questions
    const allCountries = [...new Set(categoryProducts.flatMap(p => getGeography(p)))];
    allCountries.forEach(country => {
      const countryProducts = categoryProducts.filter(p => getGeography(p).includes(country));
      examples.push({
        user: `Do you have ${category} options in ${country === 'CA' ? 'Canada' : country === 'US' ? 'United States' : country}?`,
        bot: `Yes! We have ${countryProducts.length} ${category} ${countryProducts.length === 1 ? 'option' : 'options'} available in ${country === 'CA' ? 'Canada' : country === 'US' ? 'United States' : country}. These range from $${Math.min(...countryProducts.map(p => getAmountRange(p).min)).toLocaleString()} to $${Math.max(...countryProducts.map(p => getAmountRange(p).max)).toLocaleString()}. Should I show you the details?`,
        metadata: {
          category,
          country,
          context: 'geography_inquiry'
        }
      });
    });
    
    // Document requirements
    const allDocs = [...new Set(categoryProducts.flatMap(p => getRequiredDocuments(p)))];
    if (allDocs.length > 0) {
      examples.push({
        user: `What documents do I need for ${category}?`,
        bot: `For ${category}, you'll typically need: ${allDocs.slice(0, 3).join(', ')}${allDocs.length > 3 ? `, and ${allDocs.length - 3} more documents` : ''}. The exact requirements depend on your specific situation and chosen lender. I can help you prepare these during your application.`,
        metadata: {
          category,
          country: 'ALL',
          context: 'document_inquiry'
        }
      });
    }
    
    // Qualification questions
    examples.push({
      user: `Do I qualify for ${category}?`,
      bot: `${category} eligibility depends on factors like your business revenue, time in business, and credit score. Generally, you'll need at least 6 months in business and $10,000+ monthly revenue. Would you like to start an application to see your specific options?`,
      metadata: {
        category,
        country: 'ALL',
        context: 'qualification_inquiry'
      }
    });
  });
  
  // General business questions
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
 * Use OpenAI to enhance and validate training examples
 */
async function enhanceTrainingExamples(examples: TrainingExample[]): Promise<TrainingExample[]> {
  console.log('📚 Enhancing training examples with OpenAI...');
  
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
          
          Return the enhanced examples in the same JSON format.`
        },
        {
          role: "user",
          content: `Please enhance these training examples:\n\n${JSON.stringify(examples.slice(0, 10), null, 2)}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const enhancedData = JSON.parse(response.choices[0].message.content || '{}');
    console.log('✅ Training examples enhanced with OpenAI');
    
    // Merge enhanced examples with originals
    return enhancedData.examples || examples;
  } catch (error) {
    console.warn('⚠️ OpenAI enhancement failed, using original examples:', error);
    return examples;
  }
}

/**
 * Save training data to public directory
 */
async function saveTrainingData(examples: TrainingExample[]): Promise<void> {
  const trainingData = {
    version: "1.0",
    generated: new Date().toISOString(),
    totalExamples: examples.length,
    categories: [...new Set(examples.map(e => e.metadata.category))],
    examples
  };
  
  const outputPath = path.join(process.cwd(), 'public', 'chat-training.json');
  await fs.writeFile(outputPath, JSON.stringify(trainingData, null, 2));
  console.log(`💾 Training data saved to ${outputPath}`);
  console.log(`📊 Generated ${examples.length} training examples`);
}

/**
 * Main training function
 */
async function trainChatbot(): Promise<void> {
  console.log('🤖 Starting chatbot training from lender product schema...');
  
  try {
    // Fetch lender products
    console.log('📡 Fetching lender products...');
    const products = await fetchLenderProducts();
    console.log(`✅ Loaded ${products.length} lender products`);
    
    if (products.length === 0) {
      throw new Error('No lender products available for training');
    }
    
    // Generate training examples
    console.log('🎯 Generating training examples...');
    const examples = generateTrainingExamples(products);
    console.log(`✅ Generated ${examples.length} initial training examples`);
    
    // Enhance with OpenAI
    const enhancedExamples = await enhanceTrainingExamples(examples);
    
    // Save training data
    await saveTrainingData(enhancedExamples);
    
    console.log('🎉 Chatbot training complete!');
    console.log(`📈 Training data includes ${enhancedExamples.length} examples across ${[...new Set(enhancedExamples.map(e => e.metadata.category))].length} categories`);
    
  } catch (error) {
    console.error('❌ Chatbot training failed:', error);
    process.exit(1);
  }
}

// Run training if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  trainChatbot();
}

export { trainChatbot, fetchLenderProducts, generateTrainingExamples };