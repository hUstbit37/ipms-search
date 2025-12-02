import apiServerInstance from "@/lib/api/apiServerInstance";
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
  getAll: async (params: CompanyParams = { limit: 500, datasource: "ALL", page: 1, page_size: 500 }, signal?: AbortSignal) => {
    return await apiServerInstance.get<PaginationResponse<Company>>("/companies", { signal, params });
  },

  getById: async (id: string, signal?: AbortSignal) => {
    return await apiServerInstance.get<Company>(`/companies/${id}`, { signal });
  },
};
