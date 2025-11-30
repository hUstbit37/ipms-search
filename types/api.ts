export interface PaginationResponse<T> {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  items: T[];
}
