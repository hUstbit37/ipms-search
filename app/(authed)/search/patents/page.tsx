"use client";

import { useState } from "react";
import { LayoutGrid, List, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import AdvancedSearchModal from "@/components/patents/search/advanced-search-modal";
import { useQuery } from "@tanstack/react-query";
import { PatentParams, patentService } from "@/services/patent.service";
import { DEFAULT_PAGINATION, FORMAT_DATE, initialSearchState } from "@/constants";
import { queryClient } from "@/lib/react-query";
import { Pagination } from "@/components/ui/pagination";
import moment from "moment";
import { Tooltip } from "@/components/ui/tooltip";

const initialAdvancedSearch = {
  applicationNumber: "",
  applicant: "",
  name: "",
  ipcClassification: "",
  applicationDate: "",
  publicationDate: "",
  certificateDate: "",
  certificateNumber: "",
  expiryDate: "",
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

  const {
    data: patentsData
  } = useQuery({
    queryFn: async () => await patentService.get(searchParams),
    queryKey: ["patents", { searchParams }],
  })

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

  const handleAdvancedSearch = async () => {
    setSearchParams({
      ...initialSearchState,
      status: advancedFilters?.status && advancedFilters.status ? advancedFilters.status : undefined,
      application_number: advancedFilters?.applicationNumber ?? advancedFilters.applicationNumber ? advancedFilters.applicationNumber : undefined,
      country_code: advancedFilters?.countryCode && advancedFilters.countryCode ? advancedFilters?.countryCode : undefined,
      certificate_number: advancedFilters?.certificateNumber && advancedFilters.certificateNumber ? advancedFilters.certificateNumber : undefined,
      application_date_from: advancedFilters?.applicationDate && advancedFilters.applicationDate ? advancedFilters?.applicationDate : undefined,
      certificate_date_from: advancedFilters?.certificateDate ? advancedFilters.certificateDate : undefined,
    })
    setSearchQuery("")

    const newActiveFilters: Record<string, string> = {};

    if (advancedFilters.applicationNumber) {
      newActiveFilters["Số đơn"] = advancedFilters.applicationNumber;
    }

    if (advancedFilters.applicant) {
      newActiveFilters["Người đơn"] = advancedFilters.applicant;
    }

    if (advancedFilters.name) {
      newActiveFilters["Tên sáng chế"] = advancedFilters.name;
    }

    if (advancedFilters.ipcClassification) {
      newActiveFilters["Phân loại IPC"] = advancedFilters.ipcClassification;
    }

    if (advancedFilters.countryCode) {
      newActiveFilters["Quốc gia"] = advancedFilters.countryCode;
    }

    if (advancedFilters.applicationDate) {
      newActiveFilters["Ngày đơn"] = advancedFilters.applicationDate;
    }

    if (advancedFilters.publicationDate) {
      newActiveFilters["Ngày công bố"] = advancedFilters.publicationDate;
    }

    if (advancedFilters.certificateDate) {
      newActiveFilters["Ngày cấp"] = advancedFilters.certificateDate;
    }

    if (advancedFilters.expiryDate) {
      newActiveFilters["Ngày hết hạn"] = advancedFilters.expiryDate;
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
      name: "",
      ipcClassification: "",
      applicationDate: "",
      publicationDate: "",
      certificateDate: "",
      certificateNumber: "",
      expiryDate: "",
      countryCode: "",
      status: "",
    });
    setActiveFilters({});
    setSearchParams(initialSearchState)
  };

  const removeFilter = (key: string) => {
    const updatedFilters = { ...activeFilters };
    delete updatedFilters[key];
    setActiveFilters(updatedFilters);
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
    <div className="flex-1">
      {/* Search Section */ }
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 px-4 py-3">
        <div className="container mx-auto">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
            {/* Search Input */ }
            <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2 gap-2">
              <Search className="w-5 h-5 text-gray-400 shrink-0"/>
              <input
                type="text"
                placeholder="Nhập tìm kiếm..."
                value={ searchQuery }
                onChange={ (e) => setSearchQuery(e.target.value) }
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
              />
            </div>

            {/* Buttons */ }
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-blue-600 border-white hover:bg-blue-50 text-sm font-medium"
                onClick={ handleSearch }
              >
                Tìm kiếm
              </Button>
              <Button
                onClick={ () => setShowAdvancedFilter(true) }
                variant="outline"
                size="sm"
                className="bg-white text-blue-600 border-white hover:bg-blue-50 text-sm font-medium"
              >
                Tìm kiếm nâng cao
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */ }
      <div className="bg-gray-50 dark:bg-zinc-900 border-b px-4 py-2">
        <div className="container mx-auto">
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
                  onClick={ () => {
                    setActiveFilters({});
                  } }
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
                <select className="text-xs sm:text-sm bg-transparent border rounded px-2 py-1">
                  <option>Ngày đơn đăng ký</option>
                  <option>Ngày cấp bằng</option>
                  <option>Tiêu đề</option>
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
      </div>

      {/* Results Table */ }
      <div className="px-4 py-2">
        <div className="container mx-auto">
          { viewType === "table" ? (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-blue-700 dark:bg-blue-900">
                  <TableRow>
                    <TableHead className="text-white">HÌNH ẢNH</TableHead>
                    <TableHead className="text-white">TÊN SÁNG CHẾ</TableHead>
                    <TableHead className="text-white">SỐ ĐƠN</TableHead>
                    <TableHead className="text-white">NGÀY NỘP ĐƠN</TableHead>
                    <TableHead className="text-white">NGÀY CÔNG BỐ</TableHead>
                    <TableHead className="text-white">SỐ BẰNG</TableHead>
                    <TableHead className="text-white">NGÀY CẤP</TableHead>
                    <TableHead className="text-white">CHỦ ĐƠN</TableHead>
                    <TableHead className="text-white">PHÂN LOẠI IPC</TableHead>
                    <TableHead className="text-white">TRẠNG THÁI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  { patentsData?.items?.filter((item) => item.application_number).map((item) => (
                    <TableRow key={ item.id }>
                      <TableCell>
                        <div
                          className="w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-400 rounded flex items-center justify-center text-sm font-bold text-white shadow-sm">
                          { item?.name ? item.name?.charAt(0) : "-" }
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <Tooltip content={item.name ?? "-"}>
                          <div className="font-semibold max-w-[350px] text-ellipsis overflow-hidden ">{ item.name ?? "-" }</div>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-sm">
                        { item.application_number ?? "-" }
                      </TableCell>
                      <TableCell className="text-sm">
                        { item.application_date ? moment(item.application_date).format(FORMAT_DATE) : "-" }
                      </TableCell>
                      <TableCell className="text-sm">
                        { "-" }
                      </TableCell>
                      <TableCell className="text-sm">
                        { item.certificate_number || "-" }
                      </TableCell>
                      <TableCell className="text-sm">
                        { item.certificate_date ? moment(item.certificate_date).format(FORMAT_DATE) : "-" }
                      </TableCell>
                      <TableCell className="text-sm">
                        { "-" }
                      </TableCell>
                      <TableCell className="text-sm">
                        { "-" }
                      </TableCell>
                      <TableCell>
                        {
                          item.status ? (
                          <span className={ `text-xs px-2 py-1 rounded ${ getStatusColor(item.status) }` }>
                          { item.status }
                          </span>
                          ) : (
                          <span className={ `text-xs px-2 py-1 rounded ${ getStatusColor(item.certificate_number ? "CẤP BẰNG" : "ĐANG XỬ LÝ") }` }>
                            { item.certificate_number ? "Cấp bằng" : "Đang giải quyết" }
                          </span>
                          )
                        }
                      </TableCell>
                    </TableRow>
                  )) }
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              { patentsData?.items?.filter((item) => item.application_number).map((item) => (
                <div
                  key={ item.id }
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm flex-1">{ item.name }</h3>
                    {
                      item.status ? (
                        <span
                          className={ `text-xs px-2 py-1 rounded whitespace-nowrap ml-2 ${ getStatusColor(item.status) }` }>
                          { item.status }
                        </span>
                      ) : "-"
                    }
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{ item.application_number ?? "-" }</p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>
                      <span className="font-medium">Người đơn:</span>{ " " }
                      { "-" }
                    </p>
                    <p>
                      <span className="font-medium">Ngày nộp:</span>{ " " }
                      { item.application_date ? moment(item.application_date).format(FORMAT_DATE) : "-" }
                    </p>
                    <p>
                      <span className="font-medium">Ngày công bố:</span>{ " " }
                      { "-" }
                    </p>
                    <p>
                      <span className="font-medium">Số bằng:</span>{ " " }
                      { item.certificate_number || "-" }
                    </p>
                    <p>
                      <span className="font-medium">IPC:</span>{ " " }
                      { "-" }
                    </p>
                  </div>
                </div>
              )) }
            </div>
          ) }
          <div className="w-full h-full">
            <Pagination totalItems={ patentsData?.total ?? 1 } itemsPerPage={ searchParams.page_size }
                        currentPage={ searchParams.page }
                        onPageChange={ (val) => setSearchParams((prev) => ({ ...prev, page: val })) }/>
          </div>
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
    </div>
  );
}
