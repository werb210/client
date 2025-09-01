import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Translation endpoint
router.post('/translate', async (req, res) => {
  try {
    const { text, fromLang, toLang, sessionId } = req.body;

    if (!text || !toLang) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

    // Auto-detect source language if not provided
    const sourceLanguage = fromLang || 'auto-detect';
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator specializing in financial services terminology. 
          Translate the following text ${sourceLanguage === 'auto-detect' ? 'to' : `from ${sourceLanguage} to`} ${toLang}.
          Maintain the original meaning and tone, especially for financial terms.
          Respond only with the translated text, no explanations.
          
          Common financial terms to preserve context:
          - DSCR = Debt Service Coverage Ratio
          - Working Capital = funds for daily operations
          - Equipment Financing = loans for business equipment
          - Line of Credit = flexible borrowing option
          - Invoice Factoring = selling invoices for immediate cash`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.1 // Low temperature for consistent translations
    });

    const translatedText = completion.choices[0].message.content || text;
    
    // Translation monitoring removed for production

    res.json({ 
      translatedText,
      originalText: text,
      fromLang: sourceLanguage,
      toLang
    });
  } catch (error) {
    // Translation error handled
    res.status(500).json({ 
      error: 'Translation failed',
      translatedText: req.body.text // Return original text as fallback
    });
  }
});

// Language detection endpoint
router.post('/detect-language', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Detect the language of the following text and respond with JSON containing:
          - language: ISO 639-1 language code (e.g., "en", "fr", "es", "zh")
          - language_name: full language name (e.g., "English", "French", "Spanish", "Chinese")
          - confidence: number between 0 and 1
          - is_english: boolean`
        },
        {
          role: 'user',
          content: text
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    const detection = JSON.parse(completion.choices[0].message.content || '{}');
    
    res.json(detection);
  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({ 
      error: 'Detection failed',
      language: 'en',
      language_name: 'English',
      confidence: 0.5,
      is_english: true
    });
  }
});

export default router;