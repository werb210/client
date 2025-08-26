/**
 * Import transformed lender products to database
 */

import fs from 'fs';
import pg from 'pg';

const { Client } = pg;

async function importToDatabase() {
  console.log('🔄 Importing lender products to database...');
  
  // Read transformed products
  const productsData = fs.readFileSync('./transformed_products.json', 'utf8');
  const products = JSON.parse(productsData);
  
  console.log(`📊 Importing ${products.length} products...`);
  
  // Database connection
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Clear existing products
    await client.query('DELETE FROM lender_products');
    console.log('🗑️ Cleared existing products');
    
    // Insert new products
    for (const product of products) {
      const query = `
        INSERT INTO lender_products (
          name, type, description, min_amount, max_amount,
          interest_rate_min, interest_rate_max, term_min, term_max,
          requirements, active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
      
      const values = [
        product.name,
        product.type,
        product.description,
        product.min_amount,
        product.max_amount,
        product.interest_rate_min,
        product.interest_rate_max,
        product.term_min,
        product.term_max,
        product.requirements,
        product.active
      ];
      
      await client.query(query, values);
    }
    
    console.log(`✅ Imported ${products.length} products successfully`);
    
    // Verify import
    const result = await client.query('SELECT COUNT(*) as count FROM lender_products WHERE active = true');
    console.log(`🔍 Database now contains ${result.rows[0].count} active products`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Run import
importToDatabase()
  .then(() => {
    console.log('🎉 Import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });