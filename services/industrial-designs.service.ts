import { PaginationResponse } from "@/types/api";
import apiServerInstance from "@/lib/api/apiServerInstance";
import apiClient from "@/lib/api-client";
import { Company } from "@/services/company.service";

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
  publicationDateFrom?: string;
  publicationDateTo?: string;
  expiryDateFrom?: string;
  expiryDateTo?: string;
  priorityCountry?: string;
  niceClass?: string;
  productCategory?: string;
  applicant?: string;
  representative?: string;
  name?: string;
  basicApplicationNumber?: string;
  priority_number?: string;
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
  image_url: string | null;
  wipo_status: string | null;
  owner_id: string | null;
  owner_name: string | null;
  agency_name: string | null;
  locarno_list: Array<string> | null;
  authors: string | null;
  priority_data: Array<{
    appNumber: string;
    date: string;
    country: string;
  }> | null;
}

export const industrialDesignsService = {
  get: async (params: IndustrialDesignParams, signal?: AbortSignal) => {
    return await apiClient<PaginationResponse<IndustrialDesignResponse>>(
      {
        url: "/v1/public/industrial-designs",
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
        params
      }
    );
  },
};
