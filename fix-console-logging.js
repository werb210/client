#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/React files
const files = glob.sync('client/src/**/*.{ts,tsx}', { ignore: ['**/*.test.*', '**/*.spec.*'] });

let totalReplacements = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Check if logger is already imported
  const hasLoggerImport = content.includes("import { logger }") || content.includes("logger");
  
  // Add logger import if not present and console statements found
  if (!hasLoggerImport && content.includes('console.')) {
    // Find the last import statement
    const importLines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < importLines.length; i++) {
      if (importLines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex >= 0) {
      importLines.splice(lastImportIndex + 1, 0, "import { logger } from '@/lib/utils';");
      content = importLines.join('\n');
      modified = true;
    }
  }
  
  // Replace console.log with logger.log
  const logMatches = content.match(/console\.log\(/g);
  if (logMatches) {
    content = content.replace(/console\.log\(/g, 'logger.log(');
    totalReplacements += logMatches.length;
    modified = true;
  }
  
  // Replace console.warn with logger.warn
  const warnMatches = content.match(/console\.warn\(/g);
  if (warnMatches) {
    content = content.replace(/console\.warn\(/g, 'logger.warn(');
    totalReplacements += warnMatches.length;
    modified = true;
  }
  
  // Replace console.error with logger.error (keep for production)
  const errorMatches = content.match(/console\.error\(/g);
  if (errorMatches) {
    content = content.replace(/console\.error\(/g, 'logger.error(');
    totalReplacements += errorMatches.length;
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(file, content);
    console.log(`✅ Fixed ${file}`);
  }
});

console.log(`\n🎉 Total replacements made: ${totalReplacements}`);
console.log(`✅ Production logging cleanup complete!`);