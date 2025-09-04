import { useEffect } from 'react';
import { useCanon } from '@/providers/CanonProvider';
import type { UseFormReturn } from 'react-hook-form';
import type { ApplicationV1 } from '../../../shared/ApplicationV1';

export function useCanonFormBridge<T extends Record<string, any>>(form: UseFormReturn<T>) {
  const { setCanon } = useCanon();

  useEffect(() => {
    const sub = form.watch((values) => {
      // normalize currency-like strings to numbers as needed
      const toNum = (v: any) => typeof v === 'string' ? Number(v.replace(/[^\d]/g, '')) || 0 : (v ?? 0);

      const patch: Partial<ApplicationV1> = {
        businessLocation: values.businessLocation as string,
        headquarters: values.headquarters as string,
        headquartersState: values.headquartersState,
        industry: values.industry,
        lookingFor: values.lookingFor as string,
        fundingAmount: toNum(values.fundingAmount),
        fundsPurpose: values.fundsPurpose,
        salesHistory: values.salesHistory,
        revenueLastYear: toNum(values.revenueLastYear),
        averageMonthlyRevenue: toNum(values.averageMonthlyRevenue),
        accountsReceivableBalance: toNum(values.accountsReceivableBalance),
        fixedAssetsValue: toNum(values.fixedAssetsValue),
        equipmentValue: toNum(values.equipmentValue),
      };

      setCanon(patch); // CanonProvider already persists to localStorage
    });
    return () => sub.unsubscribe();
  }, [form, setCanon]);
}