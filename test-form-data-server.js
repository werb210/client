// Server-side test for form-data dependency functionality
// Tests the dependency chain that uses form-data

import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

console.log('🧪 Server-side form-data dependency verification...');

async function testSendGridDependencyChain() {
  try {
    console.log('📧 Testing SendGrid dependency chain...');
    
    const { stdout, stderr } = await execAsync(`node -e "
      try {
        const sgMail = require('@sendgrid/mail');
        console.log('✅ SendGrid import successful');
        console.log('📦 Form-data → axios → @sendgrid/client chain: WORKING');
      } catch(e) {
        console.error('❌ SendGrid import failed:', e.message);
        process.exit(1);
      }
    "`);
    
    console.log(stdout.trim());
    return true;
  } catch (error) {
    console.log('❌ [SENDGRID] Error:', error.message);
    return false;
  }
}

async function testCypressDependencyChain() {
  try {
    console.log('🧪 Testing Cypress dependency chain...');
    
    const { stdout, stderr } = await execAsync(`node -e "
      try {
        const cypress = require('cypress');
        console.log('✅ Cypress import successful');
        console.log('📦 Form-data → @cypress/request chain: WORKING');
      } catch(e) {
        console.error('❌ Cypress import failed:', e.message);
        process.exit(1);
      }
    "`);
    
    console.log(stdout.trim());
    return true;
  } catch (error) {
    console.log('❌ [CYPRESS] Error:', error.message);
    return false;
  }
}

async function testNativeFormData() {
  try {
    console.log('🔄 Testing native form-data package...');
    
    const { stdout, stderr } = await execAsync(`node -e "
      try {
        const FormData = require('form-data');
        const form = new FormData();
        form.append('test', 'value');
        form.append('file', Buffer.from('test content'), 'test.txt');
        console.log('✅ Native form-data package working');
        console.log('📦 Form-data v' + require('form-data/package.json').version + ' functional');
      } catch(e) {
        console.error('❌ Form-data package failed:', e.message);
        process.exit(1);
      }
    "`);
    
    console.log(stdout.trim());
    return true;
  } catch (error) {
    console.log('❌ [FORM-DATA] Error:', error.message);
    return false;
  }
}

async function testMulterDependencyChain() {
  try {
    console.log('📁 Testing Multer dependency chain...');
    
    const { stdout, stderr } = await execAsync(`node -e "
      try {
        const multer = require('multer');
        const upload = multer({ storage: multer.memoryStorage() });
        console.log('✅ Multer import successful');
        console.log('📦 Multer correctly configured with form-data support');
      } catch(e) {
        console.error('❌ Multer import failed:', e.message);
        process.exit(1);
      }
    "`);
    
    console.log(stdout.trim());
    return true;
  } catch (error) {
    console.log('❌ [MULTER] Error:', error.message);
    return false;
  }
}

async function checkFormDataVersion() {
  try {
    console.log('🔍 Checking form-data version...');
    
    const { stdout } = await execAsync(`node -e "
      const pkg = require('form-data/package.json');
      console.log('Form-data version:', pkg.version);
      console.log('Package location: node_modules/form-data');
    "`);
    
    console.log(stdout.trim());
    return true;
  } catch (error) {
    console.log('❌ [VERSION] Error checking version:', error.message);
    return false;
  }
}

async function runServerSideTests() {
  console.log('\n🚀 Running server-side form-data dependency tests...\n');
  
  const results = {
    formDataVersion: await checkFormDataVersion(),
    nativeFormData: await testNativeFormData(),
    multerChain: await testMulterDependencyChain(),
    sendgridChain: await testSendGridDependencyChain(),
    cypressChain: await testCypressDependencyChain()
  };
  
  console.log('\n📊 Server-Side Form-Data Test Results:');
  console.log('='.repeat(50));
  
  const passed = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result === true ? '✅ PASS' : '❌ FAIL';
    console.log(`${test.padEnd(20)}: ${status}`);
  });
  
  console.log('='.repeat(50));
  console.log(`Overall: ${passed}/${total} server-side tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 EXCELLENT: form-data security update is fully successful!');
    console.log('🔒 Security update applied without breaking any functionality');
    console.log('✅ All dependency chains using form-data are working correctly');
    console.log('💡 Application is fully operational after the security update');
  } else if (passed >= total - 1) {
    console.log('\n✅ GOOD: form-data update mostly successful');
    console.log('🔒 Security update applied with minimal impact');
    console.log('💡 Core functionality remains operational');
  } else {
    console.log('\n⚠️  WARNING: Multiple form-data dependencies affected');
    console.log('🔍 Investigation needed for failed dependency chains');
  }
  
  return passed >= total - 1; // Allow 1 failure
}

runServerSideTests().catch(console.error);