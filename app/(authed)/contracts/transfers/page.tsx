"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Loader2, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SelectOption } from "@/components/common/select/base-select";
import { DateRange } from "react-day-picker";
import { transferService, TransferParams } from "@/services/transfer.service";
import { useAuth } from "@/providers/auth/AuthProvider";
import { initialSearchState } from "@/constants";
import PaginationComponent from "@/components/common/Pagination";
import moment from "moment";
import { FORMAT_DATE } from "@/constants";
import {
  TRANSFER_METHODS,
  TRANSFER_TYPES,
  TRANSFER_STATUS_OPTIONS,
  getStatusBadgeVariant,
  getStatusLabel,
  getTransferMethodLabel,
  getTransferTypeLabel,
} from "@/constants/transfer";
import { useAllCompanies } from "@/hooks/useCompanyQuery";
import {
  TransferAdvancedSearchModal,
  type TransferFilters,
} from "@/components/contracts/transfers/advanced-search-modal";

export default function TransfersPage() {
  const router = useRouter();
  const { authContext } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showChips, setShowChips] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useState<TransferParams>({
    ...initialSearchState,
    page: 1,
    page_size: initialSearchState.page_size,
  });

  // Get companies for site selects
  const { companies } = useAllCompanies();

  // Map companies to SelectOption format: short_name - name
  const companyOptions: SelectOption[] = companies.map((company) => ({
    value: company.id,
    label: `${company.short_name} - ${company.name}`,
  }));

  const getOptionLabel = (options: SelectOption[], value?: string | number | null) => {
    if (value === undefined || value === null) return undefined;
    const found = options.find((o) => String(o.value) === String(value));
    return found?.label;
  };

  const labelLang = {
    transfer_method: "Hình thức chuyển nhượng",
    transfer_type: "Loại chuyển nhượng",
    transferor_site_id: "Bên chuyển nhượng",
    transferee_site_id: "Bên nhận chuyển nhượng",
    goods_name: "Sản phẩm",
    nice_group: "Nhóm sản phẩm",
    status: "Trạng thái",
    sign_date: "Ngày ký",
  }

  // Filter states - using SelectOption for single-select fields
  const [filters, setFilters] = useState<TransferFilters>({
    transfer_method: null,
    transfer_type: null,
    transferor_site_id: null,
    transferee_site_id: null,
    goods_name: "",
    nice_group: "",
    status: null,
    sign_date: undefined,
  });

  // Các chip hiển thị dựa trên searchParams (tức là các điều kiện đã thực sự được áp dụng)
  const activeChips = (() => {
    const chips: { key: keyof TransferFilters | "search"; label: string; value: string }[] = [];

    if (searchParams.search) {
      chips.push({ key: "search", label: "Từ khóa", value: String(searchParams.search) });
    }

    if (searchParams.transfer_method) {
      chips.push({
        key: "transfer_method",
        label: labelLang.transfer_method,
        value: getTransferMethodLabel(searchParams.transfer_method as string),
      });
    }

    if (searchParams.transfer_type) {
      chips.push({
        key: "transfer_type",
        label: labelLang.transfer_type,
        value: getTransferTypeLabel(searchParams.transfer_type as string),
      });
    }

    if (searchParams.transferor_site_id) {
      chips.push({
        key: "transferor_site_id",
        label: labelLang.transferor_site_id,
        value:
          getOptionLabel(companyOptions, searchParams.transferor_site_id) ||
          String(searchParams.transferor_site_id),
      });
    }

    if (searchParams.transferee_site_id) {
      chips.push({
        key: "transferee_site_id",
        label: labelLang.transferee_site_id,
        value:
          getOptionLabel(companyOptions, searchParams.transferee_site_id) ||
          String(searchParams.transferee_site_id),
      });
    }

    if (searchParams.goods_name) {
      chips.push({
        key: "goods_name",
        label: labelLang.goods_name,
        value: String(searchParams.goods_name),
      });
    }

    if (searchParams.nice_group) {
      chips.push({
        key: "nice_group",
        label: labelLang.nice_group,
        value: String(searchParams.nice_group),
      });
    }

    if (searchParams.status) {
      chips.push({
        key: "status",
        label: labelLang.status,
        value: getStatusLabel(searchParams.status as string),
      });
    }

    if (searchParams.sign_date_from || searchParams.sign_date_to) {
      const from = searchParams.sign_date_from
        ? moment(searchParams.sign_date_from).format("DD/MM/YYYY")
        : "";
      const to = searchParams.sign_date_to
        ? moment(searchParams.sign_date_to).format("DD/MM/YYYY")
        : "";
      chips.push({
        key: "sign_date",
        label: labelLang.sign_date,
        value: `${from} - ${to}`.trim(),
      });
    }

    return chips;
  })();

  const {
    data: transfersData,
    isLoading: isTransfersLoading,
    isFetching: isTransfersFetching,
    refetch: refetchTransfers,
  } = useQuery({
    queryFn: async () => await transferService.search(searchParams),
    queryKey: ["transfers", searchParams],
    enabled: !!authContext?.token,
  });

  const isTransfersPending = isTransfersLoading || isTransfersFetching;

  const handleSearch = () => {
    setSearchParams((prev) => ({
      ...prev,
      search: searchQuery || undefined,
      page: 1,
    }));
    setShowChips(true);
  };

  const handleFilterChange = (
    key: keyof TransferFilters,
    value: SelectOption | null | DateRange | string | undefined
  ) => {
    setFilters((prev: TransferFilters) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = (currentFilters: TransferFilters = filters) => {
    // Convert DateRange to ISO date strings
    const signDateFrom = currentFilters.sign_date?.from
      ? moment(currentFilters.sign_date.from).format("YYYY-MM-DD")
      : undefined;
    const signDateTo = currentFilters.sign_date?.to
      ? moment(currentFilters.sign_date.to).format("YYYY-MM-DD")
      : undefined;

    setSearchParams((prev) => ({
      ...prev,
      transfer_method: (currentFilters.transfer_method?.value as string) || undefined,
      transfer_type: (currentFilters.transfer_type?.value as string) || undefined,
      transferor_site_id: (currentFilters.transferor_site_id?.value as number) || undefined,
      transferee_site_id: (currentFilters.transferee_site_id?.value as number) || undefined,
      goods_name: currentFilters.goods_name || undefined,
      nice_group: currentFilters.nice_group || undefined,
      status: (currentFilters.status?.value as string) || undefined,
      sign_date_from: signDateFrom,
      sign_date_to: signDateTo,
      page: 1,
    }));
    setShowChips(true);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    const cleared: TransferFilters = {
      transfer_method: null,
      transfer_type: null,
      transferor_site_id: null,
      transferee_site_id: null,
      goods_name: "",
      nice_group: "",
      status: null,
      sign_date: undefined,
    };
    setFilters(cleared);
    setSearchParams({
      ...initialSearchState,
      page: 1,
    });
    setShowChips(false);
  };

  const handleRemoveChip = (key: (typeof activeChips)[number]["key"]) => {
    if (key === "search") {
      setSearchQuery("");
      // Cập nhật lại searchParams để bỏ điều kiện search và trigger request mới
      setSearchParams((prev) => ({
        ...prev,
        search: undefined,
        page: 1,
      }));
      return;
    }

    const updated: TransferFilters = {
      ...filters,
      [key]:
        key === "sign_date"
          ? undefined
          : key === "goods_name" || key === "nice_group"
            ? ""
            : null,
    } as TransferFilters;
    setFilters(updated);

    // Đồng bộ lại searchParams theo key đã xóa để gọi lại API
    setSearchParams((prev) => {
      const next = { ...prev, page: 1 } as TransferParams;

      switch (key) {
        case "transfer_method":
          next.transfer_method = undefined;
          break;
        case "transfer_type":
          next.transfer_type = undefined;
          break;
        case "transferor_site_id":
          next.transferor_site_id = undefined;
          break;
        case "transferee_site_id":
          next.transferee_site_id = undefined;
          break;
        case "goods_name":
          next.goods_name = undefined;
          break;
        case "nice_group":
          next.nice_group = undefined;
          break;
        case "status":
          next.status = undefined;
          break;
        case "sign_date":
          next.sign_date_from = undefined;
          next.sign_date_to = undefined;
          break;
      }

      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(transfersData?.items?.map((item) => item.id) || []);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const handleDeleteTransfer = async (id: number) => {
    console.log("Deleting transfer id:", id, typeof id);
    if (typeof window !== "undefined") {
      const confirmDelete = window.confirm(
        "Bạn có chắc chắn muốn xóa chuyển nhượng này? Hành động này không thể hoàn tác.",
      );
      if (!confirmDelete) {
        return;
      }
    }

    try {
      setDeletingId(id);
      await transferService.deleteById(id);
      // Sau khi xóa thành công, refetch lại danh sách transfer
      await refetchTransfers();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-4 space-y-4">
        {/* Main Search Field */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center border rounded-lg gap-2 px-4">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo mã hợp đồng, số đơn, số bằng"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSearch}
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Truy vấn
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedModal(true)}
          >
            Truy vấn nâng cao
          </Button>
        </div>

        {/* Active Filters Chips */}
        {showChips && activeChips.length > 0 && (
          <div className="flex items-center flex-wrap gap-2">
            {activeChips.map((chip) => (
              <div
                key={`${chip.key}-${chip.value}`}
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-zinc-800 px-3 py-1 text-sm border border-gray-200 dark:border-zinc-700"
              >
                <span className="font-medium">{chip.label}:</span>
                <span className="text-gray-700 dark:text-gray-200">{chip.value}</span>
                <button
                  onClick={() => handleRemoveChip(chip.key)}
                  className="text-red-500 hover:text-red-600 text-lg leading-none"
                  aria-label={`Xóa ${chip.label}`}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                handleClearFilters();
                setShowAdvancedModal(false);
              }}
              className="text-red-600 hover:text-red-700 text-sm font-medium ml-1"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Advanced Search Modal */}
      <TransferAdvancedSearchModal
        open={showAdvancedModal}
        onOpenChange={setShowAdvancedModal}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={() => {
          handleApplyFilters();
          setShowAdvancedModal(false);
        }}
        onClear={handleClearFilters}
        labels={labelLang}
        companyOptions={companyOptions}
        transferMethods={TRANSFER_METHODS}
        transferTypes={TRANSFER_TYPES}
        statusOptions={TRANSFER_STATUS_OPTIONS}
      />

      {/* Table Section */}
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Tổng số: <span className="font-semibold">{(transfersData?.total ?? 0).toLocaleString()}</span> bản ghi
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => router.push("/contracts/transfers/create?step=1")}
          >
            <Plus className="w-4 h-4" />
            Thêm mới
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-zinc-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      transfersData?.items &&
                      transfersData.items.length > 0 &&
                      selectedRows.length === transfersData.items.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Mã hợp đồng
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Hình thức chuyển nhượng
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Loại chuyển nhượng
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Bên chuyển nhượng
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Bên nhận chuyển nhượng
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Trạng thái
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Ngày ký
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold text-right">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isTransfersPending ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-40">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : transfersData?.items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-16">
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <p className="text-lg font-semibold mb-1">Không tìm thấy bản ghi</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                transfersData?.items?.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.includes(item.id)}
                        onCheckedChange={(checked) =>
                          handleSelectRow(item.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.doc_number || "-"}
                    </TableCell>
                    <TableCell>{getTransferMethodLabel(item.transfer_method)}</TableCell>
                    <TableCell>{getTransferTypeLabel(item.transfer_type)}</TableCell>
                    <TableCell>{item.transferor_site_code || "-"}</TableCell>
                    <TableCell>{item.transferee_site_code || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusBadgeVariant(item.status)}
                      >
                        {getStatusLabel(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.sign_date
                        ? moment(item.sign_date).format(FORMAT_DATE)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/contracts/transfers/${item.id}/edit`)}
                          aria-label="Chỉnh sửa chuyển nhượng"
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTransfer(item.id)}
                          disabled={deletingId === item.id}
                          aria-label="Xóa chuyển nhượng"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {transfersData && transfersData.total > 0 && (
          <div className="mt-4">
            <PaginationComponent
              page={searchParams.page}
              totalPages={Math.ceil(transfersData.total / searchParams.page_size)}
              total={transfersData.total}
              onPageChange={(pageVal) =>
                setSearchParams((prev) => ({
                  ...prev,
                  page: pageVal,
                }))
              }
              pageSize={searchParams.page_size}
              onPageSizeChange={(size) =>
                setSearchParams((prev) => ({
                  ...prev,
                  page_size: size,
                  page: 1,
                }))
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
