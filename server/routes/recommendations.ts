import express from 'express';
import { RecommendationEngine, RecommendationFilters } from '../recommendationEngine';

const router = express.Router();
const recommendationEngine = new RecommendationEngine();

// Get filtered loan product categories with intelligent scoring
router.get('/api/recommendations/categories', async (req, res) => {
  try {
    const { 
      country, 
      lookingFor, 
      fundsPurpose, 
      fundingAmount, 
      accountsReceivableBalance 
    } = req.query;

    // Validate required parameters
    if (!country || !lookingFor) {
      return res.status(400).json({ 
        error: 'Missing required parameters: country and lookingFor are required' 
      });
    }

    const filters: RecommendationFilters = {
      country: country as 'US' | 'CA',
      lookingFor: lookingFor as 'capital' | 'equipment' | 'both',
      fundsPurpose: fundsPurpose as string,
      fundingAmount: fundingAmount ? parseInt(fundingAmount as string) : undefined,
      accountsReceivableBalance: accountsReceivableBalance ? parseInt(accountsReceivableBalance as string) : undefined
    };

    const products = await recommendationEngine.getFilteredProducts(filters);
    const categoryStats = await recommendationEngine.getCategoryStats(products, filters);
    
    res.json({
      categories: categoryStats,
      totalProducts: products.length,
      totalLenders: new Set(products.map(p => p.lender_name)).size,
      filters: filters
    });
  } catch (error) {
    console.error('Error fetching product categories:', error);
    res.status(500).json({ error: 'Failed to fetch product categories' });
  }
});

// Get comprehensive industry insights
router.get('/api/recommendations/insights', async (req, res) => {
  try {
    const { 
      country, 
      lookingFor, 
      fundsPurpose, 
      fundingAmount, 
      accountsReceivableBalance 
    } = req.query;

    if (!country || !lookingFor) {
      return res.status(400).json({ 
        error: 'Missing required parameters: country and lookingFor are required' 
      });
    }

    const filters: RecommendationFilters = {
      country: country as 'US' | 'CA',
      lookingFor: lookingFor as 'capital' | 'equipment' | 'both',
      fundsPurpose: fundsPurpose as string,
      fundingAmount: fundingAmount ? parseInt(fundingAmount as string) : undefined,
      accountsReceivableBalance: accountsReceivableBalance ? parseInt(accountsReceivableBalance as string) : undefined
    };

    const insights = await recommendationEngine.getIndustryInsights(filters);
    
    res.json(insights);
  } catch (error) {
    console.error('Error fetching industry insights:', error);
    res.status(500).json({ error: 'Failed to fetch industry insights' });
  }
});

// Get required documents for filtered products
router.get('/api/recommendations/documents', async (req, res) => {
  try {
    const { 
      country, 
      lookingFor, 
      fundsPurpose, 
      fundingAmount, 
      accountsReceivableBalance 
    } = req.query;

    if (!country || !lookingFor) {
      return res.status(400).json({ 
        error: 'Missing required parameters: country and lookingFor are required' 
      });
    }

    const filters: RecommendationFilters = {
      country: country as 'US' | 'CA',
      lookingFor: lookingFor as 'capital' | 'equipment' | 'both',
      fundsPurpose: fundsPurpose as string,
      fundingAmount: fundingAmount ? parseInt(fundingAmount as string) : undefined,
      accountsReceivableBalance: accountsReceivableBalance ? parseInt(accountsReceivableBalance as string) : undefined
    };

    const documentAnalysis = await recommendationEngine.getRequiredDocuments(filters);
    
    res.json(documentAnalysis);
  } catch (error) {
    console.error('Error fetching required documents:', error);
    res.status(500).json({ error: 'Failed to fetch required documents' });
  }
});

// Get top product recommendations with detailed scoring
router.get('/api/recommendations/top-products', async (req, res) => {
  try {
    const { 
      country, 
      lookingFor, 
      fundsPurpose, 
      fundingAmount, 
      accountsReceivableBalance,
      limit = '5'
    } = req.query;

    if (!country || !lookingFor) {
      return res.status(400).json({ 
        error: 'Missing required parameters: country and lookingFor are required' 
      });
    }

    const filters: RecommendationFilters = {
      country: country as 'US' | 'CA',
      lookingFor: lookingFor as 'capital' | 'equipment' | 'both',
      fundsPurpose: fundsPurpose as string,
      fundingAmount: fundingAmount ? parseInt(fundingAmount as string) : undefined,
      accountsReceivableBalance: accountsReceivableBalance ? parseInt(accountsReceivableBalance as string) : undefined
    };

    const products = await recommendationEngine.getFilteredProducts(filters);
    const categories = await recommendationEngine.getCategoryStats(products, filters);
    
    // Get top products from highest scoring categories
    const topProducts = products
      .slice(0, parseInt(limit as string))
      .map(product => ({
        ...product,
        matchScore: categories.find(c => 
          c.category.toLowerCase().includes(product.product_type.replace('_', ' '))
        )?.matchScore || 60
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      products: topProducts,
      totalAvailable: products.length,
      filters: filters
    });
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

export { router as recommendationsRouter };