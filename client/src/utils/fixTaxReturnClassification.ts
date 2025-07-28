/**
 * Utility to fix existing tax return files that were misclassified as "other"
 * This updates the document type in both localStorage and the database
 */

const API_BASE_URL = 'https://staff.boreal.financial/api';

interface UploadedFile {
  id: string;
  name: string;
  fileName?: string;
  documentType: string;
  status: string;
}

export async function fixExistingTaxReturnFiles(applicationId: string): Promise<void> {
  console.log('🔧 [TAX-FIX] Starting tax return file classification fix...');
  
  try {
    // Get current application data
    const response = await fetch(`${API_BASE_URL}/public/applications/${applicationId}/documents`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      }
    });
    
    if (!response.ok) {
      console.error('❌ [TAX-FIX] Failed to fetch documents:', response.status);
      return;
    }
    
    const documents = await response.json();
    console.log(`📄 [TAX-FIX] Found ${documents.length} total documents`);
    
    // Identify tax return files that were misclassified as "other"
    const taxReturnFiles = documents.filter((doc: any) => {
      const fileName = doc.fileName || doc.name || '';
      const isFS = fileName.includes('FS.pdf');
      const isOtherType = doc.documentType === 'other';
      const isTaxReturn = ['2022', '2023', '2024'].some(year => fileName.includes(year));
      
      return isFS && isOtherType && isTaxReturn;
    });
    
    console.log(`🎯 [TAX-FIX] Found ${taxReturnFiles.length} tax return files to fix:`);
    taxReturnFiles.forEach((file: any) => {
      console.log(`   - ${file.fileName || file.name} (currently: ${file.documentType})`);
    });
    
    if (taxReturnFiles.length === 0) {
      console.log('✅ [TAX-FIX] No tax return files need fixing');
      return;
    }
    
    // Update each file to have correct document type
    const updatePromises = taxReturnFiles.map(async (file: any) => {
      console.log(`🔄 [TAX-FIX] Updating ${file.fileName || file.name}...`);
      
      try {
        const updateResponse = await fetch(`${API_BASE_URL}/public/documents/${file.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            documentType: 'tax_returns'
          })
        });
        
        if (updateResponse.ok) {
          console.log(`✅ [TAX-FIX] Updated ${file.fileName || file.name} → tax_returns`);
          return { success: true, file: file.fileName || file.name };
        } else {
          console.error(`❌ [TAX-FIX] Failed to update ${file.fileName || file.name}:`, updateResponse.status);
          return { success: false, file: file.fileName || file.name, error: updateResponse.status };
        }
      } catch (error) {
        console.error(`❌ [TAX-FIX] Error updating ${file.fileName || file.name}:`, error);
        return { success: false, file: file.fileName || file.name, error: error };
      }
    });
    
    const results = await Promise.all(updatePromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`\n🎉 [TAX-FIX] Classification fix complete:`);
    console.log(`   ✅ Successfully updated: ${successful} files`);
    console.log(`   ❌ Failed to update: ${failed} files`);
    
    if (successful > 0) {
      console.log('🔄 [TAX-FIX] Refreshing page to show updated document status...');
      // Trigger a page refresh to reload the updated document data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    
  } catch (error) {
    console.error('❌ [TAX-FIX] Error in fix process:', error);
  }
}

// Global function for browser console testing
declare global {
  interface Window {
    fixTaxReturnFiles: (applicationId: string) => Promise<void>;
  }
}

if (typeof window !== 'undefined') {
  window.fixTaxReturnFiles = fixExistingTaxReturnFiles;
}