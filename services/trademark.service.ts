import apiClient from '@/lib/api-client';
import type { IPRecord } from '@/types/ip';
import { PaginationResponse } from "@/types/api";
import apiServerInstance from "@/lib/api/apiServerInstance";
import { PatentResponse } from "@/services/patent.service";

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
  publication_date_from?: string;
  publication_date_to?: string;
  expiry_date_from?: string;
  expiry_date_to?: string;
  application_country?: string;
  publication_country?: string;
  priority_country?: string;
  nice_class?: string;
  product_category?: string;
  vienna_class?: string;
  applicant?: string;
  representative?: string;
  basic_application_number?: string;
  priority_number?: string;
  trade_name?: string;
  name?: string;
  page: number;
  page_size: number;
  sort_by?: string;
  sort_order?: string;
  image_url?: string;
  wipo_status?: string;
  nice_class_text?: string;
  owner_id?: string;
  publication_date?: string;
  agency_id?: string;
  owner_name?: string;
  agency_name?: string;
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
  publication_number: string | null;
  color_claim: string | null;
  vienna_class: string | null;
  owner_name: string | null;
  agency_name: string | null;
}

export const trademarkService = {
  search: async (params: TrademarkParams, signal?: AbortSignal) => {
    return await apiClient<PaginationResponse<TrademarkResponse>>(
      {
        url: "/v1/public/trademarks",
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
        params
      }
    );
  },

  // Lấy chi tiết nhãn hiệu theo ID từ API public
  getById: async (id: string, signal?: AbortSignal) => {
    return await apiClient<any>(
      {
        url: `/v1/public/trademarks/${id}`,
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
