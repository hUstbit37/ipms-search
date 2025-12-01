"use client";

import { useState } from "react";
import { LayoutGrid, List, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import AdvancedSearchModal from "@/components/industrial-designs/search/advanced-search-modal";
import { FORMAT_DATE, initialSearchState } from "@/constants";
import { IndustrialDesignParams, industrialDesignsService } from "@/services/industrial-designs.service";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { Pagination } from "@/components/ui/pagination";
import moment from "moment";

const initialAdvancedSearch = {
  ownerCountry: "",
  applicationCountry: "",
  publicationCountry: "",
  priorityCountry: "",
  // Phân loại
  locarnoClass: "",
  productCategory: "",
  designDomain: "",
  // Ngày (single date only)
  applicationDate: "",
  publicationDate: "",
  certificateDate: "",
  expiryDate: "",
  priorityDate: "",
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
}

const queryKey = "industrial-designs"

export default function IndustrialDesignsSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"table" | "grid">("table");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [advancedFilters, setAdvancedFilters] = useState(initialAdvancedSearch);
  const [searchParams, setSearchParams] = useState<IndustrialDesignParams>(initialSearchState);

  const {
    data: industrialDesignsData
  } = useQuery({
    queryFn: async () => await industrialDesignsService.get(searchParams),
    queryKey: [queryKey, { searchParams }],
  })

  const handleSearch = async () => {
    setSearchParams({
      ...initialSearchState,
      search: searchQuery
    });
    setActiveFilters({})
    setAdvancedFilters(initialAdvancedSearch)
    await queryClient.invalidateQueries({
      queryKey: [queryKey, { searchParams }]
    })
  };

  const handleAdvancedSearch = () => {
    setSearchParams({
      ...initialSearchState,
      status: advancedFilters?.status && advancedFilters.status ? advancedFilters.status : undefined,
      application_number: advancedFilters?.applicationNumber ?? advancedFilters.applicationNumber ? advancedFilters.applicationNumber : undefined,
      country_code: advancedFilters?.ownerCountry && advancedFilters.ownerCountry ? advancedFilters?.ownerCountry : undefined,
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
      newActiveFilters["Chủ đơn"] = advancedFilters.applicant;
    }

    if (advancedFilters.locarnoClass) {
      newActiveFilters["Phân loại Locarno"] = advancedFilters.locarnoClass;
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

    if (advancedFilters.applicationDate) {
      newActiveFilters["Ngày nộp"] = advancedFilters.applicationDate;
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

    if (advancedFilters.priorityDate) {
      newActiveFilters["Ngày ưu tiên"] = advancedFilters.priorityDate;
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

    setActiveFilters(newActiveFilters);
    setShowAdvancedFilter(false);
  };

  const handleResetFilters = () => {
    setAdvancedFilters(initialAdvancedSearch);
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
    <div className="space-y-4">
      {/* Search Section */ }
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
          {/* Search Input */ }
          <div className="flex-1 flex items-center border rounded-lg px-4 py-2 gap-2">
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
              size="sm"
              className="text-sm font-medium"
              onClick={ handleSearch }
            >
              Truy vấn
            </Button>
            <Button
              onClick={ () => setShowAdvancedFilter(true) }
              variant="outline"
              size="sm"
              className="text-sm font-medium"
            >
              Truy vấn nâng cao
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
                  <button
                    onClick={ () => removeFilter(key) }
                    className="ml-2 hover:text-red-600 flex-shrink-0"
                  >
                    ×
                  </button>
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
                  Clear
                </Button>
              ) }
            </div>

            {/* Results Count and Controls */ }
            <div className="flex flex-col gap-2 sm:gap-4 sm:flex-row sm:items-center">
              {/* View Toggle and Sort */ }
              <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l pt-2 sm:pt-0 sm:pl-2">
                <select className="text-xs sm:text-sm bg-transparent border rounded px-2 py-1">
                  <option>Ngày nộp đơn</option>
                  <option>Ngày cấp bằng</option>
                  <option>Tên</option>
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
                {/* <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 flex-shrink-0" title="Delete">
                  <Trash2 className="w-4 h-4 text-red-600"/>
                </button> */}
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
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">TÊN</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">SỐ ĐƠN</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">NGÀY NỘP ĐƠN</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">NGÀY CÔNG BỐ</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">SỐ BẰNG</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">NGÀY CẤP</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">CHỦ ĐƠN/CHỦ BẰNG</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">TRẠNG THÁI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  { industrialDesignsData?.items.filter((item) => item.application_number).map((item) => (
                    
                    <TableRow key={ item.id } className="hover:bg-transparent">
                      <TableCell>
                        <div
                          className="w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-400 rounded flex items-center justify-center text-sm font-bold text-white shadow-sm">
                          { item.name ? item.name.charAt(0) : "-" }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold max-w-[150px] truncate" title={item.name ?? "-"}>{ item.name ?? "-" }</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        { item.application_number }
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
              { industrialDesignsData?.items?.filter((item) => item.application_number).map((item) => (
                <div
                  key={ item.id }
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white dark:bg-zinc-900"
                >
                  <h3 className="font-semibold mb-2">{ item.application_number ?? "-" }</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Tên thiết kế:</span>{ " " }
                      { item.name ?? "-" }
                    </p>
                    <p>
                      <span className="font-medium">Chủ đơn:</span>{ " " }
                      { "-" }
                    </p>
                    <p>
                      <span className="font-medium">Loại thiết kế:</span>{ " " }
                      { "-" }
                    </p>
                    <p>
                      <span className="font-medium">Ngày nộp:</span>{ " " }
                      { item.application_date ? moment(item.application_date).format(FORMAT_DATE) : "-" }
                    </p>
                    <p>
                      <span className="font-medium">Phân loại Locarno:</span>{ " " }
                      { "-" }
                    </p>
                    <p>
                      <span className="font-medium">Mô tả sản phẩm:</span>{ " " }
                      { item.description ?? "-"}
                    </p>
                    <p>
                      <span className="font-medium">Trạng thái:</span>{ " " }
                      {
                        item.status ? (
                          <Badge variant="default" className="bg-blue-600 text-xs">
                            { item.status }
                          </Badge>
                        ): "-"
                      }
                    </p>
                  </div>
                </div>
              )) }
            </div>
          ) }
          <div className="w-full h-full mt-4">
            <Pagination totalItems={ industrialDesignsData?.total ?? 1 } itemsPerPage={ searchParams.page_size }
                        currentPage={ searchParams.page } onPageChange={ (val) => {
              setSearchParams((prev) => ({ ...prev, page: val }))
            } }/>
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
