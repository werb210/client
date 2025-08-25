// Pre-filled company data from real financial documents
export interface CompanyProfile {
  id: string;
  name: string;
  step1: {
    businessLocation: 'CA' | 'US';
    headquarters: 'CA' | 'US';
    headquartersState: string;
    industry: string;
    lookingFor: 'capital' | 'equipment' | 'both';
    fundingAmount: number;
    fundsPurpose: 'equipment' | 'inventory' | 'expansion' | 'working_capital';
    salesHistory: string;
    revenueLastYear: number;
    averageMonthlyRevenue: number;
    accountsReceivableBalance: number;
    fixedAssetsValue: number;
    equipmentValue: number;
  };
  step3: {
    operatingName: string;
    legalName: string;
    businessStreetAddress: string;
    businessCity: string;
    businessState: string;
    businessPostalCode: string;
    businessPhone: string;
    businessWebsite: string;
    businessStartDate: string;
    businessStructure: string;
    employeeCount: number;
    estimatedYearlyRevenue: number;
  };
  step4: {
    applicantFirstName: string;
    applicantLastName: string;
    applicantEmail: string;
    applicantPhone: string;
    applicantAddress: string;
    applicantCity: string;
    applicantState: string;
    applicantZipCode: string;
    applicantDateOfBirth: string;
    ownershipPercentage: number;
    hasPartner: boolean;
  };
}

export const companyProfiles: CompanyProfile[] = [
  {
    id: 'site-engineering',
    name: 'SITE ENGINEERING TECHNOLOGY INC.',
    step1: {
      businessLocation: 'CA',
      headquarters: 'CA',
      headquartersState: 'AB',
      industry: 'technology',
      lookingFor: 'capital',
      fundingAmount: 200000,
      fundsPurpose: 'working_capital',
      salesHistory: '3+yr',
      revenueLastYear: 1000000,
      averageMonthlyRevenue: 100000,
      accountsReceivableBalance: 250000,
      fixedAssetsValue: 100000,
      equipmentValue: 50000,
    },
    step3: {
      operatingName: 'S E T Inc.',
      legalName: 'SITE ENGINEERING TECHNOLOGY INC.',
      businessStreetAddress: 'PO BOX 20056',
      businessCity: 'Red Deer',
      businessState: 'AB',
      businessPostalCode: 'T4N 6X5',
      businessPhone: '+15878881837',
      businessWebsite: '',
      businessStartDate: '2018-01-01',
      businessStructure: 'corporation',
      employeeCount: 8,
      estimatedYearlyRevenue: 1200000,
    },
    step4: {
      applicantFirstName: 'John',
      applicantLastName: 'Smith',
      applicantEmail: 'john.smith@setinc.ca',
      applicantPhone: '+15878881837',
      applicantAddress: 'PO BOX 20056',
      applicantCity: 'Red Deer',
      applicantState: 'AB',
      applicantZipCode: 'T4N 6X5',
      applicantDateOfBirth: '1980-05-15',
      ownershipPercentage: 100,
      hasPartner: false,
    },
  },
  {
    id: 'pro-pipe',
    name: 'PRO-PIPE SERVICE & SALES LTD.',
    step1: {
      businessLocation: 'CA',
      headquarters: 'CA',
      headquartersState: 'AB',
      industry: 'construction',
      lookingFor: 'capital',
      fundingAmount: 500000,
      fundsPurpose: 'working_capital',
      salesHistory: '3+yr',
      revenueLastYear: 3500000,
      averageMonthlyRevenue: 300000,
      accountsReceivableBalance: 180000,
      fixedAssetsValue: 200000,
      equipmentValue: 150000,
    },
    step3: {
      operatingName: 'Pro-Pipe Service & Sales',
      legalName: 'PRO-PIPE SERVICE & SALES LTD.',
      businessStreetAddress: 'PO BOX 1101 STN MAIN',
      businessCity: 'Nisku',
      businessState: 'AB',
      businessPostalCode: 'T9E 8A8',
      businessPhone: '+17804847407',
      businessWebsite: '',
      businessStartDate: '2015-01-01',
      businessStructure: 'corporation',
      employeeCount: 25,
      estimatedYearlyRevenue: 3500000,
    },
    step4: {
      applicantFirstName: 'Robert',
      applicantLastName: 'Wilson',
      applicantEmail: 'robert.wilson@propipe.ca',
      applicantPhone: '+17804847407',
      applicantAddress: 'PO BOX 1101 STN MAIN',
      applicantCity: 'Nisku',
      applicantState: 'AB',
      applicantZipCode: 'T9E 8A8',
      applicantDateOfBirth: '1975-03-20',
      ownershipPercentage: 100,
      hasPartner: false,
    },
  },
  {
    id: 'black-label',
    name: '5729841 MB Ltd. o/a Black Label Automation & Electrical',
    step1: {
      businessLocation: 'CA',
      headquarters: 'CA',
      headquartersState: 'MB',
      industry: 'construction',
      lookingFor: 'capital',
      fundingAmount: 750000,
      fundsPurpose: 'expansion',
      salesHistory: '3+yr',
      revenueLastYear: 9547752,
      averageMonthlyRevenue: 795000,
      accountsReceivableBalance: 30732489,
      fixedAssetsValue: 385891,
      equipmentValue: 200000,
    },
    step3: {
      operatingName: 'Black Label Automation & Electrical',
      legalName: '5729841 MB Ltd.',
      businessStreetAddress: '242 Hargrave Street, Suite 1200',
      businessCity: 'Winnipeg',
      businessState: 'MB',
      businessPostalCode: 'R3C 0T8',
      businessPhone: '+12047754531',
      businessWebsite: '',
      businessStartDate: '2019-01-01',
      businessStructure: 'corporation',
      employeeCount: 45,
      estimatedYearlyRevenue: 10000000,
    },
    step4: {
      applicantFirstName: 'Michael',
      applicantLastName: 'Thompson',
      applicantEmail: 'michael.thompson@blacklabelauto.ca',
      applicantPhone: '+12047754531',
      applicantAddress: '242 Hargrave Street, Suite 1200',
      applicantCity: 'Winnipeg',
      applicantState: 'MB',
      applicantZipCode: 'R3C 0T8',
      applicantDateOfBirth: '1982-11-10',
      ownershipPercentage: 100,
      hasPartner: false,
    },
  },
  {
    id: 'northern-construction',
    name: 'Northern Construction & Development Ltd.',
    step1: {
      businessLocation: 'CA',
      headquarters: 'CA',
      headquartersState: 'BC',
      industry: 'construction',
      lookingFor: 'equipment',
      fundingAmount: 1000000,
      fundsPurpose: 'equipment',
      salesHistory: '3+yr',
      revenueLastYear: 5200000,
      averageMonthlyRevenue: 433000,
      accountsReceivableBalance: 850000,
      fixedAssetsValue: 1200000,
      equipmentValue: 800000,
    },
    step3: {
      operatingName: 'Northern Construction',
      legalName: 'Northern Construction & Development Ltd.',
      businessStreetAddress: '1500 West Georgia Street',
      businessCity: 'Vancouver',
      businessState: 'BC',
      businessPostalCode: 'V6G 2Z6',
      businessPhone: '+16046821234',
      businessWebsite: 'www.northernconst.ca',
      businessStartDate: '2012-01-01',
      businessStructure: 'corporation',
      employeeCount: 65,
      estimatedYearlyRevenue: 5500000,
    },
    step4: {
      applicantFirstName: 'David',
      applicantLastName: 'Chen',
      applicantEmail: 'david.chen@northernconst.ca',
      applicantPhone: '+16046821234',
      applicantAddress: '1500 West Georgia Street',
      applicantCity: 'Vancouver',
      applicantState: 'BC',
      applicantZipCode: 'V6G 2Z6',
      applicantDateOfBirth: '1978-07-25',
      ownershipPercentage: 100,
      hasPartner: false,
    },
  },
  {
    id: 'precision-fabrication',
    name: 'Precision Fabrication & Manufacturing Ltd.',
    step1: {
      businessLocation: 'CA',
      headquarters: 'CA',
      headquartersState: 'ON',
      industry: 'manufacturing',
      lookingFor: 'both',
      fundingAmount: 1500000,
      fundsPurpose: 'expansion',
      salesHistory: '3+yr',
      revenueLastYear: 12500000,
      averageMonthlyRevenue: 1041000,
      accountsReceivableBalance: 2100000,
      fixedAssetsValue: 3200000,
      equipmentValue: 2800000,
    },
    step3: {
      operatingName: 'Precision Fabrication',
      legalName: 'Precision Fabrication & Manufacturing Ltd.',
      businessStreetAddress: '2450 Industrial Drive',
      businessCity: 'Cambridge',
      businessState: 'ON',
      businessPostalCode: 'N1R 7L7',
      businessPhone: '+15196217892',
      businessWebsite: 'www.precisionfab.ca',
      businessStartDate: '2010-03-01',
      businessStructure: 'corporation',
      employeeCount: 85,
      estimatedYearlyRevenue: 13000000,
    },
    step4: {
      applicantFirstName: 'Sarah',
      applicantLastName: 'Martinez',
      applicantEmail: 'sarah.martinez@precisionfab.ca',
      applicantPhone: '+15196217892',
      applicantAddress: '2450 Industrial Drive',
      applicantCity: 'Cambridge',
      applicantState: 'ON',
      applicantZipCode: 'N1R 7L7',
      applicantDateOfBirth: '1976-09-14',
      ownershipPercentage: 100,
      hasPartner: false,
    },
  },
];