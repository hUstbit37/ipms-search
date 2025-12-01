import { PaginationResponse } from "@/types/api";
import apiServerInstance from "@/lib/api/apiServerInstance";

export interface PatentParams {
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

export interface PatentResponse {
  code: string | null;
  name: string | null;
  summary: string | null;
  application_number: string | null;
  application_date: string | null;
  certificate_number: string | null;
  certificate_date: string | null;
  expiry_date: string | null;
  country_code: string | null;
  status: string | null;
  id: string;
  agency_id: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const patentService = {
  get: async (params: PatentParams, signal?: AbortSignal) => {
    return await apiServerInstance.get<PaginationResponse<PatentResponse>>("/patents", { signal, params });
  },
};
