import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { trademarkService } from '@/services/trademark.service';
import type { SearchParams, SearchResponse, IPRecord } from '@/types/ip';

// Hook tìm kiếm nhãn hiệu
export const useTrademarkSearch = (
  params: SearchParams,
  options?: Partial<UseQueryOptions<SearchResponse>>
) => {
  return useQuery({
    queryKey: ['trademarks', 'search', params],
    queryFn: () => trademarkService.search(params),
    enabled: !!params.query || !!params.registrationNumber,
    ...options,
  });
};

// Hook lấy chi tiết nhãn hiệu
export const useTrademarkDetails = (
  id: string,
  options?: Partial<UseQueryOptions<IPRecord>>
) => {
  return useQuery({
    queryKey: ['trademarks', 'details', id],
    queryFn: () => trademarkService.getById(id),
    enabled: !!id,
    ...options,
  });
};

// Hook lấy nhãn hiệu theo số đơn
export const useTrademarkByNumber = (
  registrationNumber: string,
  options?: Partial<UseQueryOptions<IPRecord>>
) => {
  return useQuery({
    queryKey: ['trademarks', 'byNumber', registrationNumber],
    queryFn: () => trademarkService.getByRegistrationNumber(registrationNumber),
    enabled: !!registrationNumber,
    ...options,
  });
};
