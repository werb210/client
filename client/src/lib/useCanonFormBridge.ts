import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useCanon } from '@/providers/CanonProvider';

/**
 * Bridge between React Hook Form and Canonical Store
 * Watches form values and syncs them to canonical state with proper normalization
 */
export function useCanonFormBridge<T extends Record<string, any>>(form: UseFormReturn<T>) {
  const { setCanon } = useCanon();
  
  // Watch all form values
  const formValues = form.watch();
  
  useEffect(() => {
    // Normalize currency strings to numbers for canonical storage
    const normalizedValues: any = { ...formValues };
    
    // Convert currency fields from formatted strings to numbers
    const currencyFields = [
      'fundingAmount',
      'revenueLastYear', 
      'averageMonthlyRevenue',
      'accountsReceivableBalance',
      'fixedAssetsValue',
      'equipmentValue'
    ];
    
    currencyFields.forEach(field => {
      if (normalizedValues[field] && typeof normalizedValues[field] === 'string') {
        // Extract numbers from formatted currency string
        const numbers = String(normalizedValues[field]).replace(/\D/g, '');
        normalizedValues[field] = numbers === '' ? 0 : parseInt(numbers);
      }
    });
    
    // Only update canon if we have actual data
    const hasData = Object.values(normalizedValues).some(v => 
      v !== undefined && v !== null && v !== '' && v !== 0
    );
    
    if (hasData) {
      setCanon(normalizedValues);
      console.log('[useCanonFormBridge] Updated canon with normalized values:', normalizedValues);
    }
  }, [formValues, setCanon]);
}