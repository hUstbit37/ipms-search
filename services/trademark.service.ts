import apiClient from '@/lib/api-client';
import type { IPRecord } from '@/types/ip';
import { PaginationResponse } from "@/types/api";

export interface TrademarkParams {
  search?: string;
  status?: string;
  country_code?: string;
  application_number?: string;
  certificate_number?: string;
  application_date_from?: string;
  application_date_to?: string;
  certificate_date_from?: string;
  certificate_date_to?: string;
  page: number;
  page_size: number;
  sort_by?: string;
  sort_order?: string;
}

export interface TrademarkResponse {
  code: string | null;
  name: string | null;
  description: string | null;
  application_number: string | null;
  application_date: string | null;
  certificate_number: string | null;
  certificate_date: string | null;
  expiry_date: string | null;
  country_code: string | null;
  status: string | null;
  id: string;
  owner_id: string | null;
  agency_id: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const trademarkService = {
  search: async (params: TrademarkParams, signal?: AbortSignal) => {
    return await apiClient<PaginationResponse<TrademarkResponse>>(
      {
        url: "/v1/public/trademarks",
        method: "GET",
        headers: { "Content-Type": "application/json" },
        params: {
          ...params,
          type: 'trademark'
        },
        signal,
      }
    );
  },

  // Lấy chi tiết nhãn hiệu theo ID
  getById: async (id: string, signal?: AbortSignal): Promise<IPRecord> => {
    return await apiClient<IPRecord>(
      {
        url: `/trademarks/${ id }`,
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
      }
    );
  },

  // Lấy nhãn hiệu theo số đơn
  getByRegistrationNumber: async (registrationNumber: string, signal?: AbortSignal): Promise<IPRecord> => {
    return await apiClient<IPRecord>(
      {
        url: `/trademarks/registration/${ registrationNumber }`,
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
      }
    );
  },
};
