import { apiClient } from "@/lib/api-client";

export type IpType = "trademark" | "patent" | "industrial_design" | "utility_solution";

export interface InternalProcessingStatusItem {
  title: string;
  deadline: string | null;
  status: string;
}

export interface InternalProcessingStatusResponse {
  internal_processing_status: InternalProcessingStatusItem[];
}

export interface UpdateInternalProcessingStatusRequest {
  internal_processing_status: InternalProcessingStatusItem[];
}

export interface AddInternalProcessingStatusItemRequest {
  title: string;
  deadline: string | null;
  status: string;
}

export interface UpdateInternalProcessingStatusItemRequest {
  title?: string;
  deadline?: string | null;
  status?: string;
}

export interface MessageResponse {
  message: string;
}

export const internalProcessingStatusService = {
  // GET: Xem danh sách tiến trình xử lý nội bộ
  get: async (
    ipType: IpType,
    applicationNumber: string
  ): Promise<InternalProcessingStatusResponse> => {
    return apiClient<InternalProcessingStatusResponse>({
      method: "GET",
      url: `/v1/internal-processing-status/${ipType}/${applicationNumber}`,
    });
  },

  // PUT: Cập nhật toàn bộ danh sách
  updateAll: async (
    ipType: IpType,
    applicationNumber: string,
    data: UpdateInternalProcessingStatusRequest
  ): Promise<MessageResponse> => {
    return apiClient<MessageResponse>({
      method: "PUT",
      url: `/v1/internal-processing-status/${ipType}/${applicationNumber}`,
      data,
    });
  },

  // POST: Thêm item mới
  addItem: async (
    ipType: IpType,
    applicationNumber: string,
    data: AddInternalProcessingStatusItemRequest
  ): Promise<MessageResponse> => {
    return apiClient<MessageResponse>({
      method: "POST",
      url: `/v1/internal-processing-status/${ipType}/${applicationNumber}`,
      data,
    });
  },

  // PATCH: Cập nhật một item theo index
  updateItem: async (
    ipType: IpType,
    applicationNumber: string,
    index: number,
    data: UpdateInternalProcessingStatusItemRequest
  ): Promise<MessageResponse> => {
    return apiClient<MessageResponse>({
      method: "PATCH",
      url: `/v1/internal-processing-status/${ipType}/${applicationNumber}/${index}`,
      data,
    });
  },

  // DELETE: Xóa một item theo index
  deleteItem: async (
    ipType: IpType,
    applicationNumber: string,
    index: number
  ): Promise<MessageResponse> => {
    return apiClient<MessageResponse>({
      method: "DELETE",
      url: `/v1/internal-processing-status/${ipType}/${applicationNumber}/${index}`,
    });
  },
};

