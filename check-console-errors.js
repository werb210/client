#!/usr/bin/env node

/**
 * CONSOLE ERROR CHECKER
 * Opens the application and checks for console errors
 */

import puppeteer from 'puppeteer';

async function checkConsoleErrors() {
  console.log('🔍 CHECKING CONSOLE ERRORS');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Collect console messages
  const consoleMessages = [];
  const errors = [];
  
  page.on('console', (msg) => {
    const text = msg.text();
    consoleMessages.push({
      type: msg.type(),
      text: text
    });
    
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });
  
  page.on('pageerror', (error) => {
    errors.push(`Page Error: ${error.message}`);
  });
  
  try {
    console.log('📱 Loading application...');
    await page.goto('http://localhost:5000', { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });
    
    // Wait a moment for any delayed errors
    await page.waitForTimeout(3000);
    
    console.log('\n📊 CONSOLE ANALYSIS:');
    console.log(`Total console messages: ${consoleMessages.length}`);
    console.log(`Error messages: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS FOUND:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('\n✅ NO ERRORS FOUND');
    }
    
    // Show all console messages for debugging
    console.log('\n📝 ALL CONSOLE MESSAGES:');
    consoleMessages.forEach((msg, index) => {
      const prefix = msg.type === 'error' ? '❌' : msg.type === 'warn' ? '⚠️' : 'ℹ️';
      console.log(`${prefix} [${msg.type.toUpperCase()}] ${msg.text}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to load page:', error.message);
  }
  
  await browser.close();
}

checkConsoleErrors().catch(console.error);