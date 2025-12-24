"use client";

import { useQuery } from "@tanstack/react-query";
import { useDashboardStore } from "@/lib/stores/dashboardStore";
import { 
  getDashboardStats, 
  getDashboardStatistics,
  getGroupIpSummary,
  getCompanyIpDetail,
  getCompaniesIpDetail,
  getIpGrowth,
  getCountryIpDistribution,
  getSectorIpDistribution,
  type GroupIpSummaryParams,
  type CompanyIpDetailParams,
  type CompaniesIpDetailParams,
  type IpGrowthParams,
  type CountryIpDistributionParams,
  type SectorIpDistributionParams,
} from "@/lib/api/dashboardApi";

export const useDashboard = () => {
  const { timeRange, region } = useDashboardStore();

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", timeRange, region],
    queryFn: () => getDashboardStats(timeRange, region),
    staleTime: 1000 * 60 * 5,
  });

  const statisticsQuery = useQuery({
    queryKey: ["dashboard-statistics"],
    queryFn: async () => {
      const data = await getDashboardStatistics();
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    data: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    isFetching: dashboardQuery.isFetching,
    refetch: dashboardQuery.refetch,

    statistics: statisticsQuery.data,
    isStatisticsLoading: statisticsQuery.isLoading,
    isStatisticsError: statisticsQuery.isError,
    refetchStatistics: statisticsQuery.refetch,
  };
};

// New Dashboard Hooks
export const useGroupIpSummary = (params: GroupIpSummaryParams) => {
  return useQuery({
    queryKey: ["group-ip-summary", params],
    queryFn: () => getGroupIpSummary(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCompanyIpDetail = (params: CompanyIpDetailParams) => {
  return useQuery({
    queryKey: ["company-ip-detail", params],
    queryFn: () => getCompanyIpDetail(params),
    staleTime: 1000 * 60 * 5,
    enabled: !!params.companyId,
  });
};

export const useCompaniesIpDetail = (params: CompaniesIpDetailParams) => {
  return useQuery({
    queryKey: ["companies-ip-detail", params],
    queryFn: () => getCompaniesIpDetail(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useIpGrowth = (params: IpGrowthParams) => {
  return useQuery({
    queryKey: ["ip-growth", params],
    queryFn: () => getIpGrowth(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCountryIpDistribution = (params: CountryIpDistributionParams) => {
  return useQuery({
    queryKey: ["country-ip-distribution", params],
    queryFn: () => getCountryIpDistribution(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSectorIpDistribution = (params: SectorIpDistributionParams) => {
  return useQuery({
    queryKey: ["sector-ip-distribution", params],
    queryFn: () => getSectorIpDistribution(params),
    staleTime: 1000 * 60 * 5,
  });
};
