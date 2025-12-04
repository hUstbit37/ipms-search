import { PaginationResponse } from "@/types/api";
import apiClient from "@/lib/api-client";

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
  publicationDateFrom?: string;
  publicationDateTo?: string;
  expiryDateFrom?: string;
  expiryDateTo?: string;
  application_country?: string;
  publication_country?: string;
  priorityCountry?: string;
  niceClass?: string;
  applicant?: string;
  representative?: string;
  name?: string;
  page: number;
  page_size: number;
  sort_by?: string;
  sort_order?: string;
  image_url?: string;
  wipo_status?: string;
  publication_date?: string;
  ipc_list?: string;
  summary?: string;
  owner_id?: string;
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
  publication_date: string | null;
  ipc_list: string | null;
  wipo_status: string | null;
  owner_id: string | null;
  image_url: string | null;
  owner_name: string | null;
  agency_name: string | null;
  owner: string | null;
  authors: string | null;
  pirority_data: Array<{
    appNumber: string;
    date: string;
    country: string;
  }> | null;
}

export const patentService = {
  get: async (params: PatentParams, signal?: AbortSignal) => {
    return await apiClient<PaginationResponse<PatentResponse>>(
      {
        url: "/v1/public/patents",
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
        params
      }
    );
  },
};
