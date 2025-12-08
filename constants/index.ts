export const DEFAULT_PAGINATION = {
  page: 1,
  per_page: 30,
}

export const FORMAT_DATE = "DD/MM/YYYY";

export const FORMAT_TIMESTAMP = "HH:mm:ss";

export const FORMAT_DATETIME = `${FORMAT_DATE} ${FORMAT_TIMESTAMP}`;

export const initialSearchState = {
  page: DEFAULT_PAGINATION.page,
  page_size: DEFAULT_PAGINATION.per_page,
  sort_order: "desc",
}
