// Mock data matching the API structure

// GET /api/v1/dashboard/group-ip-summary
export const groupIpSummary = {
  totalIpCount: 2450,
  dateType: "application",
  fromDate: "2024-01-01",
  toDate: "2024-12-31",
  companies: [
    { companyId: 1, companyShortName: "MSC", companyName: "Công ty Cổ phần Hàng tiêu dùng Masan", ipCount: 980, percentage: 40.0 },
    { companyId: 2, companyShortName: "MCH", companyName: "Công ty Cổ phần MASAN CONSUMER HOLDINGS", ipCount: 490, percentage: 20.0 },
    { companyId: 3, companyShortName: "WCM", companyName: "Công ty Cổ phần WinCommerce", ipCount: 368, percentage: 15.0 },
    { companyId: 4, companyShortName: "MLF", companyName: "Công ty Cổ phần MeatLife", ipCount: 294, percentage: 12.0 },
    { companyId: 5, companyShortName: "PLH", companyName: "Công ty TNHH Phúc Long Heritage", ipCount: 196, percentage: 8.0 },
    { companyId: 6, companyShortName: "TCB", companyName: "Ngân hàng TMCP Kỹ Thương Việt Nam", ipCount: 122, percentage: 5.0 },
  ],
};

// GET /api/v1/dashboard/company-ip-detail
export const companyIpDetail = {
  companyId: 1,
  companyShortName: "MSC",
  companyName: "Công ty Cổ phần Hàng tiêu dùng Masan",
  dateType: "application",
  fromDate: "2024-01-01",
  toDate: "2024-12-31",
  totalIpCount: 980,
  byType: [
    { typeCode: "trademark", typeName: "Trademark", ipCount: 637, percentage: 65.0 },
    { typeCode: "industrial_design", typeName: "Industrial Design", ipCount: 196, percentage: 20.0 },
    { typeCode: "patent", typeName: "Patent", ipCount: 98, percentage: 10.0 },
    { typeCode: "utility_solution", typeName: "Utility Solution", ipCount: 49, percentage: 5.0 },
  ],
};

// GET /api/v1/dashboard/companies-ip-detail
export const companiesIpDetail = {
  dateType: "application",
  fromDate: "2024-01-01",
  toDate: "2024-12-31",
  totalIpCount: 2450,
  companies: [
    {
      companyId: 1,
      companyShortName: "MSC",
      companyName: "Công ty Cổ phần Hàng tiêu dùng Masan",
      totalIpCount: 980,
      percentage: 40.0,
      byType: [
        { typeCode: "trademark", typeName: "Trademark", ipCount: 637, percentage: 65.0 },
        { typeCode: "industrial_design", typeName: "Industrial Design", ipCount: 196, percentage: 20.0 },
        { typeCode: "patent", typeName: "Patent", ipCount: 98, percentage: 10.0 },
        { typeCode: "utility_solution", typeName: "Utility Solution", ipCount: 49, percentage: 5.0 },
      ],
    },
    {
      companyId: 2,
      companyShortName: "MCH",
      companyName: "Công ty Cổ phần MASAN CONSUMER HOLDINGS",
      totalIpCount: 490,
      percentage: 20.0,
      byType: [
        { typeCode: "trademark", typeName: "Trademark", ipCount: 294, percentage: 60.0 },
        { typeCode: "industrial_design", typeName: "Industrial Design", ipCount: 98, percentage: 20.0 },
        { typeCode: "patent", typeName: "Patent", ipCount: 73, percentage: 15.0 },
        { typeCode: "utility_solution", typeName: "Utility Solution", ipCount: 25, percentage: 5.0 },
      ],
    },
    {
      companyId: 3,
      companyShortName: "WCM",
      companyName: "Công ty Cổ phần WinCommerce",
      totalIpCount: 368,
      percentage: 15.0,
      byType: [
        { typeCode: "trademark", typeName: "Trademark", ipCount: 258, percentage: 70.0 },
        { typeCode: "industrial_design", typeName: "Industrial Design", ipCount: 74, percentage: 20.0 },
        { typeCode: "patent", typeName: "Patent", ipCount: 22, percentage: 6.0 },
        { typeCode: "utility_solution", typeName: "Utility Solution", ipCount: 14, percentage: 4.0 },
      ],
    },
    {
      companyId: 4,
      companyShortName: "MLF",
      companyName: "Công ty Cổ phần MeatLife",
      totalIpCount: 294,
      percentage: 12.0,
      byType: [
        { typeCode: "trademark", typeName: "Trademark", ipCount: 176, percentage: 60.0 },
        { typeCode: "industrial_design", typeName: "Industrial Design", ipCount: 59, percentage: 20.0 },
        { typeCode: "patent", typeName: "Patent", ipCount: 44, percentage: 15.0 },
        { typeCode: "utility_solution", typeName: "Utility Solution", ipCount: 15, percentage: 5.0 },
      ],
    },
    {
      companyId: 5,
      companyShortName: "PLH",
      companyName: "Công ty TNHH Phúc Long Heritage",
      totalIpCount: 196,
      percentage: 8.0,
      byType: [
        { typeCode: "trademark", typeName: "Trademark", ipCount: 137, percentage: 70.0 },
        { typeCode: "industrial_design", typeName: "Industrial Design", ipCount: 39, percentage: 20.0 },
        { typeCode: "patent", typeName: "Patent", ipCount: 12, percentage: 6.0 },
        { typeCode: "utility_solution", typeName: "Utility Solution", ipCount: 8, percentage: 4.0 },
      ],
    },
    {
      companyId: 6,
      companyShortName: "TCB",
      companyName: "Ngân hàng TMCP Kỹ Thương Việt Nam",
      totalIpCount: 122,
      percentage: 5.0,
      byType: [
        { typeCode: "trademark", typeName: "Trademark", ipCount: 98, percentage: 80.0 },
        { typeCode: "industrial_design", typeName: "Industrial Design", ipCount: 12, percentage: 10.0 },
        { typeCode: "patent", typeName: "Patent", ipCount: 8, percentage: 7.0 },
        { typeCode: "utility_solution", typeName: "Utility Solution", ipCount: 4, percentage: 3.0 },
      ],
    },
  ],
};

// GET /api/v1/dashboard/ip-growth
export const ipGrowthData = {
  scope: "group",
  companyId: null,
  companyName: null,
  dateType: "application",
  items: [
    {
      year: 2019,
      ipCount: 1200,
      growthRate: null,
      byType: [
        { ipType: "trademark", ipCount: 720, growthRate: null },
        { ipType: "patent", ipCount: 240, growthRate: null },
        { ipType: "industrial_design", ipCount: 180, growthRate: null },
        { ipType: "utility_solution", ipCount: 60, growthRate: null },
      ],
    },
    {
      year: 2020,
      ipCount: 1450,
      growthRate: 20.8,
      byType: [
        { ipType: "trademark", ipCount: 870, growthRate: 20.8 },
        { ipType: "patent", ipCount: 290, growthRate: 20.8 },
        { ipType: "industrial_design", ipCount: 218, growthRate: 21.1 },
        { ipType: "utility_solution", ipCount: 72, growthRate: 20.0 },
      ],
    },
    {
      year: 2021,
      ipCount: 1680,
      growthRate: 15.9,
      byType: [
        { ipType: "trademark", ipCount: 1008, growthRate: 15.9 },
        { ipType: "patent", ipCount: 336, growthRate: 15.9 },
        { ipType: "industrial_design", ipCount: 252, growthRate: 15.6 },
        { ipType: "utility_solution", ipCount: 84, growthRate: 16.7 },
      ],
    },
    {
      year: 2022,
      ipCount: 2100,
      growthRate: 25.0,
      byType: [
        { ipType: "trademark", ipCount: 1260, growthRate: 25.0 },
        { ipType: "patent", ipCount: 420, growthRate: 25.0 },
        { ipType: "industrial_design", ipCount: 315, growthRate: 25.0 },
        { ipType: "utility_solution", ipCount: 105, growthRate: 25.0 },
      ],
    },
    {
      year: 2023,
      ipCount: 2450,
      growthRate: 16.7,
      byType: [
        { ipType: "trademark", ipCount: 1470, growthRate: 16.7 },
        { ipType: "patent", ipCount: 490, growthRate: 16.7 },
        { ipType: "industrial_design", ipCount: 368, growthRate: 16.8 },
        { ipType: "utility_solution", ipCount: 122, growthRate: 16.2 },
      ],
    },
    {
      year: 2024,
      ipCount: 2780,
      growthRate: 13.5,
      byType: [
        { ipType: "trademark", ipCount: 1668, growthRate: 13.5 },
        { ipType: "patent", ipCount: 556, growthRate: 13.5 },
        { ipType: "industrial_design", ipCount: 417, growthRate: 13.3 },
        { ipType: "utility_solution", ipCount: 139, growthRate: 13.9 },
      ],
    },
  ],
};

// GET /api/v1/dashboard/ip-growth (company scope)
export const companyIpGrowthData = {
  scope: "company",
  companyId: 1,
  companyShortName: "MSC",
  companyName: "Công ty Cổ phần Hàng tiêu dùng Masan",
  dateType: "application",
  items: [
    { year: 2019, ipCount: 480, growthRate: null },
    { year: 2020, ipCount: 580, growthRate: 20.8 },
    { year: 2021, ipCount: 672, growthRate: 15.9 },
    { year: 2022, ipCount: 840, growthRate: 25.0 },
    { year: 2023, ipCount: 980, growthRate: 16.7 },
    { year: 2024, ipCount: 1112, growthRate: 13.5 },
  ],
};

// GET /api/v1/dashboard/country-ip-distribution
export const countryDistribution = {
  totalIpCount: 2450,
  dateType: "application",
  fromDate: "2024-01-01",
  toDate: "2024-12-31",
  companyName: null,
  countries: [
    { countryCode: "VN", countryName: "Vietnam", ipCount: 1764, percentage: 72.0 },
    { countryCode: "US", countryName: "United States", ipCount: 245, percentage: 10.0 },
    { countryCode: "SG", countryName: "Singapore", ipCount: 147, percentage: 6.0 },
    { countryCode: "JP", countryName: "Japan", ipCount: 123, percentage: 5.0 },
    { countryCode: "CN", countryName: "China", ipCount: 98, percentage: 4.0 },
    { countryCode: "TH", countryName: "Thailand", ipCount: 73, percentage: 3.0 },
  ],
};

// GET /api/v1/dashboard/sector-ip-distribution
export const sectorDistribution = {
  totalIpCount: 2450,
  dateType: "application",
  fromDate: "2024-01-01",
  toDate: "2024-12-31",
  companyName: null,
  group: "nice",
  sectors: [
    { sectorCode: "29", sectorName: "Meat, fish, poultry", ipCount: 490, percentage: 20.0 },
    { sectorCode: "30", sectorName: "Coffee, tea, cocoa, sugar", ipCount: 441, percentage: 18.0 },
    { sectorCode: "32", sectorName: "Beers, mineral waters", ipCount: 368, percentage: 15.0 },
    { sectorCode: "35", sectorName: "Advertising, business management", ipCount: 294, percentage: 12.0 },
    { sectorCode: "43", sectorName: "Services for food and drink", ipCount: 245, percentage: 10.0 },
    { sectorCode: "05", sectorName: "Pharmaceuticals", ipCount: 196, percentage: 8.0 },
    { sectorCode: "01", sectorName: "Chemicals", ipCount: 172, percentage: 7.0 },
    { sectorCode: "09", sectorName: "Scientific apparatus", ipCount: 147, percentage: 6.0 },
    { sectorCode: "36", sectorName: "Insurance, financial affairs", ipCount: 97, percentage: 4.0 },
  ],
};

// Chart color mapping
export const chartColors = {
  primary: "hsl(38 92% 50%)",
  accent: "hsl(200 80% 55%)",
  purple: "hsl(280 70% 60%)",
  green: "hsl(152 69% 45%)",
  pink: "hsl(340 75% 55%)",
  slate: "hsl(222 35% 40%)",
};

export const companyColors: Record<number, string> = {
  1: chartColors.primary,
  2: chartColors.accent,
  3: chartColors.purple,
  4: chartColors.green,
  5: chartColors.pink,
  6: chartColors.slate,
};

// IP Type colors
export const ipTypeColors: Record<string, string> = {
  trademark: chartColors.primary,
  patent: chartColors.accent,
  industrial_design: chartColors.purple,
  utility_solution: chartColors.green,
};
