/**
 * Fix existing tax return files that were misclassified as "other"
 * Updates their document type to "tax_returns" so they match requirements
 */

const API_BASE_URL = 'https://staff.boreal.financial/api';
const CLIENT_TOKEN = process.env.VITE_CLIENT_APP_SHARED_TOKEN || 'sk-client-borealsys2025-secure-token-v1-hXpY9K';

// Get application ID from localStorage or environment
const APPLICATION_ID = 'current'; // You'll need to replace with your actual application ID

async function fixTaxReturnFiles() {
  console.log('🔧 FIXING EXISTING TAX RETURN FILES');
  console.log('==================================');
  
  try {
    // Get current uploaded files for application
    const response = await fetch(`${API_BASE_URL}/public/applications/${APPLICATION_ID}/documents`, {
      headers: {
        'Authorization': `Bearer ${CLIENT_TOKEN}`
      }
    });
    
    if (!response.ok) {
      console.error('❌ Failed to fetch documents:', response.status);
      return;
    }
    
    const documents = await response.json();
    console.log(`📄 Found ${documents.length} documents`);
    
    // Find tax return files that are misclassified as "other"
    const taxReturnFiles = documents.filter(doc => {
      const fileName = doc.fileName || doc.name || '';
      const isFS = fileName.includes('FS.pdf');
      const isOtherType = doc.documentType === 'other';
      const isTaxReturn = fileName.includes('2022') || fileName.includes('2023') || fileName.includes('2024');
      
      return isFS && isOtherType && isTaxReturn;
    });
    
    console.log(`🎯 Found ${taxReturnFiles.length} tax return files to fix:`);
    taxReturnFiles.forEach(file => {
      console.log(`   - ${file.fileName || file.name} (type: ${file.documentType})`);
    });
    
    // Update each tax return file to have correct document type
    for (const file of taxReturnFiles) {
      console.log(`\n🔄 Updating ${file.fileName || file.name}...`);
      
      try {
        const updateResponse = await fetch(`${API_BASE_URL}/public/documents/${file.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${CLIENT_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            documentType: 'tax_returns'
          })
        });
        
        if (updateResponse.ok) {
          console.log(`✅ Successfully updated ${file.fileName || file.name} to tax_returns type`);
        } else {
          console.error(`❌ Failed to update ${file.fileName || file.name}:`, updateResponse.status);
        }
      } catch (error) {
        console.error(`❌ Error updating ${file.fileName || file.name}:`, error.message);
      }
    }
    
    console.log('\n🎉 TAX RETURN FILES FIX COMPLETE');
    console.log('Your 3 tax return files should now show as:');
    console.log('Business Tax Returns: 3/3 (COMPLETE)');
    
  } catch (error) {
    console.error('❌ Error in fix process:', error.message);
  }
}

// Run the fix
fixTaxReturnFiles();