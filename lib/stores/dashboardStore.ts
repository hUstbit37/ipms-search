import { create } from "zustand";

export type TopDealer = {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  approvedWarranties: number;
};

export type WarrantyStatusCount = {
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
  cancelled: number;
};

export type DashboardStats = {
  totalActivatedVehicles: number;
  warrantyRequestsByStatus: WarrantyStatusCount;
  topDealers: TopDealer[];
  updatedAt: string;
};

export type DashboardStore = {
  timeRange: string;
  region: string;
  data: DashboardStats | null;

  setTimeRange: (v: string) => void;
  setRegion: (v: string) => void;
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  timeRange: "30d",
  region: "",
  data: null,

  setTimeRange: (v) => set({ timeRange: v }),
  setRegion: (v) => set({ region: v }),
}));

export type DashboardStatistics = {
  totalVehicles: number;
  activatedVehicles: number;
  totalWarrantyRequests: number;
  totalDealers: number;
  activeDealers: number;
  period: Record<string, any>;
};

export type DashboardStatisticsStore = {
  statistics: DashboardStatistics | null;
  setStatistics: (data: DashboardStatistics | null) => void;
};

export const useDashboardStatisticsStore = create<DashboardStatisticsStore>(
  (set) => ({
    statistics: null,
    setStatistics: (statistics) => set({ statistics }),
  })
);
