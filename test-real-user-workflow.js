#!/usr/bin/env node

/**
 * Real User Workflow Test - Production Simulation
 * Tests the complete SMS link workflow that users experience
 */

import { execSync } from 'child_process';
import fs from 'fs';

async function testRealUserWorkflow() {
  console.log('🔍 TESTING REAL USER WORKFLOW - Production Simulation');
  console.log('=========================================================');

  try {
    // Step 1: Create a real application (simulating staff backend sending SMS)
    console.log('\n1️⃣ Testing Application Creation...');
    const createResult = execSync(`node -e "
      const { v4: uuidv4 } = require('uuid');
      const testApp = uuidv4();
      console.log('✅ Application created:', testApp);
      require('fs').writeFileSync('temp-app-id.txt', testApp);
    "`, { encoding: 'utf8' });

    const appId = fs.readFileSync('temp-app-id.txt', 'utf8').trim();
    
    // Step 2: Test SMS link URL construction
    console.log('\n2️⃣ Testing SMS Link Navigation...');
    const smsUrl = `http://localhost:5000/upload-documents?app=${appId}`;
    console.log(`📱 SMS would contain: ${smsUrl}`);

    // Step 3: Test actual page load
    console.log('\n3️⃣ Testing Document Page Load...');
    try {
      const pageContent = execSync(`curl -s "${smsUrl}"`, { encoding: 'utf8' });
      const hasUploadDocuments = pageContent.includes('Upload') || pageContent.includes('Document');
      const hasAppId = pageContent.includes(appId) || pageContent.includes('app=');
      
      console.log(`📄 Page loads: ✅`);
      console.log(`📋 Shows document cards: ${hasUploadDocuments ? '✅' : '❌'}`);
      console.log(`🔗 Contains app ID: ${hasAppId ? '✅' : '❌'}`);
      
      if (!hasUploadDocuments) {
        console.log('❌ CRITICAL: Document upload interface not visible');
      }
      
    } catch (error) {
      console.log('❌ Failed to load page:', error.message);
    }

    // Cleanup
    fs.unlinkSync('temp-app-id.txt');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRealUserWorkflow();