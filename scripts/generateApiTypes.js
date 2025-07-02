/**
 * Generate TypeScript types from staff portal OpenAPI schema
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function generateApiTypes() {
  console.log('🔄 Generating API types from staff portal...');
  
  try {
    // First, try to fetch the OpenAPI schema
    console.log('📡 Fetching OpenAPI schema from https://staff.replit.app/openapi.json');
    
    const response = await fetch('https://staff.replit.app/openapi.json');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const schema = await response.json();
    
    // Save the schema temporarily
    const tempSchemaPath = path.join(process.cwd(), 'temp-openapi.json');
    fs.writeFileSync(tempSchemaPath, JSON.stringify(schema, null, 2));
    
    console.log('✅ OpenAPI schema fetched successfully');
    console.log(`📊 Schema contains ${Object.keys(schema.paths || {}).length} API endpoints`);
    
    // Generate TypeScript types
    console.log('🔧 Generating TypeScript types...');
    
    const outputPath = 'client/src/types/api.ts';
    
    // Ensure the types directory exists
    const typesDir = path.dirname(outputPath);
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }
    
    const command = `npx openapi-typescript ${tempSchemaPath} --output ${outputPath}`;
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.warn('⚠️  Warnings during type generation:', stderr);
    }
    
    console.log('✅ TypeScript types generated at:', outputPath);
    
    // Clean up temporary file
    fs.unlinkSync(tempSchemaPath);
    
    // Verify the generated file
    if (fs.existsSync(outputPath)) {
      const fileSize = fs.statSync(outputPath).size;
      console.log(`📄 Generated file size: ${(fileSize / 1024).toFixed(1)}KB`);
      
      // Show SignNow endpoints if they exist
      const content = fs.readFileSync(outputPath, 'utf8');
      if (content.includes('signnow')) {
        console.log('🔗 SignNow endpoints detected in generated types');
      }
      
      return outputPath;
    } else {
      throw new Error('Generated types file not found');
    }
    
  } catch (error) {
    console.error('❌ Failed to generate API types:', error.message);
    
    // Fallback: create minimal types based on your specification
    console.log('🔄 Creating fallback types based on known SignNow API...');
    await createFallbackTypes();
  }
}

async function createFallbackTypes() {
  const outputPath = 'client/src/types/api.ts';
  
  // Ensure the types directory exists
  const typesDir = path.dirname(outputPath);
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }
  
  const fallbackTypes = `/**
 * Generated API types for Staff Portal
 * Fallback types based on known API structure
 */

export interface paths {
  '/api/signnow/generate': {
    post: {
      requestBody: {
        content: {
          'application/json': {
            applicationId: string;
            formFields: {
              businessName: string;
              ownerName: string;
              requestedAmount: number;
              [key: string]: any;
            };
          };
        };
      };
      responses: {
        200: {
          content: {
            'application/json': {
              success: boolean;
              signUrl: string;
              documentId: string;
            };
          };
        };
      };
    };
  };
  
  '/api/public/lenders': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': {
              success: boolean;
              products: Array<{
                id: string;
                lender: string;
                product: string;
                productCategory: string;
                minAmountUsd: number;
                maxAmountUsd: number;
                interestRateMin?: number;
                interestRateMax?: number;
                termMinMonths?: number;
                termMaxMonths?: number;
                rateType?: 'fixed' | 'variable';
                interestFrequency?: 'monthly' | 'quarterly' | 'annually';
                requiredDocs: string[];
                minRevenue?: number;
                industries?: string[];
                description?: string;
                geography?: string[];
                isActive?: boolean;
                createdAt: string;
                updatedAt: string;
              }>;
              count: number;
              total: number;
            };
          };
        };
      };
    };
  };
}

export interface components {
  schemas: {
    LenderProduct: {
      id: string;
      lender: string;
      product: string;
      productCategory: string;
      minAmountUsd: number;
      maxAmountUsd: number;
      interestRateMin?: number;
      interestRateMax?: number;
      termMinMonths?: number;
      termMaxMonths?: number;
      rateType?: 'fixed' | 'variable';
      interestFrequency?: 'monthly' | 'quarterly' | 'annually';
      requiredDocs: string[];
      minRevenue?: number;
      industries?: string[];
      description?: string;
      geography?: string[];
      isActive?: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}`;

  fs.writeFileSync(outputPath, fallbackTypes);
  console.log('✅ Fallback API types created at:', outputPath);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateApiTypes()
    .then(() => {
      console.log('🎉 API type generation completed');
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

export { generateApiTypes };