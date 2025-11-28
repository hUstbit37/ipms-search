// Types cho dữ liệu sở hữu trí tuệ

export type IPType = 'trademark' | 'patent' | 'design';

export interface IPRecord {
  id: string;
  type: IPType;
  registrationNumber: string;
  title: string;
  owner: string;
  filingDate: string;
  registrationDate?: string;
  status: string;
  description?: string;
  class?: string;
  images?: string[];
}

export interface SearchParams {
  query: string;
  type?: IPType;
  status?: string;
  owner?: string;
  registrationNumber?: string;
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  data: IPRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPTypeOption {
  value: IPType | '';
  label: string;
}

export interface StatusOption {
  value: string;
  label: string;
}
