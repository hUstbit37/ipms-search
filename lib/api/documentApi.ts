
import apiClient from '../api-client'

export type TreeNode = {
  key: string
  title: string
  type: 'site' | 'country' | 'ip_type' | 'ip_folder' | 'procedure' | 'document' | 'folder' | 'file'
  id?: number | null
  children?: TreeNode[] | null
  document_count?: number
  is_leaf?: boolean
  metadata?: {
    level: number
    path?: string
    file_count?: number
    folder_count?: number
    size?: number
    mime_type?: string
    last_modified?: string
  }
}

export type TreeResponse = TreeNode

export const getTree = async (path?: string, ipType?: string): Promise<TreeResponse> => {
  const params: Record<string, string> = {}
  if (path) params.path = path
  if (ipType) params.ip_type = ipType

  const queryString = new URLSearchParams(params).toString()
  const url = `/v1/file-management/tree${queryString ? `?${queryString}` : ''}`
  return await apiClient<TreeResponse>({ method: 'GET', url })
}

export const getTreeStats = async (path: string) => {
  return await apiClient<any>({
    method: 'GET',
    url: `/v1/file-management/tree/stats`,
    params: { path: encodeURIComponent(path) },
  })
}

export type DocumentRule = {
  procedure_group: string
  document_code: string
  label: string
  required_fields: Array<{
    name: string
    label: string
    type: string
    required: boolean
  }>
  template: string
  supports_parse: boolean
}

export type RulesResponse = {
  rules: DocumentRule[]
  procedure_groups: Array<{ value: string; label: string }>
  document_codes: Array<{ value: string; label: string }>
}

export const getRules = async (): Promise<RulesResponse> => {
  return await apiClient<RulesResponse>({
    method: 'GET',
    url: `/v1/file-management/rules`,
  })
}

export type UploadFilePayload = {
  file: File
  parent_path: string
  naming_mode?: "AUTO" | "MANUAL"
  manual_file_name?: string
  module_type: string
  module_id?: number
  document_code?: string
  application_no?: string
  company_short_name?: string
  brand_name?: string
  shape_type?: string
  product_type?: string
  design_name?: string
  document_date?: string
  document_type?: string
  title?: string
  description?: string
  auto_infer?: boolean
}

export type UploadFileResponse = {
  success: boolean
  document_id: number
  display_name: string
  final_file_name: string
  blob_path: string
  file_url: string
  file_size: number
  validation: {
    is_valid: boolean
    errors: string[]
  }
}

export const uploadFile = async (payload: UploadFilePayload): Promise<UploadFileResponse> => {
  const formData = new FormData()
  formData.append("file", payload.file)
  formData.append("parent_path", payload.parent_path)
  formData.append("naming_mode", payload.naming_mode || "AUTO")
  formData.append("module_type", payload.module_type)
  
  if (payload.module_id !== undefined) formData.append("module_id", String(payload.module_id))
  if (payload.document_code) formData.append("document_code", payload.document_code)
  if (payload.application_no) formData.append("application_no", payload.application_no)
  if (payload.company_short_name) formData.append("company_short_name", payload.company_short_name)
  if (payload.brand_name) formData.append("brand_name", payload.brand_name)
  if (payload.shape_type) formData.append("shape_type", payload.shape_type)
  if (payload.product_type) formData.append("product_type", payload.product_type)
  if (payload.design_name) formData.append("design_name", payload.design_name)
  if (payload.document_date) formData.append("document_date", payload.document_date)
  if (payload.manual_file_name) formData.append("manual_file_name", payload.manual_file_name)
  if (payload.document_type) formData.append("document_type", payload.document_type)
  if (payload.title) formData.append("title", payload.title)
  if (payload.description) formData.append("description", payload.description)
  if (payload.auto_infer !== undefined) formData.append("auto_infer", String(payload.auto_infer))

  return await apiClient<UploadFileResponse>({
    method: 'POST',
    url: `/v1/file-management/upload`,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export type CreateFolderPayload =
  | {
      mode: "manual"
      parent_path: string
      name: string
    }
  | {
      mode: "auto"
      parent_path: string
      module_type?: string
      module_id?: number | string
      company_name?: string
      brand_name?: string
      loai?: string
      serial_no?: string
    }

export type CreateFolderResponse = {
  success: boolean
  folder_id: number
  path: string
  name: string
}

export const createFolderApi = async (payload: CreateFolderPayload): Promise<CreateFolderResponse> => {
  return await apiClient<CreateFolderResponse>({
    method: 'POST',
    url: `/v1/file-management/folders`,
    data: payload,
  })
}

export type FolderDeleteResponse = {
  success: boolean
  message: string
  error?: string
}

export const deleteFolder = async (folderId: number): Promise<FolderDeleteResponse> => {
  return await apiClient<FolderDeleteResponse>({
    method: 'DELETE',
    url: `/v1/file-management/folders/${folderId}`,
  })
}

// --------------------------
// Files
// --------------------------

export type ListFilesRequest = {
  path?: string
  keyword?: string
  ip_type?: string
  module_id?: number
  procedure_group?: string
  document_code?: string
  date_from?: string
  date_to?: string
  page?: number
  page_size?: number
  sort_by?: string
  sort_order?: "asc" | "desc"
}

export type FileListItem = {
  id: number
  display_name?: string
  file_name?: string
  blob_path?: string
  file_size?: number
  mime_type?: string
  module_type?: string
  module_id?: number
  procedure_group?: string
  document_code?: string
  official_date?: string
  official_no?: string
  created_at?: string
  updated_at?: string
  updated_by?: number
  updated_by_name?: string
  file_url?: string
}

export type ListFilesResponse = {
  items: FileListItem[]
  total: number
  page: number
  page_size: number
  pages: number
}

export const listFiles = async (payload: ListFilesRequest): Promise<ListFilesResponse> => {
  return await apiClient<ListFilesResponse>({
    method: 'POST',
    url: `/v1/file-management/files/list`,
    data: payload,
  })
}

export type FileInfo = FileListItem & {
  created_by?: number
  created_by_name?: string
}

export const getFileInfo = async (fileId: number): Promise<FileInfo> => {
  return await apiClient<FileInfo>({
    method: 'GET',
    url: `/v1/file-management/files/${fileId}/info`,
  })
}

export type DeleteFilesResponse = {
  success: boolean
  deleted_count: number
  message: string
}

export const deleteFiles = async (fileIds: number[], reason?: string): Promise<DeleteFilesResponse> => {
  return await apiClient<DeleteFilesResponse>({
    method: 'POST',
    url: `/v1/file-management/files/delete`,
    data: {
      file_ids: fileIds,
      reason,
    },
  })
}

// --------------------------
// Move Documents
// --------------------------

export type MoveDocumentsRequest = {
  document_ids: number[]
  target_path: string
  overwrite: boolean
}

export type MoveDocumentResult = {
  document_id: number
  old_blob_path: string
  new_blob_path: string | null
  status: "moved" | "error" | "skipped"
  error: string | null
}

export type MoveDocumentsResponse = {
  success: boolean
  results: MoveDocumentResult[]
}

export const moveDocuments = async (payload: MoveDocumentsRequest): Promise<MoveDocumentsResponse> => {
  return await apiClient<MoveDocumentsResponse>({
    method: 'POST',
    url: `/v1/file-management/files/move`,
    data: payload,
  })
}

// --------------------------
// Preview
// --------------------------

export type PreviewRequest = {
  document_code: string
  module_type: string
  application_no: string
  module_id?: number
  company_short_name?: string
  brand_name?: string
  design_name?: string
  shape_type?: string
  document_date?: string
  parent_path?: string
  // Legacy fields (optional)
  procedure_group?: string
  official_date?: string
  official_no?: string
}

export type PreviewResponse = {
  preview_name: string
  is_valid: boolean
  blob_path?: string
  display_name?: string
  folder_name?: string
  missing_fields?: string[]
  validation_errors?: string[]
}

export const previewDocument = async (payload: PreviewRequest): Promise<PreviewResponse> => {
  return await apiClient<PreviewResponse>({
    method: 'POST',
    url: `/v1/file-management/preview`,
    data: payload,
  })
}

// --------------------------
// Download
// --------------------------

export type DownloadUrlResponse = {
  success: boolean
  file_id: number
  file_name: string
  download_url: string
  expires_in: number
  expires_at: string
}

export const getDownloadUrl = async (fileId: number, expiresIn: number = 3600): Promise<DownloadUrlResponse> => {
  return await apiClient<DownloadUrlResponse>({
    method: 'GET',
    url: `/v1/file-management/files/${fileId}/download-url`,
    params: { expires_in: expiresIn },
  })
}

export const downloadFileDirect = async (fileId: number): Promise<Blob> => {
  return await apiClient<Blob>({
    method: 'GET',
    url: `/v1/file-management/files/${fileId}/download`,
    responseType: 'blob',
  })
}

export const downloadMultipleFiles = async (fileIds: number[]): Promise<Blob> => {
  const formData = new FormData()
  fileIds.forEach(id => {
    formData.append('file_ids', id.toString())
  })
  
  return await apiClient<Blob>({
    method: 'POST',
    url: `/v1/file-management/files/bulk-download`,
    data: formData,
    responseType: 'blob',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// --------------------------
// Export
// --------------------------

export type ExportJobRequest = {
  export_type: 'trademark_list' | 'patent_list' | 'document_list' | 'full_package'
  date_from?: string
  date_to?: string
  ip_type?: string
  document_code?: string
  site_code?: string
  module_ids?: number[]
  include_files?: boolean
  include_metadata?: boolean
  format?: 'zip' | 'excel'
}

export type ExportJobResponse = {
  id: number
  job_code: string
  export_type: string
  status: 'processing' | 'completed' | 'failed'
  total_items?: number
  processed_items?: number
  file_name?: string | null
  download_url?: string | null
  expires_at?: string | null
  created_at: string
  completed_at?: string | null
}

export const createExportJob = async (payload: ExportJobRequest): Promise<ExportJobResponse> => {
  return await apiClient<ExportJobResponse>({
    method: 'POST',
    url: `/v1/file-management/export`,
    data: payload,
  })
}

export type ExportStatusResponse = {
  job_id: number
  status: 'processing' | 'completed' | 'failed'
  progress: number
  download_url?: string
  expires_at?: string
}

export const getExportStatus = async (jobId: number): Promise<ExportStatusResponse> => {
  return await apiClient<ExportStatusResponse>({
    method: 'GET',
    url: `/v1/file-management/export/${jobId}/status`,
  })
}

// --------------------------
// Search
// --------------------------

export type ApplicationSearchResult = {
  application_number: string
  normalized_application_number?: string
  module_type: 'trademark' | 'patent' | 'industrial_design' | 'utility_solution'
  module_id: number
  module_name: string
  company_id: number
  company_name: string
  company_short_name: string
  // Keep backward compatibility fields
  application_id?: number
  application_type?: string
  name?: string
  company?: {
    id: number
    name: string
    short_name: string
    address?: string
  }
  documents?: Array<{
    id: number
    display_name: string
    blob_path: string
    document_code: string
    created_at: string
  }>
  application_date?: string
  certificate_number?: string
  certificate_date?: string
  status?: string
  code?: string
}

export const searchByApplicationNumber = async (
  applicationNumber: string,
  ipTypes?: string[]
): Promise<ApplicationSearchResult[]> => {
  const params: Record<string, string> = {
    application_no: applicationNumber,
  }
  
  if (ipTypes && ipTypes.length > 0) {
    params.ip_types = ipTypes.join(',')
  }
  
  const data = await apiClient<any>({
    method: 'GET',
    url: `/v1/file-management/search/application-number`,
    params,
  })
  
  // Handle new response structure with results array
  if (data?.results && Array.isArray(data.results)) {
    return data.results.map((item: any) => {
      // Get first company name from company_names array
      const firstCompanyName = item.company_names && item.company_names.length > 0 
        ? item.company_names[0] 
        : ''
      
      return {
        application_number: item.ip_application_number || item.application_number || '',
        normalized_application_number: item.normalized || item.normalized_application_number,
        module_type: item.module_type,
        module_id: item.module_id,
        module_name: item.ip_name || item.module_name || '',
        company_id: item.company_id,
        company_name: firstCompanyName,
        company_short_name: firstCompanyName, // Use first company name as short name
        // Backward compatibility
        application_id: item.module_id,
        application_type: item.module_type,
        name: item.ip_name || item.module_name || '',
        company: item.company_id ? {
          id: item.company_id,
          name: firstCompanyName,
          short_name: firstCompanyName,
        } : undefined,
      }
    })
  }
  
  // Handle old response structure (direct array)
  if (Array.isArray(data)) {
    return data.map((item: any) => {
      const firstCompanyName = item.company_names && item.company_names.length > 0 
        ? item.company_names[0] 
        : (item.company_name || '')
      
      return {
        application_number: item.application_number || item.ip_application_number || '',
        normalized_application_number: item.normalized_application_number || item.normalized,
        module_type: item.module_type,
        module_id: item.module_id,
        module_name: item.module_name || item.ip_name || '',
        company_id: item.company_id,
        company_name: firstCompanyName,
        company_short_name: item.company_short_name || firstCompanyName,
        application_id: item.module_id,
        application_type: item.module_type,
        name: item.module_name || item.ip_name || '',
        company: item.company_id ? {
          id: item.company_id,
          name: firstCompanyName,
          short_name: item.company_short_name || firstCompanyName,
        } : undefined,
      }
    })
  }
  
  return []
}

export type CompanySearchResult = {
  items: Array<{
    id: number
    name: string
    short_name: string
    tax_code?: string
    address?: string
    phone?: string
    email?: string
    datasource?: string
    is_active: boolean
    created_at: string
    updated_at: string
  }>
  total: number
  page: number
  page_size: number
  total_pages: number
}

export const searchCompanies = async (
  searchTerm: string,
  options?: { page?: number; pageSize?: number }
): Promise<CompanySearchResult> => {
  const params: Record<string, string> = {
    search: searchTerm,
    page: String(options?.page || 1),
    page_size: String(options?.pageSize || 20),
  }
  
  return await apiClient<CompanySearchResult>({
    method: 'GET',
    url: `/v1/organizations`,
    params,
  })
}

// --------------------------
// File Management Search
// --------------------------

export type FileSearchItem = {
  id: number
  display_name: string
  file_name: string
  blob_path: string
  file_size: number
  mime_type: string
  module_type?: string
  module_id?: number
  procedure_group?: string
  document_code?: string
  official_date?: string
  official_no?: string
  is_valid?: boolean
  created_at?: string
  created_by?: number
  matched_fields?: string[]
}

export type FolderSearchItem = {
  path: string
  name: string
  level: number
  file_count: number
  folder_count: number
  total_size: number
  total_size_mb: number
  matched_path: string
}

export type FileSearchResponse = {
  items: FileSearchItem[]
  total: number
  page: number
  page_size: number
  pages: number
}

export type FolderSearchResponse = {
  items: FolderSearchItem[]
  total: number
  page: number
  page_size: number
  pages: number
}

export type FileManagementSearchRequest = {
  query: string
  module_type?: string
  module_id?: number
  document_code?: string
  procedure_group?: string
  country_code?: string
  storage_scope?: string
  is_valid?: boolean
  date_from?: string
  date_to?: string
  search_in_files?: boolean
  search_in_folders?: boolean
  search_in_path?: boolean
  search_in_content?: boolean
  files_page?: number
  files_page_size?: number
  files_sort_by?: string
  files_sort_order?: "asc" | "desc"
  folders_page?: number
  folders_page_size?: number
  folders_sort_by?: string
  folders_sort_order?: "asc" | "desc"
}

export type FileManagementSearchResponse = {
  query: string
  files: FileSearchResponse
  folders: FolderSearchResponse
}

export const searchFiles = async (
  request: FileManagementSearchRequest
): Promise<FileManagementSearchResponse> => {
  return await apiClient<FileManagementSearchResponse>({
    method: 'POST',
    url: '/v1/file-management/search',
    data: request,
  })
}

