"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, List, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import AdvancedSearchModal from "@/components/patents/search/advanced-search-modal";
import { useQuery } from "@tanstack/react-query";
import { PatentParams, patentService } from "@/services/patent.service";
import { companyService } from "@/services/company.service";
import { DEFAULT_PAGINATION, FORMAT_DATE, initialSearchState } from "@/constants";
import { queryClient } from "@/lib/react-query";
import PaginationComponent from "@/components/common/Pagination";
import moment from "moment";
import { Tooltip } from "@/components/ui/tooltip";
import PatentDetailModal from "@/components/patents/patent-detail-modal";
import { FileDown } from "lucide-react";
import { exportPatentsToExcel } from "@/utils/excel-export";

const initialAdvancedSearch = {
  applicationNumber: "",
  applicant: "",
  representative: "",
  name: "",
  niceClass: "",
  applicationDateFrom: "",
  applicationDateTo: "",
  publicationDateFrom: "",
  publicationDateTo: "",
  certificateDateFrom: "",
  certificateDateTo: "",
  certificateNumber: "",
  expiryDateFrom: "",
  expiryDateTo: "",
  applicationCountry: "",
  publicationCountry: "",
  priorityCountry: "",
  countryCode: "",
  status: "",
}

export default function PatentsSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"table" | "grid">("table");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [advancedFilters, setAdvancedFilters] = useState(initialAdvancedSearch);
  const [searchParams, setSearchParams] = useState<PatentParams>(initialSearchState);
  const [selectedPatent, setSelectedPatent] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [sortTrigger, setSortTrigger] = useState(0);

  const {
    data: patentsData,
    isLoading: isPatentsLoading,
    refetch: refetchPatents,
  } = useQuery({
    queryFn: async () => await patentService.get(searchParams),
    queryKey: ["patents", sortTrigger],
    enabled: true,
  })

  useEffect(() => {
    refetchPatents();
  }, [searchParams, refetchPatents]);

  // const {
  //   data: companiesData,
  // } = useQuery({
  //   queryFn: async () => await companyService.getAll({ limit: 500, datasource: "ALL" }),
  //   queryKey: ["companies"],
  // })

  // Create a map for quick company lookup
  // const companyMap = companiesData?.data?.items?.reduce((acc, company) => {
  //   acc[company.id] = company.name;
  //   return acc;
  // }, {} as Record<string, string>) || {};

  const companyMap = {};
  
  console.log(patentsData);
  

  const handleSearch = async () => {
    setSearchParams({
      ...initialSearchState,
      search: searchQuery
    });
    setActiveFilters({})
    setAdvancedFilters(initialAdvancedSearch)
    await queryClient.invalidateQueries({
      queryKey: ["patents", { searchParams }]
    })
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

  const handleAdvancedSearch = async () => {
    setSearchParams({
      ...initialSearchState,
      status: advancedFilters?.status || undefined,
      application_number: advancedFilters?.applicationNumber || undefined,
      country_code: advancedFilters?.countryCode || undefined,
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
      application_country: advancedFilters?.applicationCountry || undefined,
      publication_country: advancedFilters?.publicationCountry || undefined,
      niceClass: advancedFilters?.niceClass || undefined,
      applicant: advancedFilters?.applicant || undefined,
      representative: advancedFilters?.representative || undefined,
      name: advancedFilters?.name || undefined,
    })
    setSearchQuery("")

    const newActiveFilters: Record<string, string> = {};

    if (advancedFilters.applicationNumber) {
      newActiveFilters["Số đơn"] = advancedFilters.applicationNumber;
    }

    if (advancedFilters.certificateNumber) {
      newActiveFilters["Số bằng"] = advancedFilters.certificateNumber;
    }

    if (advancedFilters.applicant) {
      newActiveFilters["Chủ đơn"] = advancedFilters.applicant;
    }

    if (advancedFilters.representative) {
      newActiveFilters["Đại diện SHCN"] = advancedFilters.representative;
    }

    if (advancedFilters.name) {
      newActiveFilters["Tên sáng chế"] = advancedFilters.name;
    }

    if (advancedFilters.niceClass) {
      newActiveFilters["Phân loại IPC"] = advancedFilters.niceClass;
    }

    if (advancedFilters.countryCode) {
      newActiveFilters["Quốc gia"] = advancedFilters.countryCode;
    }

    if (advancedFilters.applicationCountry) {
      newActiveFilters["Mã nước nộp đơn"] = advancedFilters.applicationCountry;
    }

    if (advancedFilters.publicationCountry) {
      newActiveFilters["Mã nước công bố"] = advancedFilters.publicationCountry;
    }

    if (advancedFilters.priorityCountry) {
      newActiveFilters["Mã nước ưu tiên"] = advancedFilters.priorityCountry;
    }

    if (advancedFilters.applicationDateFrom || advancedFilters.applicationDateTo) {
      newActiveFilters["Ngày nộp đơn"] = `${advancedFilters.applicationDateFrom || ''} - ${advancedFilters.applicationDateTo || ''}`;
    }

    if (advancedFilters.publicationDateFrom || advancedFilters.publicationDateTo) {
      newActiveFilters["Ngày công bố"] = `${advancedFilters.publicationDateFrom || ''} - ${advancedFilters.publicationDateTo || ''}`;
    }

    if (advancedFilters.certificateDateFrom || advancedFilters.certificateDateTo) {
      newActiveFilters["Ngày cấp"] = `${advancedFilters.certificateDateFrom || ''} - ${advancedFilters.certificateDateTo || ''}`;
    }

    if (advancedFilters.expiryDateFrom || advancedFilters.expiryDateTo) {
      newActiveFilters["Ngày hết hạn"] = `${advancedFilters.expiryDateFrom || ''} - ${advancedFilters.expiryDateTo || ''}`;
    }

    if (advancedFilters.status) {
      newActiveFilters["Trạng thái"] = advancedFilters.status;
    }

    setActiveFilters(newActiveFilters);
    setShowAdvancedFilter(false);
    await queryClient.invalidateQueries({
      queryKey: ["patents", { searchParams }]
    })
  };

  const handleResetFilters = () => {
    setAdvancedFilters({
      applicationNumber: "",
      applicant: "",
      representative: "",
      name: "",
      niceClass: "",
      applicationDateFrom: "",
      applicationDateTo: "",
      publicationDateFrom: "",
      publicationDateTo: "",
      certificateDateFrom: "",
      certificateDateTo: "",
      certificateNumber: "",
      expiryDateFrom: "",
      expiryDateTo: "",
      applicationCountry: "",
      publicationCountry: "",
      priorityCountry: "",
      countryCode: "",
      status: "",
    });
    setActiveFilters({});
    setSearchParams(initialSearchState)
  };

  const removeFilter = async (key: string) => {
    // Remove from active filters display
    const updatedFilters = { ...activeFilters };
    delete updatedFilters[key];
    setActiveFilters(updatedFilters);

    // Clear corresponding advanced filter fields
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
      case "Đại diện SHCN":
        newAdvancedFilters.representative = "";
        break;
      case "Tên sáng chế":
        newAdvancedFilters.name = "";
        break;
      case "Phân loại IPC":
        newAdvancedFilters.niceClass = "";
        break;
      case "Quốc gia":
        newAdvancedFilters.countryCode = "";
        break;
      case "Mã nước nộp đơn":
        newAdvancedFilters.applicationCountry = "";
        break;
      case "Mã nước công bố":
        newAdvancedFilters.publicationCountry = "";
        break;
      case "Mã nước ưu tiên":
        newAdvancedFilters.priorityCountry = "";
        break;
      case "Ngày nộp đơn":
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
      case "Trạng thái":
        newAdvancedFilters.status = "";
        break;
    }

    setAdvancedFilters(newAdvancedFilters);

    // Rebuild search params from updated filters
    const newSearchParams: PatentParams = {
      ...initialSearchState,
      status: newAdvancedFilters.status || undefined,
      application_number: newAdvancedFilters.applicationNumber || undefined,
      country_code: newAdvancedFilters.countryCode || undefined,
      certificate_number: newAdvancedFilters.certificateNumber || undefined,
      application_date_from: newAdvancedFilters.applicationDateFrom || undefined,
      application_date_to: newAdvancedFilters.applicationDateTo || undefined,
      publicationDateFrom: newAdvancedFilters.publicationDateFrom || undefined,
      publicationDateTo: newAdvancedFilters.publicationDateTo || undefined,
      certificate_date_from: newAdvancedFilters.certificateDateFrom || undefined,
      certificate_date_to: newAdvancedFilters.certificateDateTo || undefined,
      expiryDateFrom: newAdvancedFilters.expiryDateFrom || undefined,
      expiryDateTo: newAdvancedFilters.expiryDateTo || undefined,
      application_country: newAdvancedFilters.applicationCountry || undefined,
      publication_country: newAdvancedFilters.publicationCountry || undefined,
      priorityCountry: newAdvancedFilters.priorityCountry || undefined,
      niceClass: newAdvancedFilters.niceClass || undefined,
      applicant: newAdvancedFilters.applicant || undefined,
      representative: newAdvancedFilters.representative || undefined,
      name: newAdvancedFilters.name || undefined,
    };

    setSearchParams(newSearchParams);

    // Re-run search with updated params
    await queryClient.invalidateQueries({
      queryKey: ["patents", { searchParams: newSearchParams }]
    });
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
              placeholder="Nhập tìm kiếm theo tên sáng chế, số đơn, chủ đơn..."
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
              onClick={ handleSearch }
            >
              Tìm kiếm
            </Button>
            <Button
              onClick={ () => setShowAdvancedFilter(true) }
              variant="outline"
              size="sm"
              className="text-sm font-medium"
            >
              Tìm kiếm nâng cao
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Controls */ }
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Filters */ }
            <div className="flex items-center gap-2 flex-wrap">
              { Object.entries(activeFilters).map(([key, value]) => (
                <Badge key={ key } variant="secondary" className="rounded-full text-xs sm:text-sm">
                  <span className="truncate">{ key }:</span>
                  <span className="ml-1 truncate">{ value }</span>
                  <Button
                    onClick={ () => removeFilter(key) }
                    className="ml-2 hover:text-red-600 flex-shrink-0"
                  >
                    ×
                  </Button>
                </Badge>
              )) }
              { Object.keys(activeFilters).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={ handleResetFilters }
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 text-xs sm:text-sm"
                >
                  Xóa bộ lọc
                </Button>
              ) }
            </div>

            {/* Results Count and Controls */ }
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center">
              {/* View Toggle and Sort */ }
              <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l pt-2 sm:pt-0 sm:pl-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const currentPageData = patentsData?.data?.items?.filter((item) => item.application_number) || [];
                    await exportPatentsToExcel(currentPageData, companyMap);
                  }}
                  className="text-xs sm:text-sm flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Xuất Excel
                </Button>
                <select 
                  className="text-xs sm:text-sm bg-transparent border rounded px-2 py-1"
                  value={searchParams.sort_by && searchParams.sort_order ? `${searchParams.sort_by}-${searchParams.sort_order}` : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      const [field, order] = value.split('-');
                      setSearchParams(prev => ({
                        ...prev,
                        sort_by: field,
                        sort_order: order as 'asc' | 'desc'
                      }));
                      setSortTrigger(prev => prev + 1);
                    } else {
                      setSearchParams(prev => ({ ...prev, sort_by: undefined, sort_order: undefined }));
                      setSortTrigger(prev => prev + 1);
                    }
                  }}
                >
                  <option value="">Sắp xếp theo</option>
                  <option value="application_date-asc">Ngày đơn đăng ký: Cũ → Mới</option>
                  <option value="application_date-desc">Ngày đơn đăng ký: Mới → Cũ</option>
                  <option value="certificate_date-asc">Ngày cấp bằng: Cũ → Mới</option>
                  <option value="certificate_date-desc">Ngày cấp bằng: Mới → Cũ</option>
                  <option value="name-asc">Tiêu đề: A → Z</option>
                  <option value="name-desc">Tiêu đề: Z → A</option>
                </select>
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
              </div>
            </div>
          </div>
      </div>

      {/* Results Table */ }
      <div>
          { viewType === "table" ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader className="bg-gray-100 dark:bg-zinc-800">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">HÌNH ẢNH</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">TÊN SÁNG CHẾ</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">SỐ ĐƠN</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">NGÀY NỘP ĐƠN</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">NGÀY CÔNG BỐ</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">SỐ BẰNG</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">NGÀY CẤP</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">CHỦ ĐƠN</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">PHÂN LOẠI IPC</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">TRẠNG THÁI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPatentsLoading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell>
                          <Skeleton className="w-16 h-16 rounded" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-28" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : patentsData?.data?.items?.filter((item) => item.application_number).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <p className="text-lg font-semibold mb-1">Không tìm thấy kết quả</p>
                          <p className="text-sm">Vui lòng thử tìm kiếm với từ khóa khác</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    patentsData?.data?.items?.filter((item) => item.application_number).map((item) => (
                    <TableRow 
                      key={ item.id } 
                      className="hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedPatent(item);
                        setShowDetailModal(true);
                      }}
                    >
                      <TableCell>
                        <div className="w-16 h-16 rounded flex items-center justify-center shadow-sm">
                          {item?.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.name || "Patent image"} 
                            className="w-full h-full object-cover rounded"
                            loading="lazy"
                          />
                          ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400 rounded flex items-center justify-center text-sm font-bold text-white">
                            {item?.name ? item.name.charAt(0) : "-"}
                          </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="font-semibold line-clamp-2" title={item.name ?? "-"}>
                          { item.name ?? "-" }
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        { item.application_number ?? "-" }
                      </TableCell>
                      <TableCell className="text-sm">
                        { item.application_date ? moment(item.application_date).format(FORMAT_DATE) : "-" }
                      </TableCell>
                      <TableCell className="text-sm">
                        { item.publication_date ? moment(item.publication_date).format(FORMAT_DATE) : "-" }
                      </TableCell>
                      <TableCell className="text-sm">
                        { item.certificate_number || "-" }
                      </TableCell>
                      <TableCell className="text-sm">
                        { item.certificate_date ? moment(item.certificate_date).format(FORMAT_DATE) : "-" }
                      </TableCell>
                      <TableCell className="text-sm">
                          { item.owner_name || item.owner || "-" }
                      </TableCell>
                      <TableCell className="text-sm">
                        { item.ipc_list ? (Array.isArray(item.ipc_list) ? item.ipc_list.join(', ') : (item.ipc_list || '-')) : "-" }
                      </TableCell>
                      <TableCell>
                        {item.wipo_status ? (
                          <span className="text-xs px-2 py-1 rounded font-bold">
                            {item.wipo_status}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded font-bold">
                            {item.certificate_number ? "Cấp bằng" : "Đang giải quyết"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isPatentsLoading ? (
                // Loading skeleton for grid view
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`grid-skeleton-${index}`}
                    className="border rounded-lg p-4 bg-white dark:bg-zinc-900"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Skeleton className="h-5 w-32 flex-1" />
                      <Skeleton className="h-6 w-20 rounded ml-2" />
                    </div>
                    <Skeleton className="h-4 w-24 mb-3" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))
              ) : patentsData?.data?.items?.filter((item) => item.application_number).length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-500">
                  <p className="text-lg font-semibold mb-1">Không tìm thấy kết quả</p>
                  <p className="text-sm">Vui lòng thử tìm kiếm với từ khóa khác</p>
                </div>
              ) : (
                patentsData?.data?.items?.filter((item) => item.application_number).map((item) => (
                <div
                  key={ item.id }
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-xs flex-1">{ item.name }</h3>
                    <div className="w-16 h-16 rounded flex items-center justify-center shadow-sm ml-2 flex-shrink-0">
                      {item?.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name || "Patent image"} 
                          className="w-full h-full object-cover rounded"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400 rounded flex items-center justify-center text-sm font-bold text-white">
                          {item?.name ? item.name.charAt(0) : "-"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>
                      <span className="font-medium">Số đơn:</span>{ " " }
                      { item.application_number || "-" }
                    </p>
                    <p>
                      <span className="font-medium">Chủ đơn:</span>{ " " }
                      { item.owner_name || item.owner || "-" }
                    </p>
                    <p>
                      <span className="font-medium">Ngày nộp:</span>{ " " }
                      { item.application_date ? moment(item.application_date).format(FORMAT_DATE) : "-" }
                    </p>
                    <p>
                      <span className="font-medium">Ngày công bố:</span>{ " " }
                      { item.publication_date ? moment(item.publication_date).format(FORMAT_DATE) : "-" }
                    </p>
                    <p>
                      <span className="font-medium">Số bằng:</span>{ " " }
                      { item.certificate_number || "-" }
                    </p>
                    <p>
                      <span className="font-medium">IPC:</span>{ " " }
                      { item.ipc_list ? (Array.isArray(item.ipc_list) ? item.ipc_list.join(', ') : (item.ipc_list || '-')) : "-" }
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
              totalPages={Math.ceil((patentsData?.data?.total ?? 0) / searchParams.page_size)}
              total={patentsData?.data?.total ?? 0}
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
      <PatentDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        patent={selectedPatent}
        companyMap={companyMap}
      />
    </div>
  );
}
