/**
 * Component to fix existing tax return files that were misclassified
 */
import React, { useEffect } from 'react';

interface TaxReturnFixerProps {
  applicationId: string;
  onFixComplete?: () => void;
}

export function TaxReturnFixer({ applicationId, onFixComplete }: TaxReturnFixerProps) {
  useEffect(() => {
    const fixTaxReturnFiles = async () => {
      console.log('🔧 [TAX-FIX] Checking for misclassified tax return files...');
      
      try {
        const response = await fetch(`/api/public/applications/${applicationId}/documents`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
          }
        });
        
        if (!response.ok) {
          console.log('📄 [TAX-FIX] Could not fetch documents for fixing');
          return;
        }
        
        const documents = await response.json();
        
        // Find tax return files that are misclassified as "other"
        const taxReturnFiles = documents.filter((doc: any) => {
          const fileName = doc.fileName || doc.name || '';
          const isFS = fileName.includes('FS.pdf');
          const isOtherType = doc.documentType === 'other';
          const isTaxReturn = ['2022', '2023', '2024'].some(year => fileName.includes(year));
          
          return isFS && isOtherType && isTaxReturn;
        });
        
        if (taxReturnFiles.length === 0) {
          console.log('✅ [TAX-FIX] No tax return files need fixing');
          return;
        }
        
        console.log(`🎯 [TAX-FIX] Found ${taxReturnFiles.length} tax return files to fix:`);
        taxReturnFiles.forEach((file: any) => {
          console.log(`   - ${file.fileName || file.name} (currently: ${file.documentType})`);
        });
        
        // Update each file to have correct document type
        for (const file of taxReturnFiles) {
          try {
            const updateResponse = await fetch(`/api/public/documents/${file.id}`, {
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
            } else {
              console.log(`❌ [TAX-FIX] Failed to update ${file.fileName || file.name}`);
            }
          } catch (error) {
            console.log(`❌ [TAX-FIX] Error updating ${file.fileName || file.name}:`, error);
          }
        }
        
        console.log('🎉 [TAX-FIX] Tax return file classification fix complete!');
        
        // Trigger refresh to show updated status
        if (onFixComplete) {
          onFixComplete();
        } else {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
        
      } catch (error) {
        console.log('❌ [TAX-FIX] Error in fix process:', error);
      }
    };
    
    if (applicationId) {
      fixTaxReturnFiles();
    }
  }, [applicationId, onFixComplete]);
  
  return null; // This component doesn't render anything
}