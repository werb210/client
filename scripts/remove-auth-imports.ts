#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';

// Files to clean up based on auth_references.txt
const filesToCleanup = [
  'client/src/components/MultiStepForm/ReviewStep.tsx',
  'client/src/components/DocumentUpload.tsx',
  'client/src/components/TestingChecklist.tsx',
  'client/src/lib/api.ts',
  'client/src/pages/ApplicationForm.tsx'
];

// Authentication patterns to remove
const authPatterns = [
  /import\s*{\s*isUnauthorizedError\s*}\s*from\s*['"][^'"]*authUtils['"];?\s*\n?/g,
  /import\s*{\s*AuthAPI\s*}\s*from\s*['"][^'"]*authApi['"];?\s*\n?/g,
  /import\s*{\s*Auth\s*}\s*from\s*['"][^'"]*auth['"];?\s*\n?/g,
  /import\s*{\s*useAuth\s*}\s*from\s*['"][^'"]*useAuth['"];?\s*\n?/g,
  /const\s*{\s*[^}]*isAuthenticated[^}]*}\s*=\s*useAuth\(\);?\s*\n?/g,
  /useEffect\(\s*\(\)\s*=>\s*{\s*if\s*\(\s*!isLoading\s*&&\s*!isAuthenticated\s*\)[\s\S]*?},\s*\[isAuthenticated[^\]]*\]\s*\);?\s*\n?/g,
  /if\s*\(\s*isUnauthorizedError\([^)]*\)\s*\)\s*{[\s\S]*?return;\s*}/g,
  /window\.location\.href\s*=\s*['"][^'"]*login['"];?\s*\n?/g
];

function cleanFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const originalLength = content.length;

  // Apply all auth patterns
  authPatterns.forEach(pattern => {
    content = content.replace(pattern, '');
  });

  // Clean up empty lines and double imports
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  content = content.replace(/import[^;]+;\s*\n\s*\n\s*import/g, 'import$1\nimport');

  if (content.length !== originalLength) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Cleaned: ${filePath} (${originalLength - content.length} chars removed)`);
  } else {
    console.log(`⚪ No changes: ${filePath}`);
  }
}

function main() {
  console.log('🧹 Starting authentication cleanup...\n');
  
  filesToCleanup.forEach(cleanFile);
  
  console.log('\n🔍 Verifying cleanup...');
  
  // Re-run grep to verify
  const { execSync } = require('child_process');
  try {
    const result = execSync('cd client && grep -R --line-number -E "authUtils|isUnauthorizedError|/login|/verify-otp|@/lib/auth" src | grep -v "_legacy_auth"', { encoding: 'utf-8' });
    if (result.trim()) {
      console.log('❌ Remaining auth references found:');
      console.log(result);
    } else {
      console.log('✅ No remaining auth references in active code!');
    }
  } catch (error) {
    console.log('✅ No remaining auth references found (grep returned empty)!');
  }
  
  console.log('\n✨ Authentication cleanup complete!');
}

if (require.main === module) {
  main();
}