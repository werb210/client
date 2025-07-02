/**
 * Database clearing script for lender products
 * Completely removes all existing data to prepare for new live data import
 */

import { Pool } from 'pg';

async function clearLenderDatabase() {
  console.log('🗑️  Starting database clearing process...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const client = await pool.connect();
    
    // Clear all lender products
    const deleteResult = await client.query('DELETE FROM lender_products');
    console.log(`✅ Deleted ${deleteResult.rowCount} lender products`);
    
    // Reset auto-increment sequences if they exist
    try {
      await client.query('ALTER SEQUENCE lender_products_id_seq RESTART WITH 1');
      console.log('✅ Reset ID sequence');
    } catch (seqError) {
      console.log('ℹ️  No ID sequence to reset (using UUIDs or manual IDs)');
    }
    
    // Verify clearing
    const countResult = await client.query('SELECT COUNT(*) FROM lender_products');
    const remainingCount = parseInt(countResult.rows[0].count);
    
    if (remainingCount === 0) {
      console.log('✅ Database successfully cleared - ready for new live data');
    } else {
      console.error(`❌ Clearing failed - ${remainingCount} products remain`);
      process.exit(1);
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Database clearing failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  clearLenderDatabase();
}

export { clearLenderDatabase };