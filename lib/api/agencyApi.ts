import apiClient from "../api-client";

export type Agency = {
  id: number
  short_name: string
  name: string
  tax_code: string | null
  address: string | null
  old_address: { raw: string }[] | null
  phone: string | null
  email: string | null
  is_active: boolean
  isActive: boolean
  created_at?: string
  updated_at?: string
  reg_number?: string | null
  issued_date?: string | null
  issued_place?: string | null
  established_date?: string | null
}

export type DataResponse = {
  items: Agency[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

const API_PATH = '/v1/organizations?organization_type=agency'

export const getAllAgencies = async (): Promise<Agency[]> => {
  // For dropdowns: only fetch first 100 active agencies
  // If you need a specific agency by ID, use getAgencyById instead
  const data = await apiClient<DataResponse>({ method: 'GET', url: `${API_PATH}&page=1&page_size=100&sort_by=id&sort_order=desc&is_active=true` })
  return data.items || []
}

export const getAgencyById = async (id: string): Promise<Agency | null> => {
  try {
    const data = await apiClient<Agency>({ method: 'GET', url: `/v1/agencies/${id}` });
    return data;
  } catch (error) {
    return null;
  }
}

