export interface PlacementRecord {
  sNo: number;
  name: string;
  offers: number;
  packageLPA: string;
  maxLPA: number;
  category: 'Super Dream' | 'Dream' | 'Core & IT';
}

export const PLACEMENT_SUMMARY = {
  highestPackage: '₹47 LPA',
  averagePackage: '₹7.5 LPA',
  totalOffers: '760+',
  totalCompanies: 53,
  highlightCompanies: ['AMAZON', 'AUTODESK', 'CAPGEMINI', 'TCS', 'ZOHO', 'COGNIZANT', 'LTI MIND TREE', 'UST Global']
};

export const PLACEMENT_RECORDS: PlacementRecord[] = [
  { sNo: 1, name: 'AMAZON', offers: 2, packageLPA: '47', maxLPA: 47, category: 'Super Dream' },
  { sNo: 2, name: 'PRODUCT BASED COMPANY', offers: 2, packageLPA: '44', maxLPA: 44, category: 'Super Dream' },
  { sNo: 3, name: 'AUTODESK', offers: 1, packageLPA: '40', maxLPA: 40, category: 'Super Dream' },
  { sNo: 4, name: 'TCS', offers: 35, packageLPA: '9, 7, 3.86, 3.45, 3.36', maxLPA: 9, category: 'Dream' },
  { sNo: 5, name: 'KAPTURE', offers: 1, packageLPA: '8.4', maxLPA: 8.4, category: 'Dream' },
  { sNo: 6, name: 'HASHDIN BY DELOITTE', offers: 1, packageLPA: '8', maxLPA: 8, category: 'Dream' },
  { sNo: 7, name: 'STEAM A', offers: 2, packageLPA: '8', maxLPA: 8, category: 'Dream' },
  { sNo: 8, name: 'CAPGEMINI', offers: 414, packageLPA: '7.5, 5.75, 4.25', maxLPA: 7.5, category: 'Dream' },
  { sNo: 9, name: 'LUMEN', offers: 1, packageLPA: '7', maxLPA: 7, category: 'Dream' },
  { sNo: 10, name: 'ZOHO', offers: 1, packageLPA: '7', maxLPA: 7, category: 'Dream' },
  { sNo: 11, name: 'TATA ELECTRONICS', offers: 1, packageLPA: '7', maxLPA: 7, category: 'Dream' },
  { sNo: 12, name: 'TIGER ANALYTICS', offers: 3, packageLPA: '6.5', maxLPA: 6.5, category: 'Dream' },
  { sNo: 13, name: 'HEXAWARE', offers: 36, packageLPA: '6 & 4', maxLPA: 6, category: 'Dream' },
  { sNo: 14, name: 'SOPRA STERIA', offers: 11, packageLPA: '6', maxLPA: 6, category: 'Dream' },
  { sNo: 15, name: 'LIGHT & WONDER', offers: 1, packageLPA: '6', maxLPA: 6, category: 'Dream' },
  { sNo: 16, name: 'COGNIZANT', offers: 60, packageLPA: '6 & 4', maxLPA: 6, category: 'Dream' },
  { sNo: 17, name: 'AVASOFTL', offers: 2, packageLPA: '6', maxLPA: 6, category: 'Dream' },
  { sNo: 18, name: 'EFFIGO GLOBAL', offers: 1, packageLPA: '6', maxLPA: 6, category: 'Dream' },
  { sNo: 19, name: 'SURVEY SPARROW', offers: 1, packageLPA: '6', maxLPA: 6, category: 'Dream' },
  { sNo: 20, name: 'ZOHO', offers: 3, packageLPA: '5.6', maxLPA: 5.6, category: 'Dream' },
  { sNo: 21, name: 'QUEST GLOBAL', offers: 8, packageLPA: '5.5', maxLPA: 5.5, category: 'Dream' },
  { sNo: 22, name: 'SPIC', offers: 3, packageLPA: '5.5', maxLPA: 5.5, category: 'Dream' },
  { sNo: 23, name: 'SCHINEDER ELECTRIC', offers: 1, packageLPA: '5.5', maxLPA: 5.5, category: 'Dream' },
  { sNo: 24, name: 'EMERSON', offers: 4, packageLPA: '5', maxLPA: 5, category: 'Dream' },
  { sNo: 25, name: 'LTI MIND TREE', offers: 47, packageLPA: '4.5', maxLPA: 4.5, category: 'Core & IT' },
  { sNo: 26, name: 'KPIT', offers: 16, packageLPA: '4.5', maxLPA: 4.5, category: 'Core & IT' },
  { sNo: 27, name: 'ROBERT BOSCH', offers: 4, packageLPA: '4.5', maxLPA: 4.5, category: 'Core & IT' },
  { sNo: 28, name: 'PROPEL', offers: 3, packageLPA: '4.5', maxLPA: 4.5, category: 'Core & IT' },
  { sNo: 29, name: 'AASAHI GLASS', offers: 1, packageLPA: '4.5', maxLPA: 4.5, category: 'Core & IT' },
  { sNo: 30, name: 'EFFIGO GLOBAL', offers: 1, packageLPA: '4.5', maxLPA: 4.5, category: 'Core & IT' },
  { sNo: 31, name: 'UST Global', offers: 45, packageLPA: '4.25', maxLPA: 4.25, category: 'Core & IT' },
  { sNo: 32, name: 'HCL', offers: 23, packageLPA: '4.25', maxLPA: 4.25, category: 'Core & IT' },
  { sNo: 33, name: 'QUEST GLOBAL', offers: 4, packageLPA: '4.25', maxLPA: 4.25, category: 'Core & IT' },
  { sNo: 34, name: 'RENAULT NISSAN', offers: 3, packageLPA: '4.25', maxLPA: 4.25, category: 'Core & IT' },
  { sNo: 35, name: 'COFORGE', offers: 1, packageLPA: '4.25', maxLPA: 4.25, category: 'Core & IT' },
  { sNo: 36, name: 'TESSOLVE', offers: 1, packageLPA: '4.25', maxLPA: 4.25, category: 'Core & IT' },
  { sNo: 37, name: 'MAXOP', offers: 7, packageLPA: '4', maxLPA: 4, category: 'Core & IT' },
  { sNo: 38, name: 'VAKEN', offers: 3, packageLPA: '4', maxLPA: 4, category: 'Core & IT' },
  { sNo: 39, name: 'AMARARAJA', offers: 2, packageLPA: '4', maxLPA: 4, category: 'Core & IT' },
  { sNo: 40, name: 'SHM GROUP', offers: 2, packageLPA: '4', maxLPA: 4, category: 'Core & IT' },
  { sNo: 41, name: 'KANINI SOFTWARE SOLUTIONS', offers: 1, packageLPA: '4', maxLPA: 4, category: 'Core & IT' },
  { sNo: 42, name: 'NISSI ENGINEERING', offers: 14, packageLPA: '3.6', maxLPA: 3.6, category: 'Core & IT' },
  { sNo: 43, name: 'KGISL', offers: 8, packageLPA: '3.6', maxLPA: 3.6, category: 'Core & IT' },
  { sNo: 44, name: 'INFOSYS', offers: 25, packageLPA: '3.4', maxLPA: 3.4, category: 'Core & IT' },
  { sNo: 45, name: 'SLK SOFTWARE', offers: 8, packageLPA: '3.2', maxLPA: 3.2, category: 'Core & IT' },
  { sNo: 46, name: 'MOVATE', offers: 3, packageLPA: '3.2', maxLPA: 3.2, category: 'Core & IT' },
  { sNo: 47, name: 'B-Arm', offers: 6, packageLPA: '3', maxLPA: 3, category: 'Core & IT' },
  { sNo: 48, name: 'BHARATH FORGE', offers: 7, packageLPA: '3', maxLPA: 3, category: 'Core & IT' },
  { sNo: 49, name: 'RENACON', offers: 7, packageLPA: '3', maxLPA: 3, category: 'Core & IT' },
  { sNo: 50, name: 'SPK POWER INFRA', offers: 5, packageLPA: '3', maxLPA: 3, category: 'Core & IT' },
  { sNo: 51, name: 'SIECHEM TECHNOLOGIES PVT. LTD', offers: 2, packageLPA: '3', maxLPA: 3, category: 'Core & IT' },
  { sNo: 52, name: 'BGR ENERGY', offers: 2, packageLPA: '3', maxLPA: 3, category: 'Core & IT' },
  { sNo: 53, name: 'TESSOLVE', offers: 1, packageLPA: '3', maxLPA: 3, category: 'Core & IT' },
];
