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

      const patch: Partial<ApplicationV1> = {};
      
      // Only include fields that have values to avoid overwriting with undefined
      if (values.businessLocation) patch.businessLocation = values.businessLocation as string;
      if (values.headquarters) patch.headquarters = values.headquarters as string;
      if (values.headquartersState) patch.headquartersState = values.headquartersState;
      if (values.industry) patch.industry = values.industry;
      if (values.lookingFor) patch.lookingFor = values.lookingFor as string;
      if (values.fundingAmount !== undefined) patch.fundingAmount = toNum(values.fundingAmount);
      if (values.fundsPurpose) patch.fundsPurpose = values.fundsPurpose;
      if (values.salesHistory) patch.salesHistory = values.salesHistory;
      if (values.revenueLastYear !== undefined) patch.revenueLastYear = toNum(values.revenueLastYear);
      if (values.averageMonthlyRevenue !== undefined) patch.averageMonthlyRevenue = toNum(values.averageMonthlyRevenue);
      if (values.accountsReceivableBalance !== undefined) patch.accountsReceivableBalance = toNum(values.accountsReceivableBalance);
      if (values.fixedAssetsValue !== undefined) patch.fixedAssetsValue = toNum(values.fixedAssetsValue);
      if (values.equipmentValue !== undefined) patch.equipmentValue = toNum(values.equipmentValue);
      
      // Step 3 business details
      if (values.businessName) patch.businessName = values.businessName;
      if (values.businessAddress) patch.businessAddress = values.businessAddress;
      if (values.businessCity) patch.businessCity = values.businessCity;
      if (values.businessState) patch.businessState = values.businessState;
      if (values.businessZipCode) patch.businessZipCode = values.businessZipCode;
      if (values.businessPhone) patch.businessPhone = values.businessPhone;
      if (values.businessEmail) patch.businessEmail = values.businessEmail;
      if (values.businessWebsite) patch.businessWebsite = values.businessWebsite;
      if (values.businessStartDate) patch.businessStartDate = values.businessStartDate;
      if (values.businessStructure) patch.businessStructure = values.businessStructure;
      if (values.employeeCount) patch.employeeCount = values.employeeCount;
      if (values.estimatedYearlyRevenue) patch.estimatedYearlyRevenue = values.estimatedYearlyRevenue;
      
      // Step 4 applicant info
      if (values.firstName) patch.firstName = values.firstName;
      if (values.lastName) patch.lastName = values.lastName;
      if (values.personalEmail) patch.personalEmail = values.personalEmail;
      if (values.personalPhone) patch.personalPhone = values.personalPhone;
      if (values.dateOfBirth) patch.dateOfBirth = values.dateOfBirth;
      if (values.socialSecurityNumber) patch.socialSecurityNumber = values.socialSecurityNumber;
      if (values.ownershipPercentage) patch.ownershipPercentage = values.ownershipPercentage;
      if (values.applicantAddress) patch.applicantAddress = values.applicantAddress;
      if (values.applicantCity) patch.applicantCity = values.applicantCity;
      if (values.applicantState) patch.applicantState = values.applicantState;
      if (values.applicantPostalCode) patch.applicantPostalCode = values.applicantPostalCode;
      
      // Partner info
      if (values.partnerFirstName) patch.partnerFirstName = values.partnerFirstName;
      if (values.partnerLastName) patch.partnerLastName = values.partnerLastName;
      if (values.partnerEmail) patch.partnerEmail = values.partnerEmail;
      if (values.partnerPhone) patch.partnerPhone = values.partnerPhone;

      setCanon(patch); // CanonProvider already persists to localStorage
    });
    return () => sub.unsubscribe();
  }, [form, setCanon]);
}