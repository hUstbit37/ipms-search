import apiClient from '@/lib/api-client';
import { PaginationResponse } from "@/types/api";

export interface LicenseParams {
  search?: string;
  license_method?: string; // Hình thức cấp quyền: CV, HDCQ, TCQ, TUQ, PL
  license_type?: string; // Loại license: EXCLUSIVE, NON_EXCLUSIVE, SUB
  licensor_site_id?: number; // Mã site (Cấp quyền)
  licensee_site_id?: number; // Mã site (Nhận cấp quyền)
  goods_name?: string; // Sản phẩm
  nice_group?: string; // Nhóm sản phẩm
  status?: string; // Trạng thái: DRAFT, PENDING, ACTIVE, EXPIRED, TERMINATED
  sign_date_from?: string; // Ngày ký từ
  sign_date_to?: string; // Ngày ký đến
  ip_id?: string; // IP ID
  application_number?: string; // Số đơn
  certificate_number?: string; // Số bằng
  page: number;
  page_size: number;
  sort_by?: string;
  sort_order?: string;
}

export interface LicenseResponse {
  id: number;
  doc_number: string | null; // Mã hợp đồng
  license_method: string | null; // Hình thức cấp quyền
  license_type: string | null; // Loại license
  licensor_organization_id: number | null;
  licensor_short_name: string | null;
  licensor_name: string | null;
  licensor_site_code: string | null; // Mã site (Cấp quyền)
  licensee_organization_id: number | null;
  licensee_short_name: string | null;
  licensee_name: string | null;
  licensee_site_code: string | null; // Mã site (Nhận cấp quyền)
  status: string | null; // Trạng thái
  sign_date: string | null; // Ngày ký
  start_date: string | null;
  end_date: string | null;
  scope_type: string | null;
  scopes: string[] | null;
  scope_description: string | null;
  notes: string | null;
  is_auto_renew: boolean;
  renewal_period: number | null;
  renewal_unit: string | null;
  renewal_count: number | null;
  created_by: number | null;
  created_at: string | null;
  updated_at: string | null;
  // Related IPs
  license_ips?: Array<{
    ip_id: number;
    ip_type: string;
    nice_class: number | null;
    goods_name: string | null;
  }>;
}

export const licenseService = {
  search: async (params: LicenseParams, signal?: AbortSignal) => {
    return await apiClient<PaginationResponse<LicenseResponse>>(
      {
        url: "/v1/licenses",
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
        params
      }
    );
  },

  getById: async (id: string, signal?: AbortSignal) => {
    return await apiClient<LicenseResponse>(
      {
        url: `/v1/licenses/${id}`,
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
      }
    );
  },
  // Xóa license theo ID trực tiếp gọi BE
  deleteById: async (id: number | string) => {
    return await apiClient<{ message?: string }>(
      {
        url: `/v1/licenses/${id}`,
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );
  },
};

