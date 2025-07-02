/**
 * Live data ingestion script for lender products
 * Validates and imports new live data with strict schema compliance
 */

const { Pool } = require('pg');
const { z } = require('zod');

// Strict validation schema for incoming live data
const LiveDataSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  lenderName: z.string().min(1),
  country: z.enum(['US', 'CA']),
  category: z.enum([
    'line_of_credit',
    'term_loan', 
    'equipment_financing',
    'invoice_factoring',
    'working_capital',
    'purchase_order_financing',
    'asset_based_lending',
    'sba_loan'
  ]),
  minAmount: z.number().positive(),
  maxAmount: z.number().positive(),
  minRevenue: z.number().min(0).optional(),
  interestRateMin: z.number().min(0).optional(),
  interestRateMax: z.number().min(0).optional(),
  termMin: z.number().positive().optional(),
  termMax: z.number().positive().optional(),
  description: z.string().optional(),
  industries: z.array(z.string()).optional(),
  docRequirements: z.array(z.string()).optional()
}).refine(data => data.maxAmount >= data.minAmount, {
  message: "maxAmount must be greater than or equal to minAmount"
});

async function ingestLiveData(liveDataArray) {
  console.log(`🔄 Starting live data ingestion for ${liveDataArray.length} products...`);
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  try {
    const client = await pool.connect();
    
    for (let i = 0; i < liveDataArray.length; i++) {
      const rawProduct = liveDataArray[i];
      
      try {
        // Validate against strict schema
        const validatedProduct = LiveDataSchema.parse(rawProduct);
        
        // Insert into database
        const insertQuery = `
          INSERT INTO lender_products (
            id, name, lender_name, country, category,
            min_amount, max_amount, min_revenue,
            interest_rate_min, interest_rate_max,
            term_min, term_max, description, industries,
            doc_requirements, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()
          )
        `;
        
        const values = [
          validatedProduct.id,
          validatedProduct.name,
          validatedProduct.lenderName,
          validatedProduct.country,
          validatedProduct.category,
          validatedProduct.minAmount,
          validatedProduct.maxAmount,
          validatedProduct.minRevenue || null,
          validatedProduct.interestRateMin || null,
          validatedProduct.interestRateMax || null,
          validatedProduct.termMin || null,
          validatedProduct.termMax || null,
          validatedProduct.description || null,
          validatedProduct.industries ? JSON.stringify(validatedProduct.industries) : null,
          validatedProduct.docRequirements ? JSON.stringify(validatedProduct.docRequirements) : null
        ];
        
        await client.query(insertQuery, values);
        successCount++;
        
        if (i % 10 === 0) {
          console.log(`✅ Processed ${i + 1}/${liveDataArray.length} products`);
        }
        
      } catch (error) {
        errorCount++;
        errors.push({
          index: i,
          product: rawProduct?.name || rawProduct?.id || 'Unknown',
          error: error.message
        });
        console.error(`❌ Product ${i + 1} failed validation:`, error.message);
      }
    }
    
    client.release();
    
    // Final report
    console.log('\n📊 Live Data Ingestion Complete');
    console.log(`✅ Successfully ingested: ${successCount} products`);
    console.log(`❌ Failed to ingest: ${errorCount} products`);
    
    if (errors.length > 0) {
      console.log('\n🔍 Validation Errors:');
      errors.forEach(err => {
        console.log(`  Product "${err.product}" (index ${err.index}): ${err.error}`);
      });
    }
    
    // Verify database state
    const countResult = await client.query('SELECT COUNT(*) FROM lender_products');
    const totalCount = parseInt(countResult.rows[0].count);
    console.log(`\n📈 Database now contains ${totalCount} lender products`);
    
    if (totalCount === successCount) {
      console.log('✅ Database integrity verified - all products successfully stored');
    } else {
      console.warn('⚠️  Database count mismatch - manual verification recommended');
    }
    
  } catch (error) {
    console.error('❌ Ingestion process failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
  
  return {
    success: successCount,
    failed: errorCount,
    errors: errors
  };
}

// Example usage function
async function ingestFromFile(filePath) {
  const fs = require('fs');
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const liveData = JSON.parse(fileContent);
    
    if (!Array.isArray(liveData)) {
      throw new Error('Live data must be an array of product objects');
    }
    
    return await ingestLiveData(liveData);
    
  } catch (error) {
    console.error('❌ File ingestion failed:', error.message);
    throw error;
  }
}

// Run if called directly with file argument
if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node ingestLiveData.js <path-to-json-file>');
    process.exit(1);
  }
  
  ingestFromFile(filePath)
    .then(result => {
      console.log('🎉 Live data ingestion completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Live data ingestion failed');
      process.exit(1);
    });
}

module.exports = { ingestLiveData, ingestFromFile, LiveDataSchema };