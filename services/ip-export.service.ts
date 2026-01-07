import { apiClient } from "@/lib/api-client";

export type IpType = "trademark" | "patent" | "industrial_design" | "utility_solution";

export interface IPExportRequest {
  filters: Record<string, any> | null;
  document_types?: string[] | null;
  format: "excel" | "csv" | "zip";
  include_documents: boolean;
  include_metadata: boolean;
}

export interface IPExportResponse {
  job_id: number;
  job_code: string;
  status: "pending" | "processing" | "completed" | "failed";
  total_items: number;
  download_url: string;
  expires_at: string;
}

export const ipExportService = {
  // GET: Lấy danh sách document types
  getDocumentTypes: async (): Promise<string[]> => {
    return apiClient<string[]>({
      method: "GET",
      url: "/v1/public/document-types",
    });
  },

  // POST: Export IP data
  exportIPData: async (
    ipType: IpType,
    request: IPExportRequest
  ): Promise<IPExportResponse> => {
    return apiClient<IPExportResponse>({
      method: "POST",
      url: `/v1/public/${ipType}/export`,
      data: request,
      timeout: 300000, // 5 phút timeout cho export request
    });
  },

  // GET: Check export job status (nếu backend hỗ trợ)
  checkExportStatus: async (
    ipType: IpType,
    jobId: number
  ): Promise<IPExportResponse> => {
    return apiClient<IPExportResponse>({
      method: "GET",
      url: `/v1/public/${ipType}/export/${jobId}`,
      timeout: 30000, // 30 giây cho status check
    });
  },
};

