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
  old_owner?: string;
  representative?: string;
  name?: string;
  basicApplicationNumber?: string;
  priority_number?: string;
  page: number;
  page_size: number;
  sort_by?: string;
  sort_order?: string;
}

type IndustrialDesignParty = {
  id: number | null;
  name: string | null;
  short_name: string | null;
  organization_type: string | null;
};

type IndustrialDesignPriority = {
  appNumber: string;
  date: string;
  country: string;
};

export interface IndustrialDesignResponse {
  id: number;
  application_type: string | null;
  code: string | null;
  name: string | null;
  name_upper_ascii: string | null;
  description: string | null;
  ip_family_id: number | null;
  pakage_type_id: number | null;
  certificate_number: string | null;
  certificate_date: string | null;
  expiry_date: string | null;
  publication_number: string | null;
  application_number: string | null;
  application_date: string | null;
  exhibition_data: string | null;
  variant_count: number | null;
  priority_data: IndustrialDesignPriority[] | null;
  publication_date: string | null;
  certificate_publication_date: string | null;
  renewal_date: string | null;
  renewal_count: number | null;
  internal_link: string | null;
  image_urls: string[] | null;
  title: string | null;
  locarno_list: string[] | null;
  distinguishing_features: string | null;
  authors: string[] | null;
  owner_ids: number[] | null;
  organization_ids: number[] | null;
  agency_ids: number[] | null;
  authors_raw: string[] | null;
  agencies_raw: string[] | null;
  owners_raw: string[] | null;
  locarno_list_raw: string[] | null;
  request_protections: Array<Record<string, string | null>> | null;
  owners: IndustrialDesignParty[] | null;
  organizations: IndustrialDesignParty[] | null;
  agencies: IndustrialDesignParty[] | null;
  authors_info: Array<{ name: string | null }> | null;
  owner_id: number | null;
  organization_id: number | null;
  owner_name: string | null;
  organization_name: string | null;
  document_count: number | null;
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
  // Kept for backward compatibility; not present in response but used elsewhere.
  image_url?: string | null;
  agency_name?: string | null;
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
