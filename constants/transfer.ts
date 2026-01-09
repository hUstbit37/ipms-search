import { SelectOption } from "@/components/common/select/base-select";

// Transfer method options (Hình thức chuyển nhượng)
export const TRANSFER_METHODS: SelectOption[] = [
  { value: "HDCN", label: "Hợp đồng chuyển nhượng" },
  { value: "PL", label: "Phụ lục" },
];

// Transfer type options (Loại chuyển nhượng)
export const TRANSFER_TYPES: SelectOption[] = [
  { value: "FULL", label: "Toàn bộ" },
  { value: "PARTIAL", label: "Một phần" },
];

// Status options
export const TRANSFER_STATUS_OPTIONS: SelectOption[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Đã cấp bằng" },
  { value: "EXPIRED", label: "Hết hạn" },
  { value: "TERMINATED", label: "Chấm dứt" },
];

// Helper functions
export const getStatusBadgeVariant = (status: string | null) => {
  switch (status) {
    case "DRAFT":
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    case "PENDING":
      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
    case "ACTIVE":
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
    case "EXPIRED":
      return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
    case "TERMINATED":
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
  }
};

export const getStatusLabel = (status: string | null) => {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "PENDING":
      return "Pending";
    case "ACTIVE":
      return "Đã cấp bằng";
    case "EXPIRED":
      return "Hết hạn";
    case "TERMINATED":
      return "Chấm dứt";
    default:
      return status || "-";
  }
};

export const getTransferMethodLabel = (method: string | null) => {
  const option = TRANSFER_METHODS.find((opt) => opt.value === method);
  return option?.label || method || "-";
};

export const getTransferTypeLabel = (type: string | null) => {
  const option = TRANSFER_TYPES.find((opt) => opt.value === type);
  return option?.label || type || "-";
};

