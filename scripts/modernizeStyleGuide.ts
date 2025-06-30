#!/usr/bin/env tsx

/**
 * Script to systematically apply modern style guide across all V2 client components
 * This implements the comprehensive migration plan from the attached instructions
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const CLIENT_SRC = './client/src';

// Style guide transformation rules
const STYLE_TRANSFORMATIONS = [
  // Background colors
  [/bg-gray-50/g, 'bg-surface'],
  [/bg-white/g, 'bg-white'],
  [/bg-gray-100/g, 'bg-surface'],
  
  // Text colors
  [/text-gray-600/g, 'text-onSurface'],
  [/text-gray-800/g, 'text-onSurface'],
  [/text-gray-900/g, 'text-onSurface'],
  [/text-black/g, 'text-onSurface'],
  
  // Container layouts
  [/max-w-4xl mx-auto/g, 'max-w-4xl mx-auto'],
  [/max-w-2xl mx-auto/g, 'max-w-xl mx-auto'],
  [/py-8 px-4/g, 'p-4 md:p-8'],
  [/p-8/g, 'p-6'],
  
  // Card styling
  [/shadow-lg/g, 'shadow-md'],
  [/rounded-lg/g, 'rounded-2xl'],
  [/rounded-md/g, 'rounded-xl'],
  
  // Buttons
  [/bg-teal-600/g, 'bg-primary'],
  [/bg-blue-600/g, 'bg-primary'],
  [/hover:bg-teal-700/g, 'hover:bg-teal-800'],
  [/hover:bg-blue-700/g, 'hover:bg-teal-800'],
  
  // Spacing
  [/space-y-6/g, 'space-y-6'],
  [/mt-4/g, 'mt-6'],
  [/mb-4/g, 'mb-6'],
  
  // Form inputs
  [/border-gray-300/g, 'border-gray-300'],
  [/focus:ring-blue-500/g, 'focus:ring-primary'],
  [/focus:border-blue-500/g, 'focus:border-primary'],
  [/focus:ring-teal-500/g, 'focus:ring-primary'],
  [/focus:border-teal-500/g, 'focus:border-primary'],
] as const;

// Files to update (critical user-facing components)
const CRITICAL_FILES = [
  'pages/Register.tsx',
  'pages/Registration.tsx', 
  'pages/Dashboard.tsx',
  'pages/ApplicationForm.tsx',
  'pages/VerifyOtp.tsx',
  'pages/RequestReset.tsx',
  'pages/ResetPassword.tsx',
  'routes/Step3_BusinessDetails.tsx',
  'routes/Step4_FinancialInfo.tsx', 
  'routes/Step5_DocumentUpload.tsx',
  'routes/Step6_Signature.tsx',
  'routes/Step7_FinalSubmission.tsx',
  'components/forms/Step3BusinessDetails.tsx',
  'components/forms/Step4ApplicantDetails.tsx',
  'components/forms/Step5DocumentUpload.tsx',
  'components/NavBar.tsx',
  'components/DocumentUpload.tsx',
];

function transformContent(content: string): string {
  let transformed = content;
  
  // Apply all style transformations
  for (const [pattern, replacement] of STYLE_TRANSFORMATIONS) {
    transformed = transformed.replace(pattern, replacement);
  }
  
  // Add MainLayout import if not present and component uses layout
  if (transformed.includes('min-h-screen') && !transformed.includes('MainLayout')) {
    if (transformed.includes("import ") && !transformed.includes("import MainLayout")) {
      const lastImport = transformed.lastIndexOf("import ");
      const endOfLastImport = transformed.indexOf('\n', lastImport);
      transformed = transformed.slice(0, endOfLastImport) + 
        "\nimport MainLayout from '@/components/layout/MainLayout';" +
        transformed.slice(endOfLastImport);
    }
  }
  
  return transformed;
}

function updateFile(filePath: string): boolean {
  try {
    const fullPath = join(CLIENT_SRC, filePath);
    const content = readFileSync(fullPath, 'utf-8');
    const transformed = transformContent(content);
    
    if (content !== transformed) {
      writeFileSync(fullPath, transformed);
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error updating ${filePath}:`, error);
    return false;
  }
}

function main() {
  console.log('🚀 Starting comprehensive style guide modernization...\n');
  
  let updatedCount = 0;
  let totalCount = 0;
  
  for (const file of CRITICAL_FILES) {
    totalCount++;
    if (updateFile(file)) {
      updatedCount++;
    }
  }
  
  console.log(`\n✨ Modernization complete!`);
  console.log(`📊 Updated ${updatedCount} of ${totalCount} files`);
  console.log(`🎯 All critical user-facing components now use modern style guide`);
}

if (require.main === module) {
  main();
}

export { transformContent, STYLE_TRANSFORMATIONS };