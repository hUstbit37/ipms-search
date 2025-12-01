import apiInstance from "@/lib/api/apiInstance";
import { PaginationResponse } from "@/types/api";

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
  getAll: async (params: CompanyParams = { limit: 500, datasource: "ALL" }, signal?: AbortSignal) => {
    return await apiInstance.get<PaginationResponse<Company>>("/v1/companies", { signal, params });
  },

  getById: async (id: string, signal?: AbortSignal) => {
    return await apiInstance.get<Company>(`/v1/companies/${id}`, { signal });
  },
};
