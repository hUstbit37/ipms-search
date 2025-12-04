import apiServerInstance from "@/lib/api/apiServerInstance";
import { PaginationResponse } from "@/types/api";
import apiClient from "@/lib/api-client";
import { LoginResponse } from "@/services/auth.service";

export interface Company {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  country_code: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CompanyParams {
  limit?: number;
  datasource?: string;
  page?: number;
  page_size?: number;
}

export const companyService = {
  getAll: async (params: CompanyParams = { limit: 500, datasource: "ALL", page: 1, page_size: 500 }, signal?: AbortSignal) => {
    return await apiClient<PaginationResponse<Company>>(
      {
        url: "/v1/companies",
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
        params
      }
    );
  },

  getById: async (id: string, signal?: AbortSignal) => {
    return await apiServerInstance.get<Company>(`/v1/companies/${id}`, { signal });
  },
};
