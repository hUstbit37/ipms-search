import apiClient from "../api-client";

export type Company = {
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
  items: Company[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

const API_PATH = '/v1/organizations?organization_type=company'

export const getAllCompanies = async (): Promise<Company[]> => {
  // For dropdowns: only fetch first 100 active companies
  // If you need a specific company by ID, use getCompanyById instead
  const data = await apiClient<DataResponse>({ method: 'GET', url: `${API_PATH}&page=1&page_size=100&sort_by=id&sort_order=desc&is_active=true` })
  return data.items || []
}

export const getCompanyById = async (id: string): Promise<Company | null> => {
  try {
    const data = await apiClient<Company>({ method: 'GET', url: `/v1/companies/${id}` });
    return data;
  } catch (error) {
    return null;
  }
}

