"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, Search, Trash2, Loader2, Settings2, ChevronDown, FolderDown, Settings, SquarePen, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdvancedSearchModal from "@/components/industrial-designs/search/advanced-search-modal";
import CustomFieldsModal from "@/components/common/CustomFieldsModal";
import AddCustomFieldValueModal from "@/components/industrial-designs/AddCustomFieldValueModal";
import EditCustomFieldValueModal from "@/components/trademarks/EditCustomFieldValueModal";
import { FORMAT_DATE, initialSearchState } from "@/constants";
import { IndustrialDesignParams, industrialDesignsService } from "@/services/industrial-designs.service";
import { customFieldsService } from "@/services/custom-fields.service";
import { companyService } from "@/services/company.service";
import { useQuery } from "@tanstack/react-query";
import { queryClient, useMutation } from "@/lib/react-query";
import PaginationComponent from "@/components/common/Pagination";
import moment from "moment";
import DesignDetailModal from "@/components/industrial-designs/design-detail-modal";
import { FileDown } from "lucide-react";
import ImageShow from "@/components/common/image/image-show";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InternalProcessingStatusCell } from "@/components/common/InternalProcessingStatusCell";
import { IPExportDialog } from "@/components/common/IPExportDialog";

const initialAdvancedSearch = {
  ownerCountry: "",
  applicationCountry: "",
  publicationCountry: "",
  priorityCountry: "",
  // Phân loại
  niceClass: "",
  productCategory: "",
  designDomain: "",
  // Ngày (date ranges)
  applicationDateFrom: "",
  applicationDateTo: "",
  publicationDateFrom: "",
  publicationDateTo: "",
  certificateDateFrom: "",
  certificateDateTo: "",
  expiryDateFrom: "",
  expiryDateTo: "",
  // Tên người
  applicant: "",
  representative: "",
  // Số
  certificateNumber: "",
  applicationNumber: "",
  basicApplicationNumber: "",
  priorityNumber: "",
  // Mục khác
  designName: "",
  designType: "",
  goodsDescription: "",
  status: "",
  certificateStatus: "",
  recordType: "",
  hasCertificate: "",
}

const queryKey = "industrial-designs"

export default function IndustrialDesignsSearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"table" | "grid">("table");
  const [showCustomFieldsModal, setShowCustomFieldsModal] = useState(false);
  const [showAddCustomFieldValueModal, setShowAddCustomFieldValueModal] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [advancedFilters, setAdvancedFilters] = useState(initialAdvancedSearch);
  const [searchParams, setSearchParams] = useState<IndustrialDesignParams>(initialSearchState);
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [bulkUpdateField, setBulkUpdateField] = useState<number | null>(null);
  const [bulkUpdateValue, setBulkUpdateValue] = useState("");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showEditCustomFieldModal, setShowEditCustomFieldModal] = useState(false);
  const [editingCustomField, setEditingCustomField] = useState<{ field: any; item: any } | null>(null);

  const { data: customFieldsData } = useQuery({
    queryKey: ["custom-fields", "industrial_design"],
    queryFn: () => customFieldsService.getCustomFields({ ip_type: "industrial_design", is_active: true, limit: 100 }),
  });
  
  const activeCustomFields = customFieldsData?.items || [];

  const updateCustomFieldMutation = useMutation({
    mutationFn: (data: { custom_field_id: number; application_numbers: string[]; value: string | null }) =>
      customFieldsService.updateCustomFieldValues({
        ip_type: "industrial_design",
        ...data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industrial-designs"] });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (data: { custom_field_id: number; application_numbers: string[]; value: string | null }) =>
      customFieldsService.updateCustomFieldValues({
        ip_type: "industrial_design",
        ...data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industrial-designs"] });
      setShowBulkUpdateModal(false);
      setBulkUpdateField(null);
      setBulkUpdateValue("");
    },
  });

  const addCustomFieldValueMutation = useMutation({
    mutationFn: (data: { custom_field_id: number; application_numbers: string[]; value: string }) =>
      customFieldsService.updateCustomFieldValues({
        ip_type: "industrial_design",
        custom_field_id: data.custom_field_id,
        application_numbers: data.application_numbers,
        value: data.value,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industrial-designs"] });
      setShowAddCustomFieldValueModal(false);
    },
  });

  const handleBulkUpdate = () => {
    if (bulkUpdateField) {
      bulkUpdateMutation.mutate({
        custom_field_id: bulkUpdateField,
        application_numbers: [],
        value: bulkUpdateValue || null
      });
    }
  };

  const {
    data: industrialDesignsData,
    isLoading,
    refetch: refetchDesigns,
  } = useQuery({
    queryFn: async () => await industrialDesignsService.get(searchParams),
    queryKey: ["industrial-designs", searchParams],
    enabled: true,
    staleTime: 5000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
  useEffect(() => {
    refetchDesigns();
  }, [searchParams, refetchDesigns]);

  const companyMap = {};

  const handleSearch = async () => {
    setSearchParams({
      ...initialSearchState,
      search: searchQuery
    });
    setActiveFilters({})
    setAdvancedFilters(initialAdvancedSearch)
  };

  const handleSort = (field: string) => {
    let newSortOrder: 'asc' | 'desc' = 'asc';
    if (searchParams.sort_by === field) {
      newSortOrder = searchParams.sort_order === 'asc' ? 'desc' : 'asc';
    }
    setSearchParams(prev => ({
      ...prev,
      sort_by: field,
      sort_order: newSortOrder
    }));
  };

  const handleExportAllIndustrialDesigns = async () => {
    setIsExporting(true);
    try {
      const baseParams = {
        ...searchParams,
        page: 1,
        page_size: 500,
      };

      const firstPage = await industrialDesignsService.get(baseParams);
      const totalPagesRaw =
        firstPage?.total_pages ??
        (firstPage?.total && baseParams.page_size
          ? Math.ceil(firstPage.total / baseParams.page_size)
          : 1);
      const totalPages = Math.min(totalPagesRaw || 1, 4);

      const allItems = [...(firstPage?.items || [])];

      for (let page = 2; page <= (totalPages || 1); page++) {
        const pageData = await industrialDesignsService.get({ ...baseParams, page });
        if (pageData?.items?.length) {
          allItems.push(...pageData.items);
        }
      }

      // Call API to export with images
      const response = await fetch('/api/export/industrial-designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items: allItems,
          customFields: activeCustomFields.map(field => ({
            id: field.id,
            alias_name: field.alias_name
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export industrial designs');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Kieu_dang_cong_nghiep_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export industrial designs to Excel", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAdvancedSearch = async () => {
    setSearchParams({
      ...initialSearchState,
      status: advancedFilters?.status || undefined,
      application_number: advancedFilters?.applicationNumber || undefined,
      country_code: advancedFilters?.applicationCountry || advancedFilters?.ownerCountry || undefined,
      certificate_number: advancedFilters?.certificateNumber || undefined,
      application_date_from: advancedFilters?.applicationDateFrom || undefined,
      application_date_to: advancedFilters?.applicationDateTo || undefined,
      certificate_date_from: advancedFilters?.certificateDateFrom || undefined,
      certificate_date_to: advancedFilters?.certificateDateTo || undefined,
      publicationDateFrom: advancedFilters?.publicationDateFrom || undefined,
      publicationDateTo: advancedFilters?.publicationDateTo || undefined,
      expiryDateFrom: advancedFilters?.expiryDateFrom || undefined,
      expiryDateTo: advancedFilters?.expiryDateTo || undefined,
      priorityCountry: advancedFilters?.priorityCountry || undefined,
      niceClass: advancedFilters?.niceClass || undefined,
      productCategory: advancedFilters?.productCategory || undefined,
      applicant: advancedFilters?.applicant || undefined,
      representative: advancedFilters?.representative || undefined,
      name: advancedFilters?.designName || undefined,
      basicApplicationNumber: advancedFilters?.basicApplicationNumber || undefined,
      hasCertificate: advancedFilters?.hasCertificate === "true" ? true : advancedFilters?.hasCertificate === "false" ? false : undefined,
    })
    setSearchQuery("")
    const newActiveFilters: Record<string, string> = {};

    if (advancedFilters.applicationNumber) {
      newActiveFilters["Số đơn"] = advancedFilters.applicationNumber;
    }

    if (advancedFilters.applicant) {
      newActiveFilters["Chủ đơn"] = advancedFilters.applicant;
    }

    if (advancedFilters.niceClass) {
      newActiveFilters["Phân loại Locarno"] = advancedFilters.niceClass;
    }

    if (advancedFilters.ownerCountry) {
      newActiveFilters["Nước"] = advancedFilters.ownerCountry;
    }

    if (advancedFilters.applicationCountry) {
      newActiveFilters["Nước nộp đơn"] = advancedFilters.applicationCountry;
    }

    if (advancedFilters.publicationCountry) {
      newActiveFilters["Nước công bố"] = advancedFilters.publicationCountry;
    }

    if (advancedFilters.priorityCountry) {
      newActiveFilters["Nước ưu tiên"] = advancedFilters.priorityCountry;
    }

    if (advancedFilters.productCategory) {
      newActiveFilters["Danh mục"] = advancedFilters.productCategory;
    }

    if (advancedFilters.designDomain) {
      newActiveFilters["Lĩnh vực thiết kế"] = advancedFilters.designDomain;
    }

    if (advancedFilters.applicationDateFrom || advancedFilters.applicationDateTo) {
      newActiveFilters["Ngày nộp"] = `${advancedFilters.applicationDateFrom || "..."} - ${advancedFilters.applicationDateTo || "..."}`;
    }

    if (advancedFilters.publicationDateFrom || advancedFilters.publicationDateTo) {
      newActiveFilters["Ngày công bố"] = `${advancedFilters.publicationDateFrom || "..."} - ${advancedFilters.publicationDateTo || "..."}`;
    }

    if (advancedFilters.certificateDateFrom || advancedFilters.certificateDateTo) {
      newActiveFilters["Ngày cấp"] = `${advancedFilters.certificateDateFrom || "..."} - ${advancedFilters.certificateDateTo || "..."}`;
    }

    if (advancedFilters.expiryDateFrom || advancedFilters.expiryDateTo) {
      newActiveFilters["Ngày hết hạn"] = `${advancedFilters.expiryDateFrom || "..."} - ${advancedFilters.expiryDateTo || "..."}`;
    }

    if (advancedFilters.representative) {
      newActiveFilters["Đại diện"] = advancedFilters.representative;
    }

    if (advancedFilters.certificateNumber) {
      newActiveFilters["Số bằng"] = advancedFilters.certificateNumber;
    }

    if (advancedFilters.basicApplicationNumber) {
      newActiveFilters["Số đơn gốc"] = advancedFilters.basicApplicationNumber;
    }

    if (advancedFilters.priorityNumber) {
      newActiveFilters["Số ưu tiên"] = advancedFilters.priorityNumber;
    }

    if (advancedFilters.designName) {
      newActiveFilters["Tên thiết kế"] = advancedFilters.designName;
    }

    if (advancedFilters.designType) {
      newActiveFilters["Loại thiết kế"] = advancedFilters.designType;
    }

    if (advancedFilters.goodsDescription) {
      newActiveFilters["Mô tả sản phẩm"] = advancedFilters.goodsDescription;
    }

    if (advancedFilters.certificateStatus) {
      newActiveFilters["Trạng thái chứng chỉ"] = advancedFilters.certificateStatus;
    }

    if (advancedFilters.recordType) {
      newActiveFilters["Loại bản ghi"] = advancedFilters.recordType;
    }

    if (advancedFilters.hasCertificate) {
      newActiveFilters["Trạng thái cấp bằng"] = advancedFilters.hasCertificate === "true" ? "Có" : advancedFilters.hasCertificate === "false" ? "Chưa" : "";
    }

    setActiveFilters(newActiveFilters);
    setShowAdvancedFilter(false);
  };

  const handleResetFilters = () => {
    setAdvancedFilters(initialAdvancedSearch);
    setActiveFilters({});
    setSearchParams(initialSearchState)
  };

  const removeFilter = async (key: string) => {
    const updatedFilters = { ...activeFilters };
    delete updatedFilters[key];
    setActiveFilters(updatedFilters);

    const newAdvancedFilters = { ...advancedFilters };

    switch(key) {
      case "Số đơn":
        newAdvancedFilters.applicationNumber = "";
        break;
      case "Số bằng":
        newAdvancedFilters.certificateNumber = "";
        break;
      case "Chủ đơn":
        newAdvancedFilters.applicant = "";
        break;
      case "Đại diện":
        newAdvancedFilters.representative = "";
        break;
      case "Phân loại Locarno":
        newAdvancedFilters.niceClass = "";
        break;
      case "Nước":
        newAdvancedFilters.ownerCountry = "";
        break;
      case "Nước nộp đơn":
        newAdvancedFilters.applicationCountry = "";
        break;
      case "Nước công bố":
        newAdvancedFilters.publicationCountry = "";
        break;
      case "Nước ưu tiên":
        newAdvancedFilters.priorityCountry = "";
        break;
      case "Danh mục":
        newAdvancedFilters.productCategory = "";
        break;
      case "Ngày nộp":
        newAdvancedFilters.applicationDateFrom = "";
        newAdvancedFilters.applicationDateTo = "";
        break;
      case "Ngày công bố":
        newAdvancedFilters.publicationDateFrom = "";
        newAdvancedFilters.publicationDateTo = "";
        break;
      case "Ngày cấp":
        newAdvancedFilters.certificateDateFrom = "";
        newAdvancedFilters.certificateDateTo = "";
        break;
      case "Ngày hết hạn":
        newAdvancedFilters.expiryDateFrom = "";
        newAdvancedFilters.expiryDateTo = "";
        break;
      case "Số đơn gốc":
        newAdvancedFilters.basicApplicationNumber = "";
        break;
      case "Số ưu tiên":
        newAdvancedFilters.priorityNumber = "";
        break;
      case "Tên thiết kế":
        newAdvancedFilters.designName = "";
        break;
    }

    setAdvancedFilters(newAdvancedFilters);

    // Rebuild search params from updated filters
    const newSearchParams: IndustrialDesignParams = {
      ...initialSearchState,
      status: newAdvancedFilters.status || undefined,
      application_number: newAdvancedFilters.applicationNumber || undefined,
      country_code: newAdvancedFilters.applicationCountry || newAdvancedFilters.ownerCountry || undefined,
      certificate_number: newAdvancedFilters.certificateNumber || undefined,
      application_date_from: newAdvancedFilters.applicationDateFrom || undefined,
      application_date_to: newAdvancedFilters.applicationDateTo || undefined,
      publicationDateFrom: newAdvancedFilters.publicationDateFrom || undefined,
      publicationDateTo: newAdvancedFilters.publicationDateTo || undefined,
      certificate_date_from: newAdvancedFilters.certificateDateFrom || undefined,
      certificate_date_to: newAdvancedFilters.certificateDateTo || undefined,
      expiryDateFrom: newAdvancedFilters.expiryDateFrom || undefined,
      expiryDateTo: newAdvancedFilters.expiryDateTo || undefined,
      priorityCountry: newAdvancedFilters.priorityCountry || undefined,
      niceClass: newAdvancedFilters.niceClass || undefined,
      productCategory: newAdvancedFilters.productCategory || undefined,
      applicant: newAdvancedFilters.applicant || undefined,
      representative: newAdvancedFilters.representative || undefined,
      name: newAdvancedFilters.designName || undefined,
      basicApplicationNumber: newAdvancedFilters.basicApplicationNumber || undefined,
    };

    setSearchParams(newSearchParams);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CẤP BẰNG":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "ĐANG XỬ LÝ":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "BỊ TỪ CHỐI":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      case "HẾT HẠN":
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
      default:
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Section */ }
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
          {/* Search Input */ }
          <div className="flex-1 flex items-center border rounded-lg px-4 py-2 gap-2">
            <Search className="w-5 h-5 text-gray-400 shrink-0"/>
            <input
              type="text"
              placeholder="Nhập tìm kiếm theo tên/số đơn"
              value={ searchQuery }
              onChange={ (e) => setSearchQuery(e.target.value) }
              onKeyDown={ (e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
            />
          </div>

          {/* Buttons */ }
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              size="sm"
              className="text-sm font-medium"
              disabled={isLoading}
              onClick={ handleSearch }
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang truy vấn...
                </span>
              ) : (
                "Truy vấn"
              )}
            </Button>
            <Button
              onClick={ () => setShowAdvancedFilter(true) }
              variant="outline"
              size="sm"
              className="text-sm font-medium flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              Nâng cao
            </Button>
          </div>
        </div>

        {/* Filters */ }
        {Object.keys(activeFilters).length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-3">
            { Object.entries(activeFilters).map(([key, value]) => (
              <Badge key={ key } variant="secondary" className="rounded-full text-xs sm:text-sm">
                <span className="truncate">{ key }:</span>
                <span className="ml-1 truncate">{ value }</span>
                <button
                  onClick={ () => removeFilter(key) }
                  className="ml-2 hover:text-red-600 flex-shrink-0"
                >
                  ×
                </button>
              </Badge>
            )) }
            <Button
              variant="ghost"
              size="sm"
              onClick={ handleResetFilters }
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 text-xs sm:text-sm"
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>

      {/* Controls */ }
      <div className="flex flex-col gap-2 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Tổng số: <span className="font-semibold">{(industrialDesignsData?.total ?? 0).toLocaleString()}</span> bản ghi
          </div>
        </div>
        <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l pt-2 sm:pt-0 sm:pl-2">
          <Button
                  variant="outline"
                  size="sm"
                  onClick={ handleExportAllIndustrialDesigns }
                  disabled={ isExporting }
                  className="text-xs sm:text-sm flex items-center gap-2"
                >
                  { isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  ) }
                  { isExporting ? "Đang xuất..." : "Xuất Excel" }
          </Button>
          <Button
                  variant="outline"
                  size="sm"
                  onClick={ () => setShowExportDialog(true) }
                  className="text-xs sm:text-sm flex items-center gap-2"
                >
                  <FolderDown className="w-4 h-4" />
                  Xuất Files
          </Button>
          <Select
            value={searchParams.sort_by && searchParams.sort_order ? `${searchParams.sort_by}-${searchParams.sort_order}` : ''}
            onValueChange={(value) => {
              if (value) {
                const [field, order] = value.split('-');
                setSearchParams(prev => ({
                  ...prev,
                  sort_by: field,
                  sort_order: order as 'asc' | 'desc'
                }));
              } else {
                setSearchParams(prev => ({ ...prev, sort_by: undefined, sort_order: undefined }));
              }
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="application_date-asc">Ngày nộp đơn: Cũ → Mới</SelectItem>
              <SelectItem value="application_date-desc">Ngày nộp đơn: Mới → Cũ</SelectItem>
              <SelectItem value="certificate_date-asc">Ngày cấp bằng: Cũ → Mới</SelectItem>
              <SelectItem value="certificate_date-desc">Ngày cấp bằng: Mới → Cũ</SelectItem>
              <SelectItem value="name-asc">Tên: A → Z</SelectItem>
              <SelectItem value="name-desc">Tên: Z → A</SelectItem>
            </SelectContent>
          </Select>
          <button
                  onClick={ () => setViewType("table") }
                  className={ `p-2 rounded flex-shrink-0 ${
                    viewType === "table"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-600"
                      : "hover:bg-gray-100 dark:hover:bg-zinc-800"
                  }` }
                  title="Table view"
                >
                  <List className="w-4 h-4"/>
          </button>
          <button
                  onClick={ () => setViewType("grid") }
                  className={ `p-2 rounded flex-shrink-0 ${
                    viewType === "grid"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-600"
                      : "hover:bg-gray-100 dark:hover:bg-zinc-800"
                  }` }
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4"/>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded flex-shrink-0 hover:bg-gray-100 dark:hover:bg-zinc-800"
                title="Trường nội bộ"
              >
                <Settings className="w-4 h-4 cursor-pointer"/>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowCustomFieldsModal(true)}>
                Trường nội bộ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowAddCustomFieldValueModal(true)}>
                Thêm giá trị trường nội bộ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results Table */ }
      <div>
          { viewType === "table" ? (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-100 dark:bg-zinc-800">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold text-center"></TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">HÌNH ẢNH</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">TÊN</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">SỐ ĐƠN</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">NGÀY NỘP ĐƠN</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">NGÀY CÔNG BỐ</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">SỐ BẰNG</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">NGÀY CẤP</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">CHỦ ĐƠN/CHỦ BẰNG</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">TRẠNG THÁI</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">TIẾN TRÌNH XỬ LÝ NỘI BỘ</TableHead>
                    {activeCustomFields.map((field) => (
                      <TableHead key={field.id} className="text-gray-700 dark:text-gray-200 font-semibold">
                        {field.alias_name.toUpperCase()}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={12 + activeCustomFields.length} className="h-40">
                        <div className="flex items-center justify-center gap-2 text-gray-500">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Đang tải dữ liệu...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : industrialDesignsData?.items?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12 + activeCustomFields.length} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <p className="text-lg font-semibold mb-1">Không tìm thấy kết quả</p>
                          <p className="text-sm">Vui lòng thử tìm kiếm với từ khóa khác</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    industrialDesignsData?.items?.map((item) => (
                    <TableRow 
                      key={ item.id } 
                      className="hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <TableCell className="text-center whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/search/industrial-designs/${item.id}`);
                          }}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell 
                        className="overflow-visible cursor-pointer"
                        onClick={() => {
                          setSelectedDesign(item);
                          setShowDetailModal(true);
                        }}
                      >
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedDesign(item);
                            setShowDetailModal(true);
                          }}
                        >
                          <ImageShow
                            src={item.image_urls?.[0] || ""} 
                            alt={item.name || "Industrial design image"} 
                            size="lg"
                          />
                        </div>
                      </TableCell>
                      <TableCell 
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedDesign(item);
                          setShowDetailModal(true);
                        }}
                      >
                        <div className="font-semibold line-clamp-2" title={item.name ?? "-"}>{ item.name ?? "-" }</div>
                      </TableCell>
                      <TableCell 
                        className="text-sm cursor-pointer"
                        onClick={() => {
                          setSelectedDesign(item);
                          setShowDetailModal(true);
                        }}
                      >
                        { item.application_number }
                      </TableCell>
                      <TableCell 
                        className="text-sm cursor-pointer"
                        onClick={() => {
                          setSelectedDesign(item);
                          setShowDetailModal(true);
                        }}
                      >
                        { item.application_date ? moment(item.application_date).format(FORMAT_DATE) : "-" }
                      </TableCell>
                      <TableCell 
                        className="text-sm cursor-pointer"
                        onClick={() => {
                          setSelectedDesign(item);
                          setShowDetailModal(true);
                        }}
                      >
                        { item.publication_date ? moment(item.publication_date).format(FORMAT_DATE) : "-" }
                      </TableCell>
                      <TableCell 
                        className="text-sm cursor-pointer"
                        onClick={() => {
                          setSelectedDesign(item);
                          setShowDetailModal(true);
                        }}
                      >
                        { item.certificate_number || "-" }
                      </TableCell>
                      <TableCell 
                        className="text-sm cursor-pointer"
                        onClick={() => {
                          setSelectedDesign(item);
                          setShowDetailModal(true);
                        }}
                      >
                        { item.certificate_date ? moment(item.certificate_date).format(FORMAT_DATE) : "-" }
                      </TableCell>
                      <TableCell 
                        className="text-sm cursor-pointer"
                        onClick={() => {
                          setSelectedDesign(item);
                          setShowDetailModal(true);
                        }}
                      >
                          { item.owners?.[0]?.name || item.owner_name || "-" }
                      </TableCell>
                      <TableCell 
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedDesign(item);
                          setShowDetailModal(true);
                        }}
                      >
                        <StatusBadge 
                          status={item.wipo_status || (item.certificate_number ? "Cấp bằng" : "Đang giải quyết")}
                        />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {item.application_number ? (
                          <InternalProcessingStatusCell
                            ipType="industrial_design"
                            applicationNumber={item.application_number}
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      {activeCustomFields.map((field) => (
                        <TableCell 
                          key={field.id} 
                          className="text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="max-w-[120px] truncate" 
                              title={(item as any).custom_fields?.[field.alias_name] || "-"}
                            >
                              {(item as any).custom_fields?.[field.alias_name] || "-"}
                            </div>
                            <button
                              onClick={() => {
                                setEditingCustomField({ field, item });
                                setShowEditCustomFieldModal(true);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded transition-colors flex-shrink-0 cursor-pointer"
                              title="Chỉnh sửa giá trị"
                            >
                              <SquarePen className="w-3.5 h-3.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400" />
                            </button>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center h-40 text-gray-500 gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Đang tải dữ liệu...</span>
                </div>
              ) : industrialDesignsData?.items?.filter((item) => item.application_number).length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-500">
                  <p className="text-lg font-semibold mb-1">Không tìm thấy kết quả</p>
                  <p className="text-sm">Vui lòng thử tìm kiếm với từ khóa khác</p>
                </div>
              ) : (
                industrialDesignsData?.items?.map((item) => (
                <div
                  key={ item.id }
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-xs flex-1">{ item.name }</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                        onClick={() => {
                          router.push(`/search/industrial-designs/${item.id}`);
                        }}
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedDesign(item);
                          setShowDetailModal(true);
                        }}
                      >
                        <ImageShow
                          src={item.image_urls?.[0] || ""} 
                          alt={item.name || "Industrial design image"} 
                          size="xxxl"
                        />
                      </div>
                    </div>
                  </div>
                  <div 
                    className="space-y-1 text-sm text-muted-foreground cursor-pointer"
                    onClick={() => {
                      setSelectedDesign(item);
                      setShowDetailModal(true);
                    }}
                  >
                    <p>
                      <span className="font-medium">Số đơn:</span>{ " " }
                      { item.application_number ?? "-" }
                    </p>
                    <p>
                      <span className="font-medium">Chủ đơn:</span>{ " " }
                      { item.owners?.[0]?.name || item.owner_name || "-" }
                    </p>
                    <p>
                      <span className="font-medium">Ngày nộp:</span>{ " " }
                      { item.application_date ? moment(item.application_date).format(FORMAT_DATE) : "-" }
                    </p>
                    <p>
                      <span className="font-medium">Ngày cấp:</span>{ " " }
                      { item.certificate_date ? moment(item.certificate_date).format(FORMAT_DATE) : "-" }
                    </p>
                    <p>
                      <span className="font-medium">Phân loại Locarno:</span>{ " " }
                      { Array.isArray(item.locarno_list) ? item.locarno_list.join(", ") : item.locarno_list || "-"}
                    </p>
                    <p>
                      <span className="font-medium">Tác giả:</span>{ " " }
                      { item.authors_raw ? item.authors_raw.join(", ") : item.authors || "-" }
                    </p>
                    <p>
                      <span className="font-medium">Trạng thái:</span>{ " " }
                      <StatusBadge 
                        status={item.wipo_status || (item.certificate_number ? "Cấp bằng" : "Đang giải quyết")}
                      />
                    </p>
                  </div>
                </div>
              ))
              )}
            </div>
          ) }
          <div className="w-full h-full mt-4">
            <PaginationComponent 
              page={searchParams.page}
              totalPages={Math.ceil((industrialDesignsData?.total ?? 0) / searchParams.page_size)}
              total={industrialDesignsData?.total ?? 0}
              onPageChange={(val) => setSearchParams((prev) => ({ ...prev, page: val }))}
              pageSize={searchParams.page_size}
              onPageSizeChange={(size) => setSearchParams((prev) => ({
                ...prev,
                page_size: size,
                page: 1
              }))}
            />
          </div>
      </div>

      {/* Advanced Filter Modal */ }
      <AdvancedSearchModal
        open={ showAdvancedFilter }
        onOpenChange={ setShowAdvancedFilter }
        advancedFilters={ advancedFilters }
        onFiltersChange={ setAdvancedFilters }
        onSearch={ handleAdvancedSearch }
        onReset={ handleResetFilters }
      />

      {/* Detail Modal */}
      <DesignDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        design={selectedDesign}
        companyMap={companyMap}
        selectedCustomFields={activeCustomFields.map(f => f.alias_name)}
      />

      <CustomFieldsModal
        open={showCustomFieldsModal}
        onOpenChange={setShowCustomFieldsModal}
        ipType="industrial_design"
      />

      <IPExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        ipType="industrial_design"
        searchParams={searchParams}
      />

      <AddCustomFieldValueModal
        open={showAddCustomFieldValueModal}
        onOpenChange={setShowAddCustomFieldValueModal}
        customFields={activeCustomFields}
        onSubmit={async (data) => {
          await addCustomFieldValueMutation.mutateAsync(data);
        }}
      />

      <EditCustomFieldValueModal
        open={showEditCustomFieldModal}
        onOpenChange={(open) => {
          setShowEditCustomFieldModal(open);
          if (!open) {
            setEditingCustomField(null);
          }
        }}
        customField={editingCustomField?.field || null}
        currentValue={(editingCustomField?.item as any)?.custom_fields?.[editingCustomField?.field?.alias_name] || null}
        applicationNumber={editingCustomField?.item?.application_number || ""}
        onUpdate={async (data) => {
          await updateCustomFieldMutation.mutateAsync(data);
          setShowEditCustomFieldModal(false);
          setEditingCustomField(null);
        }}
        isUpdating={updateCustomFieldMutation.isPending}
      />

      <Dialog open={showBulkUpdateModal} onOpenChange={setShowBulkUpdateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cập nhật Trường nội bộ hàng loạt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Chọn Trường nội bộ
              </label>
              <Select
                value={bulkUpdateField?.toString()}
                onValueChange={(value) => setBulkUpdateField(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn field..." />
                </SelectTrigger>
                <SelectContent>
                  {activeCustomFields.map((field) => (
                    <SelectItem key={field.id} value={field.id.toString()}>
                      {field.alias_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Giá trị mới
              </label>
              <Input
                value={bulkUpdateValue}
                onChange={(e) => setBulkUpdateValue(e.target.value)}
                placeholder="Nhập giá trị..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkUpdateModal(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleBulkUpdate}
              disabled={!bulkUpdateField || bulkUpdateMutation.isPending}
            >
              {bulkUpdateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                'Cập nhật'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
