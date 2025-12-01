import { PaginationResponse } from "@/types/api";
import apiServerInstance from "@/lib/api/apiServerInstance";

export interface IndustrialDesignParams {
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

export interface IndustrialDesignResponse {
  code: string | null;
  name: string | null;
  summary: string | null;
  application_number: string | null;
  application_date: string | null;
  certificate_number: string | null;
  certificate_date: string | null;
  expiry_date: string | null;
  country_code: string | null;
  publication_date: string | null;
  publication_number: string | null;
  description: string | null;
  status: string | null;
  id: string;
  agency_id: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const industrialDesignsService = {
  get: async (params: IndustrialDesignParams, signal?: AbortSignal) => {
    return await apiServerInstance.get<PaginationResponse<IndustrialDesignResponse>>("/industrial-designs", {
      signal,
      params
    });
  },
};
