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

// Interface cho request body step 1 (create)
export interface CreateLicenseRequest {
  license_method: string;
  doc_number: string;
  license_type: string;
  status: string;
  sign_date?: string;
  step: number;
}

// Interface cho request body step 1 (update)
export interface UpdateLicenseStep1Request {
  license_method?: string;
  doc_number?: string;
  license_type?: string;
  status?: string;
  sign_date?: string;
  step: number;
}

// Interface cho request body step 2
export interface UpdateLicenseStep2Request {
  licensor_organization_id: string;
  licensee_organization_id: string;
  enable_third_party?: boolean;
  third_party_name?: string;
  third_party_site?: string;
  ip_type: string;
  ip_items: Array<{
    id: number;
    ip_type: string;
    name?: string | null;
    application_number?: string | null;
    certificate_number?: string | null;
    products: Array<{
      goods_name?: string | null;
      group?: string | null;
    }>;
  }>;
  step: number;
}

// Interface cho request body step 3
export interface UpdateLicenseStep3Request {
  term_type: string;
  start_date?: string;
  end_date?: string;
  geographical_area: string;
  scope_of_rights: string;
  purpose?: string;
  auto_renew?: boolean;
  renewal_period?: number;
  renewal_unit?: string;
  fee_type: string;
  fee_percentage?: string;
  currency?: string;
  payment_period?: string;
  payment_method?: string;
  due_date?: string;
  step: number;
}

// Interface cho request body step 4
export interface UpdateLicenseStep4Request {
  files?: File[];
  notes?: string;
  step: number;
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

  // Tạo mới license - Step 1
  create: async (data: CreateLicenseRequest) => {
    return await apiClient<{ id: string | number; [key: string]: any }>(
      {
        url: "/v1/licenses",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data,
      }
    );
  },

  // Cập nhật license - Step 1, 2, 3, 4
  update: async (id: string | number, data: UpdateLicenseStep1Request | UpdateLicenseStep2Request | UpdateLicenseStep3Request | UpdateLicenseStep4Request) => {
    // Nếu là step 4 và có files, dùng FormData
    if (data.step === 4 && 'files' in data && data.files && data.files.length > 0) {
      const formData = new FormData();
      data.files.forEach((file) => {
        formData.append('files', file);
      });
      if (data.notes) {
        formData.append('notes', data.notes);
      }
      formData.append('step', String(data.step));
      
      return await apiClient<{ id: string | number; [key: string]: any }>(
        {
          url: `/v1/licenses/${id}`,
          method: "PUT",
          headers: { "Content-Type": "multipart/form-data" },
          data: formData,
        }
      );
    }
    
    // Step 2, 3 hoặc step 4 không có files - dùng JSON
    // Với step 4 không có files, chỉ gửi notes và step
    if (data.step === 4 && 'files' in data) {
      const step4Data: { notes?: string; step: number; files?: never[] } = {
        notes: data.notes,
        step: data.step,
        files: [],
      };
      return await apiClient<{ id: string | number; [key: string]: any }>(
        {
          url: `/v1/licenses/${id}`,
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          data: step4Data,
        }
      );
    }
    
    // Step 2, 3 - dùng JSON
    return await apiClient<{ id: string | number; [key: string]: any }>(
      {
        url: `/v1/licenses/${id}`,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        data,
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

