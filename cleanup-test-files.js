// cleanup-test-files.js - Clean up test files after deployment
import fs from 'fs';

const testFiles = [
  'test-chatbot-comprehensive.js',
  'test-security-quick.ts',
  'production-deployment-test.js',
  'deployment-security-audit.js',
  'test-final-security.sh',
  'cleanup-test-files.js'
];

console.log('🧹 Cleaning up test files...');

testFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✅ Removed ${file}`);
    }
  } catch (error) {
    console.log(`⚠️  Could not remove ${file}:`, error.message);
  }
});

console.log('🎉 Cleanup complete!');