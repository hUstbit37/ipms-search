import apiClient from "../api-client";
import type { DashboardStats } from "@/lib/stores/dashboardStore";
import type { DashboardStatistics } from "@/lib/stores/dashboardStore";

export const getDashboardStats = async (
  timeRange: string,
  region: string
): Promise<DashboardStats> => {
  const params = {
    range: timeRange ?? "",
    region: region ?? "",
  };

  return await apiClient<DashboardStats>({ method: 'GET', url: `/v1/dashboard/metrics`, params });
};

export const getDashboardStatistics = async (): Promise<DashboardStatistics> => {
  return await apiClient<DashboardStatistics>({ method: 'GET', url: `/v1/dashboard/statistics` });
};

export const getInventoryAlerts = async (): Promise<DashboardStatistics> => {
  return await apiClient<DashboardStatistics>({ method: 'GET', url: `/v1/dashboard/inventory-alerts` });
};

// New Dashboard APIs
export interface GroupIpSummaryParams {
  dateType: 'application' | 'certificate';
  preset?: 'today' | 'last_7_days' | 'last_30_days' | 'last_6_months' | 'last_1_year';
  fromDate?: string;
  toDate?: string;
  limit?: number;
  datasource?: 'MASAN' | 'WIPO' | 'ALL';
}

export interface GroupIpSummaryResponse {
  totalIpCount: number;
  dateType: 'application' | 'certificate';
  fromDate: string | null;
  toDate: string | null;
  companies: Array<{
    companyId: number;
    companyShortName: string;
    companyName: string;
    ipCount: number;
    percentage: number;
    changePercentage: number | null;
  }>;
  comparison: {
    previousPeriodCount: number;
    previousPeriodChangePercentage: number;
    yesterdayCount: number;
    yesterdayChangePercentage: number;
  } | null;
}

export const getGroupIpSummary = async (params: GroupIpSummaryParams): Promise<GroupIpSummaryResponse> => {
  return await apiClient<GroupIpSummaryResponse>({ method: 'GET', url: '/v1/dashboard/group-ip-summary', params });
};

export interface CompanyIpDetailParams {
  companyId?: number;
  dateType: 'application' | 'certificate';
  preset?: 'today' | 'last_7_days' | 'last_30_days' | 'last_6_months' | 'last_1_year';
  fromDate?: string;
  toDate?: string;
  datasource?: 'MASAN' | 'WIPO' | 'ALL';
}

export interface CompanyIpDetailResponse {
  companyId: number;
  companyShortName: string;
  companyName: string;
  dateType: 'application' | 'certificate';
  fromDate: string | null;
  toDate: string | null;
  totalIpCount: number;
  byType: Array<{
    typeCode: string;
    typeName: string;
    ipCount: number;
    percentage: number;
  }>;
  byStatus: Array<{
    status: string;
    ipCount: number;
  }>;
  comparison: {
    previousPeriodCount: number;
    previousPeriodChangePercentage: number;
    yesterdayCount: number;
    yesterdayChangePercentage: number;
  } | null;
}

export const getCompanyIpDetail = async (params: CompanyIpDetailParams): Promise<CompanyIpDetailResponse> => {
  return await apiClient<CompanyIpDetailResponse>({ method: 'GET', url: '/v1/dashboard/company-ip-detail', params });
};

export interface CompaniesIpDetailParams {
  dateType: 'application' | 'certificate';
  preset?: 'today' | 'last_7_days' | 'last_30_days' | 'last_6_months' | 'last_1_year';
  fromDate?: string;
  toDate?: string;
  limit?: number;
  datasource?: 'MASAN' | 'WIPO' | 'ALL';
}

export interface CompaniesIpDetailResponse {
  dateType: 'application' | 'certificate';
  fromDate: string | null;
  toDate: string | null;
  totalIpCount: number;
  companies: Array<{
    companyId: number;
    companyShortName: string;
    companyName: string;
    totalIpCount: number;
    percentage: number;
    byType: Array<{
      typeCode: string;
      typeName: string;
      ipCount: number;
      percentage: number | null;
    }>;
  }>;
}

export const getCompaniesIpDetail = async (params: CompaniesIpDetailParams): Promise<CompaniesIpDetailResponse> => {
  return await apiClient<CompaniesIpDetailResponse>({ method: 'GET', url: '/v1/dashboard/companies-ip-detail', params });
};

export interface IpGrowthParams {
  fromYear: number;
  toYear: number;
  dateType: 'application' | 'certificate';
  companyId?: number;
  datasource?: 'MASAN' | 'WIPO' | 'ALL';
}

export interface IpGrowthResponse {
  scope: 'group' | 'company';
  companyId: number | null;
  companyShortName: string | null;
  companyName: string | null;
  dateType: 'application' | 'certificate';
  items: Array<{
    year: number;
    ipCount: number;
    growthRate: number | null;
    byType: Array<{
      typeCode: string;
      typeName: string;
      ipCount: number;
      percentage: number | null;
    }> | null;
  }>;
}

export const getIpGrowth = async (params: IpGrowthParams): Promise<IpGrowthResponse> => {
  return await apiClient<IpGrowthResponse>({ method: 'GET', url: '/v1/dashboard/ip-growth', params });
};

export interface CountryIpDistributionParams {
  dateType: 'application' | 'certificate';
  preset?: 'today' | 'last_7_days' | 'last_30_days' | 'last_6_months' | 'last_1_year';
  fromDate?: string;
  toDate?: string;
  companyId?: number;
  limit?: number;
  group_other?: boolean;
  datasource?: 'MASAN' | 'WIPO' | 'ALL';
}

export interface CountryIpDistributionResponse {
  totalIpCount: number;
  dateType: 'application' | 'certificate';
  fromDate: string | null;
  toDate: string | null;
  companyId: number | null;
  companyShortName: string | null;
  companyName: string | null;
  countries: Array<{
    countryCode: string;
    countryName: string;
    ipCount: number;
    percentage: number | null;
    changePercentage: number | null;
  }>;
  comparison: {
    previousPeriodCount: number;
    previousPeriodChangePercentage: number;
    yesterdayCount: number;
    yesterdayChangePercentage: number;
  } | null;
}

export const getCountryIpDistribution = async (params: CountryIpDistributionParams): Promise<CountryIpDistributionResponse> => {
  return await apiClient<CountryIpDistributionResponse>({ method: 'GET', url: '/v1/dashboard/country-ip-distribution', params });
};

export interface SectorIpDistributionParams {
  dateType: 'application' | 'certificate';
  preset?: 'today' | 'last_7_days' | 'last_30_days' | 'last_6_months' | 'last_1_year';
  fromDate?: string;
  toDate?: string;
  companyId?: number;
  group?: 'nice' | 'locarno' | 'ipc';
  sectorLevel?: number;
  datasource?: 'MASAN' | 'WIPO' | 'ALL';
}

export interface SectorIpDistributionResponse {
  totalIpCount: number;
  dateType: 'application' | 'certificate';
  fromDate: string | null;
  toDate: string | null;
  sectorLevel: number | null;
  companyId: number | null;
  companyShortName: string | null;
  companyName: string | null;
  sectors: Array<{
    sectorCode: string;
    sectorName: string;
    ipCount: number;
    percentage: number;
  }>;
  comparison: {
    previousPeriodCount: number;
    previousPeriodChangePercentage: number;
    yesterdayCount: number;
    yesterdayChangePercentage: number;
  } | null;
}

export const getSectorIpDistribution = async (params: SectorIpDistributionParams): Promise<SectorIpDistributionResponse> => {
  return await apiClient<SectorIpDistributionResponse>({ method: 'GET', url: '/v1/dashboard/sector-ip-distribution', params });
};
