/**
 * Fetch OpenAPI schema from staff portal and save to client
 */

import fs from 'fs';
import path from 'path';

async function fetchOpenAPISchema() {
  console.log('🔄 Fetching OpenAPI schema from staff portal...');
  
  try {
    const response = await fetch('https://staffportal.replit.app/api/public/openapi.json');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const schema = await response.json();
    
    // Ensure directory exists
    const outputDir = path.join(process.cwd(), 'client/src/api/__generated__');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write schema to file
    const outputPath = path.join(outputDir, 'staff.openapi.json');
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
    
    console.log('✅ OpenAPI schema saved to:', outputPath);
    console.log(`📊 Schema contains ${Object.keys(schema.paths || {}).length} API endpoints`);
    
    // Log lender product schema info
    if (schema.components?.schemas?.LenderProduct) {
      const lenderSchema = schema.components.schemas.LenderProduct;
      const properties = Object.keys(lenderSchema.properties || {});
      console.log(`📝 LenderProduct schema has ${properties.length} fields:`, properties.slice(0, 10).join(', '));
    }
    
    return outputPath;
    
  } catch (error) {
    console.error('❌ Failed to fetch OpenAPI schema:', error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchOpenAPISchema()
    .then(() => {
      console.log('🎉 OpenAPI schema fetch completed');
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

export { fetchOpenAPISchema };