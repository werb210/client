/**
 * Quick script to check lender products count from all data sources
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkLenderProductsCount() {
  console.log('🔍 Checking lender products count...\n');
  
  // 1. Check fallback JSON file
  try {
    const fallbackPath = path.join(__dirname, '..', 'public', 'fallback', 'lenders.json');
    const fallbackData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    console.log(`📁 Fallback file (public/fallback/lenders.json):`);
    console.log(`   Products: ${fallbackData.products ? fallbackData.products.length : 0}`);
    console.log(`   Success: ${fallbackData.success}`);
    console.log(`   Countries: ${fallbackData.products ? [...new Set(fallbackData.products.map(p => p.country))].join(', ') : 'N/A'}`);
    console.log(`   Categories: ${fallbackData.products ? [...new Set(fallbackData.products.map(p => p.category))].length : 0}`);
    console.log(`   Max funding: $${fallbackData.products ? Math.max(...fallbackData.products.map(p => p.amountMax || p.maxAmountUsd || 0)).toLocaleString() : 0}`);
  } catch (error) {
    console.log(`❌ Fallback file error: ${error.message}`);
  }
  
  console.log('\n');
  
  // 2. Test staff API endpoints
  const endpoints = [
    'https://staffportal.replit.app/api/public/lenders',
    'https://staff.boreal.financial/api/public/lenders'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🌐 Testing: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const products = data.products || data.data || data;
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   Products: ${Array.isArray(products) ? products.length : 'Invalid format'}`);
        if (Array.isArray(products) && products.length > 0) {
          console.log(`   Sample: ${products[0].name || products[0].product || 'No name'}`);
        }
      } else {
        console.log(`   ❌ Status: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ Network error: ${error.message}`);
    }
  }
  
  console.log('\n📊 SUMMARY:');
  console.log('- Fallback data: Available locally');
  console.log('- Staff APIs: Currently unavailable');
  console.log('- Recommendation: Use fallback data for immediate testing');
}

// Run the check
checkLenderProductsCount().catch(console.error);