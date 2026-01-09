import apiClient from '@/lib/api-client';
import { PaginationResponse } from "@/types/api";

export interface TransferParams {
  search?: string;
  transfer_method?: string; // Hình thức chuyển nhượng: CV, HDCN, TCN, PL
  transfer_type?: string; // Loại chuyển nhượng: FULL, PARTIAL
  transferor_site_id?: number; // Mã site (Bên chuyển nhượng)
  transferee_site_id?: number; // Mã site (Bên nhận chuyển nhượng)
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

export interface TransferResponse {
  id: number;
  doc_number: string | null; // Mã hợp đồng
  transfer_method: string | null; // Hình thức chuyển nhượng
  transfer_type: string | null; // Loại chuyển nhượng
  transferor_organization_id: number | null;
  transferor_short_name: string | null;
  transferor_name: string | null;
  transferor_site_code: string | null; // Mã site (Bên chuyển nhượng)
  transferee_organization_id: number | null;
  transferee_short_name: string | null;
  transferee_name: string | null;
  transferee_site_code: string | null; // Mã site (Bên nhận chuyển nhượng)
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
  transfer_ips?: Array<{
    ip_id: number;
    ip_type: string;
    nice_class: number | null;
    goods_name: string | null;
  }>;
}

export const transferService = {
  search: async (params: TransferParams, signal?: AbortSignal) => {
    return await apiClient<PaginationResponse<TransferResponse>>(
      {
        url: "/v1/transfers",
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
        params
      }
    );
  },

  getById: async (id: string, signal?: AbortSignal) => {
    return await apiClient<TransferResponse>(
      {
        url: `/v1/transfers/${id}`,
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
      }
    );
  },
  // Xóa transfer theo ID trực tiếp gọi BE
  deleteById: async (id: number | string) => {
    return await apiClient<{ message?: string }>(
      {
        url: `/v1/transfers/${id}`,
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );
  },
};

