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
  priorityCountry?: string;
  niceClass?: string;
  productCategory?: string;
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
  id: number | string;
  application_type: string | null;
  code: string | null;
  name: string | null;
  name_upper_ascii: string | null;
  summary: string | null;
  ip_family_id: number | string | null;
  publication_number: string | null;
  certificate_number: string | null;
  certificate_date: string | null;
  certificate_publication_date: string | null;
  expiry_date: string | null;
  application_number: string | null;
  application_date: string | null;
  publication_date: string | null;
  priority_data: string | null;
  divisional_number: string | null;
  converted_number: string | null;
  authors: string[] | string | null;
  owner_ids: Array<number | string> | null;
  agency_ids: Array<number | string> | null;
  ipc_list_raw: string[] | null;
  owners_raw: string[] | null;
  authors_raw: string[] | null;
  agencies_raw: string[] | null;
  request_protections: Array<Record<string, string | number | null>> | null;
  patents_type: string | null;
  owners:
    | Array<{
        id: number | string;
        name: string | null;
        short_name: string | null;
        organization_type: string | null;
      }>
    | null;
  agencies:
    | Array<{
        id: number | string;
        name: string | null;
        short_name: string | null;
        organization_type: string | null;
      }>
    | null;
  authors_info: Array<{ name: string | null }> | null;
  organization_id: number | string | null;
  organization_name: string | null;
  author_applicants: string | null;
  certificate_author_applicants: string | null;
  pct_national_entry_date: string | null;
  pct_application_number: string | null;
  pct_application_date: string | null;
  pct_publication_number: string | null;
  pct_publication_date: string | null;
  pct_application_type: string | null;
  image_urls: string[] | null;
  image_url?: string | null;
  document_count: number | null;
  ipc_list: string[] | string | null;
  owner: string | null;
  owner_name: string | null;
  note: string | null;
  folder_name: string | null;
  declaration_file_name: string | null;
  certificate_file_name: string | null;
  search_report_file_name: string | null;
  pyc_no: string | null;
  country_code: string | null;
  origin_country_code: string | null;
  status: string | null;
  wipo_status: string | null;
  commercial_status: string | null;
  search_status: string | null;
  risk_status: string | null;
  wipo_process: Array<Record<string, string | number | null>> | null;
  source: string | null;
  workflow_status: string | null;
  review_note: string | null;
  sync_status: string | null;
  synced_data_buffer: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  documents: unknown[];
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

  // Lấy chi tiết sáng chế theo ID từ API public
  getById: async (id: string, signal?: AbortSignal) => {
    return await apiClient<any>(
      {
        url: `/v1/public/patents/${id}`,
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
      }
    );
  },
};
