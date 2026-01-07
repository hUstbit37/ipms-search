import { apiClient } from "@/lib/api-client";

export type IpType = "trademark" | "patent" | "industrial_design" | "utility_solution";

export interface CustomField {
  id: number;
  ip_type: IpType;
  alias_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomFieldsResponse {
  total: number;
  items: CustomField[];
}

export interface CustomFieldCreateRequest {
  alias_name: string;
}

export interface CustomFieldUpdateRequest {
  alias_name?: string;
  is_active?: boolean;
}

export interface CustomFieldValueUpdateRequest {
  ip_type: IpType;
  custom_field_id: number;
  application_numbers: string[];
  value: string | null;
}

export const customFieldsService = {
  // Get list of custom fields
  getCustomFields: async (params?: {
    ip_type?: IpType;
    search?: string;
    is_active?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<CustomFieldsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.ip_type) searchParams.append("ip_type", params.ip_type);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.is_active !== undefined) searchParams.append("is_active", String(params.is_active));
    if (params?.skip !== undefined) searchParams.append("skip", String(params.skip));
    if (params?.limit !== undefined) searchParams.append("limit", String(params.limit));

    const queryString = searchParams.toString();
    const url = `/v1/ip-custom-fields/custom-fields${queryString ? `?${queryString}` : ""}`;
    
    return apiClient<CustomFieldsResponse>({ method: "GET", url });
  },

  // Create new custom field
  createCustomField: async (ipType: IpType, data: CustomFieldCreateRequest): Promise<CustomField> => {
    return apiClient<CustomField>({ 
      method: "POST", 
      url: `/v1/ip-custom-fields/custom-fields/${ipType}`,
      data 
    });
  },

  // Update custom field
  updateCustomField: async (customFieldId: number, data: CustomFieldUpdateRequest): Promise<CustomField> => {
    return apiClient<CustomField>({ 
      method: "PUT", 
      url: `/v1/ip-custom-fields/custom-fields/${customFieldId}`,
      data 
    });
  },

  // Delete custom field (soft delete - set is_active = false)
  deleteCustomField: async (customFieldId: number): Promise<{ message: string; success: boolean }> => {
    return apiClient<{ message: string; success: boolean }>({ 
      method: "DELETE", 
      url: `/v1/ip-custom-fields/custom-fields/${customFieldId}` 
    });
  },

  // Update custom field values
  updateCustomFieldValues: async (data: CustomFieldValueUpdateRequest): Promise<{ message: string; success: boolean }> => {
    return apiClient<{ message: string; success: boolean }>({ 
      method: "PUT", 
      url: `/v1/ip-custom-fields/custom-fields/values`,
      data 
    });
  },

  // Get custom fields for a specific IP
  getCustomFieldsForIP: async (ipType: IpType, ipId: number): Promise<{
    ip_type: IpType;
    ip_id: number;
    custom_fields: Record<string, string | null>;
  }> => {
    return apiClient<{
      ip_type: IpType;
      ip_id: number;
      custom_fields: Record<string, string | null>;
    }>({ 
      method: "GET", 
      url: `/v1/ip-custom-fields/${ipType}/${ipId}` 
    });
  },
};
