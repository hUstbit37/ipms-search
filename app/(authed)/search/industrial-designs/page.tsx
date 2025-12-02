"use client";

import { useState } from "react";
import { LayoutGrid, List, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import AdvancedSearchModal from "@/components/industrial-designs/search/advanced-search-modal";
import { FORMAT_DATE, initialSearchState } from "@/constants";
import { IndustrialDesignParams, industrialDesignsService } from "@/services/industrial-designs.service";
import { companyService } from "@/services/company.service";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import PaginationComponent from "@/components/common/Pagination";
import moment from "moment";
import DesignDetailModal from "@/components/industrial-designs/design-detail-modal";

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
}

const queryKey = "industrial-designs"

export default function IndustrialDesignsSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"table" | "grid">("table");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [advancedFilters, setAdvancedFilters] = useState(initialAdvancedSearch);
  const [searchParams, setSearchParams] = useState<IndustrialDesignParams>(initialSearchState);
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const {
    data: industrialDesignsData,
    isLoading: isDesignsLoading,
  } = useQuery({
    queryFn: async () => await industrialDesignsService.get(searchParams),
    queryKey: [queryKey, { searchParams }],
  })

  const {
    data: companiesData,
  } = useQuery({
    queryFn: async () => await companyService.getAll({ limit: 500, datasource: "ALL" }),
    queryKey: ["companies"],
  })

  // Create a map for quick company lookup
  const companyMap = companiesData?.data?.items?.reduce((acc, company) => {
    acc[company.id] = company.name;
    return acc;
  }, {} as Record<string, string>) || {};
console.log(industrialDesignsData);

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

  const handleAdvancedSearch = async () => {
    setSearchParams({
      ...initialSearchState,
      status: advancedFilters?.status,
      application_number: advancedFilters?.applicationNumber,
      country_code: advancedFilters?.ownerCountry,
      certificate_number: advancedFilters?.certificateNumber,
      application_date_from: advancedFilters?.applicationDateFrom,
      application_date_to: advancedFilters?.applicationDateTo,
      certificate_date_from: advancedFilters?.certificateDateFrom,
      certificate_date_to: advancedFilters?.certificateDateTo,
      publicationDateFrom: advancedFilters?.publicationDateFrom,
      publicationDateTo: advancedFilters?.publicationDateTo,
      expiryDateFrom: advancedFilters?.expiryDateFrom,
      expiryDateTo: advancedFilters?.expiryDateTo,
      application_country: advancedFilters?.applicationCountry,
      publication_country: advancedFilters?.publicationCountry,
      priorityCountry: advancedFilters?.priorityCountry,
      niceClass: advancedFilters?.niceClass,
      applicant: advancedFilters?.applicant,
      representative: advancedFilters?.representative,
      name: advancedFilters?.designName,
      basic_application_number: advancedFilters?.basicApplicationNumber,
      // priority_number: advancedFilters?.priorityNumber,
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

    setActiveFilters(newActiveFilters);
    setShowAdvancedFilter(false);
    await queryClient.invalidateQueries({
      queryKey: [queryKey]
    });
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
    const newSearchParams = { ...searchParams };

    switch(key) {
      case "Số đơn":
        newAdvancedFilters.applicationNumber = "";
        delete newSearchParams.application_number;
        break;
      case "Số bằng":
        newAdvancedFilters.certificateNumber = "";
        delete newSearchParams.certificate_number;
        break;
      case "Chủ đơn":
        newAdvancedFilters.applicant = "";
        delete newSearchParams.applicant;
        break;
      case "Đại diện":
        newAdvancedFilters.representative = "";
        delete newSearchParams.representative;
        break;
      case "Phân loại Locarno":
        newAdvancedFilters.niceClass = "";
        delete newSearchParams.niceClass;
        break;
      case "Nước":
        newAdvancedFilters.ownerCountry = "";
        delete newSearchParams.country_code;
        break;
      case "Nước nộp đơn":
        newAdvancedFilters.applicationCountry = "";
        delete newSearchParams.application_country;
        break;
      case "Nước công bố":
        newAdvancedFilters.publicationCountry = "";
        delete newSearchParams.publication_country;
        break;
      case "Nước ưu tiên":
        newAdvancedFilters.priorityCountry = "";
        delete newSearchParams.priorityCountry;
        break;
      case "Ngày nộp":
        newAdvancedFilters.applicationDateFrom = "";
        newAdvancedFilters.applicationDateTo = "";
        delete newSearchParams.application_date_from;
        delete newSearchParams.application_date_to;
        break;
      case "Ngày công bố":
        newAdvancedFilters.publicationDateFrom = "";
        newAdvancedFilters.publicationDateTo = "";
        delete newSearchParams.publicationDateFrom;
        delete newSearchParams.publicationDateTo;
        break;
      case "Ngày cấp":
        newAdvancedFilters.certificateDateFrom = "";
        newAdvancedFilters.certificateDateTo = "";
        delete newSearchParams.certificate_date_from;
        delete newSearchParams.certificate_date_to;
        break;
      case "Ngày hết hạn":
        newAdvancedFilters.expiryDateFrom = "";
        newAdvancedFilters.expiryDateTo = "";
        delete newSearchParams.expiryDateFrom;
        delete newSearchParams.expiryDateTo;
        break;
      case "Số đơn gốc":
        newAdvancedFilters.basicApplicationNumber = "";
        delete newSearchParams.basic_application_number;
        break;
      case "Số ưu tiên":
        newAdvancedFilters.priorityNumber = "";
        delete newSearchParams.priority_number;
        break;
      case "Tên thiết kế":
        newAdvancedFilters.designName = "";
        delete newSearchParams.name;
        break;
    }

    setAdvancedFilters(newAdvancedFilters);
    setSearchParams(newSearchParams);
    await queryClient.invalidateQueries({
      queryKey: [queryKey]
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
              placeholder="Nhập tìm kiếm theo tên thiết kế, số đơn, chủ đơn..."
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
                  {isDesignsLoading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell>
                          <Skeleton className="w-16 h-16 rounded" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
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
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    industrialDesignsData?.data?.items.filter((item) => item.application_number).map((item) => (
                    <TableRow 
                      key={ item.id } 
                      className="hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedDesign(item);
                        setShowDetailModal(true);
                      }}
                    >
                      <TableCell>
                        <div className="w-16 h-16 rounded overflow-hidden">
                          {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.name || "Design"} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                            {item.name ? item.name.charAt(0) : "-"}
                          </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold line-clamp-2" title={item.name ?? "-"}>{ item.name ?? "-" }</div>
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
                        <div className="line-clamp-2" title={(item as any).owner_id ? (companyMap[(item as any).owner_id] || "-") : "-"}>
                          { (item as any).owner_id ? (companyMap[(item as any).owner_id] || "-") : "-" }
                        </div>
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
              {isDesignsLoading ? (
                // Loading skeleton for grid view
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`grid-skeleton-${index}`}
                    className="border rounded-lg p-4 bg-white dark:bg-zinc-900"
                  >
                    <Skeleton className="h-6 w-32 mb-2" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                ))
              ) : (
                industrialDesignsData?.data?.items?.filter((item) => item.application_number).map((item) => (
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
              ))
              )}
            </div>
          ) }
          <div className="w-full h-full mt-4">
            <PaginationComponent 
              page={searchParams.page}
              totalPages={Math.ceil((industrialDesignsData?.data?.total ?? 0) / searchParams.page_size)}
              total={industrialDesignsData?.data?.total ?? 0}
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
      />
    </div>
  );
}
