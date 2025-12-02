import apiClient from '@/lib/api-client';
import type { IPRecord } from '@/types/ip';
import { PaginationResponse } from "@/types/api";
import apiServerInstance from "@/lib/api/apiServerInstance";
import apiInstance from "@/lib/api/apiInstance";

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
  image_url?: string;
  wipo_status?: string;
  nice_class_text?: string;
  owner_id?: string;
  publication_date?: string;
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
  image_url: string | null;
  wipo_status: string | null;
  nice_class_text: string | null;
  publication_date: string | null;
}

export const trademarkService = {
  search: async (params: TrademarkParams, signal?: AbortSignal) => {
    return await apiServerInstance.get<PaginationResponse<TrademarkResponse>>("/trademarks", { signal, params });
  },

  // Lấy chi tiết nhãn hiệu theo ID từ API public
  getById: async (id: string, signal?: AbortSignal) => {
    return await apiServerInstance.get<any>(`/trademarks/${id}`, { signal });
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
