import apiClient from '@/lib/api-client';
import type { SearchParams, SearchResponse, IPRecord } from '@/types/ip';

// Service để tìm kiếm nhãn hiệu
export const trademarkService = {
  // Tìm kiếm nhãn hiệu
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const response = await apiClient.get<SearchResponse>('/trademarks/search', {
      params: {
        ...params,
        type: 'trademark', // Force type to trademark
      },
    });
    return response.data;
  },

  // Lấy chi tiết nhãn hiệu theo ID
  getById: async (id: string): Promise<IPRecord> => {
    const response = await apiClient.get<IPRecord>(`/trademarks/${id}`);
    return response.data;
  },

  // Lấy nhãn hiệu theo số đơn
  getByRegistrationNumber: async (registrationNumber: string): Promise<IPRecord> => {
    const response = await apiClient.get<IPRecord>(`/trademarks/registration/${registrationNumber}`);
    return response.data;
  },
};
