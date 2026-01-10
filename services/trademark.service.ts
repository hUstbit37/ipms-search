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
  publicationDateFrom?: string;
  publicationDateTo?: string;
  expiryDateFrom?: string;
  expiryDateTo?: string;
  priorityCountry?: string;
  niceClass?: string;
  productCategory?: string;
  viennaClass?: string;
  applicant?: string;
  representative?: string;
  basicApplicationNumber?: string;
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
  hasCertificate?: boolean;
}

type TrademarkParty = {
  id: number | null;
  name: string | null;
  short_name: string | null;
  organization_type: string | null;
};

export interface TrademarkResponse {
  id: number;
  application_type: string | null;
  code: string | null;
  name: string | null;
  name_upper_ascii: string | null;
  description: string | null;
  ip_family_id: number | null;
  international_reg_no: string | null;
  basic_application_number: string | null;
  certificate_number: string | null;
  certificate_date: string | null;
  expiry_date: string | null;
  renewal_date: string | null;
  renewal_count: number | null;
  declaration_date: string | null;
  application_number: string | null;
  application_date: string | null;
  publication_number: string | null;
  publication_date: string | null;
  certificate_publication_date: string | null;
  gazette_number: string | null;
  internal_link: string | null;
  image_urls: string[] | null;
  trademark_type: string | null;
  color_claim: string | null;
  owner_ids: number[] | null;
  agency_ids: number[] | null;
  owners_raw: string[] | null;
  agencies_raw: string[] | null;
  vienna_class_list_raw: string[] | null;
  nice_class_list_raw: string[] | null;
  nice_class_list: string[] | null;
  nice_class_text: string | null;
  trademark_normal: string | null;
  owners: TrademarkParty[] | null;
  agencies: TrademarkParty[] | null;
  document_count: number | null;
  formal_refuse_info: string | null;
  content_refuse_info: string | null;
  content_refuse_date: string | null;
  note: string | null;
  folder_name: string | null;
  declaration_file_name: string | null;
  certificate_file_name: string | null;
  search_report_file_name: string | null;
  content_refuse_file_name: string | null;
  pyc_no: string | null;
  disclaimed_elements: string | null;
  country_code: string | null;
  origin_country_code: string | null;
  status: string | null;
  wipo_status: string | null;
  wipo_process: Array<Record<string, string | null>> | null;
  commercial_status: string | null;
  search_status: string | null;
  risk_status: string | null;
  source: string | null;
  workflow_status: string | null;
  review_note: string | null;
  sync_status: string | null;
  synced_data_buffer: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  documents: Array<Record<string, unknown>> | null;
  owner_id: number | null;
  organization_id: number | null;
  owner_name: string | null;
  organization_name: string | null;
  // Legacy fields to avoid breakage in older UI pieces
  image_url?: string | null;
  agency_name?: string | null;
  vienna_class?: string | null;
  internal_processing_status?: Array<{
    title: string;
    deadline: string | null;
    status: string;
  }> | null;
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
