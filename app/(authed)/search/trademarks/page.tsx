"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, Search, Trash2, XIcon, Eye } from "lucide-react";
import TrademarkDetailModal from "@/components/trademarks/trademark-detail-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import AdvancedSearchModal from "@/components/trademarks/search/advanced-search-modal";
import { useQuery } from "@tanstack/react-query";
import { TrademarkParams, trademarkService } from "@/services/trademark.service";
import { companyService } from "@/services/company.service";
import { DEFAULT_PAGINATION, FORMAT_DATE, initialSearchState } from "@/constants";
import PaginationComponent from "@/components/common/Pagination";
import moment from "moment";
import { queryClient } from "@/lib/react-query";
import { FileDown } from "lucide-react";
import { exportTrademarksToExcel } from "@/utils/excel-export";

const initialAdvancedSearchState = {
  ownerCountry: "",
  applicationCountry: "",
  publicationCountry: "",
  priorityCountry: "",
  // Phân loại
  niceClass: "",
  productCategory: "",
  viennaClass: "",
  // Ngày (date ranges)
  applicationDateFrom: "",
  applicationDateTo: "",
  publicationDateFrom: "",
  publicationDateTo: "",
  certificateDateFrom: "",
  certificateDateTo: "",
  expiryDateFrom: "",
  expiryDateTo: "",
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
  tradeName: "",
  colorClaim: "",
  goodsServices: "",
  status: "",
  certificateStatus: "",
  recordType: "",
}

export default function TrademarksSearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"table" | "grid">("table");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [advancedFilters, setAdvancedFilters] = useState(initialAdvancedSearchState);
  const [searchParams, setSearchParams] = useState<TrademarkParams>(initialSearchState);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedTrademark, setSelectedTrademark] = useState<any>(null);
  const [sortTrigger, setSortTrigger] = useState(0);

  const handleSearch = async () => {
    setSearchParams({
      ...initialSearchState,
      search: searchQuery
    });
    setActiveFilters({})
    setAdvancedFilters(initialAdvancedSearchState)
    await queryClient.invalidateQueries({
      queryKey: ["trademarks", { searchParams }]
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
      country_code: advancedFilters?.ownerCountry || undefined,
      certificate_number: advancedFilters?.certificateNumber || undefined,
      application_date_from: advancedFilters?.applicationDateFrom || undefined,
      application_date_to: advancedFilters?.applicationDateTo || undefined,
      publication_date_from: advancedFilters?.publicationDateFrom || undefined,
      publication_date_to: advancedFilters?.publicationDateTo || undefined,
      certificate_date_from: advancedFilters?.certificateDateFrom || undefined,
      certificate_date_to: advancedFilters?.certificateDateTo || undefined,
      expiry_date_from: advancedFilters?.expiryDateFrom || undefined,
      expiry_date_to: advancedFilters?.expiryDateTo || undefined,
      application_country: advancedFilters?.applicationCountry || undefined,
      publication_country: advancedFilters?.publicationCountry || undefined,
      priority_country: advancedFilters?.priorityCountry || undefined,
      nice_class: advancedFilters?.niceClass || undefined,
      product_category: advancedFilters?.productCategory || undefined,
      vienna_class: advancedFilters?.viennaClass || undefined,
      applicant: advancedFilters?.applicant || undefined,
      representative: advancedFilters?.representative || undefined,
      basic_application_number: advancedFilters?.basicApplicationNumber || undefined,
      priority_number: advancedFilters?.priorityNumber || undefined,
      trade_name: advancedFilters?.tradeName || undefined,
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
      newActiveFilters["NICE Class"] = advancedFilters.niceClass;
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

    if (advancedFilters.viennaClass) {
      newActiveFilters["Vienna Class"] = advancedFilters.viennaClass;
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

    if (advancedFilters.tradeName) {
      newActiveFilters["Nhãn hiệu"] = advancedFilters.tradeName;
    }

    if (advancedFilters.goodsServices) {
      newActiveFilters["Hàng hóa/Dịch vụ"] = advancedFilters.goodsServices;
    }

    if (advancedFilters.certificateStatus) {
      newActiveFilters["Trạng thái chứng chỉ"] = advancedFilters.certificateStatus;
    }

    if (advancedFilters.recordType) {
      newActiveFilters["Loại bản ghi"] = advancedFilters.recordType;
    }

    if (advancedFilters.colorClaim) {
      newActiveFilters["Màu sắc"] = advancedFilters.colorClaim;
    }

    setActiveFilters(newActiveFilters);
    setShowAdvancedFilter(false);
    await queryClient.invalidateQueries({
      queryKey: ["trademarks", { searchParams }]
    })
  };

  const handleResetFilters = () => {
    setAdvancedFilters({
      ownerCountry: "",
      applicationCountry: "",
      publicationCountry: "",
      priorityCountry: "",
      niceClass: "",
      productCategory: "",
      viennaClass: "",
      applicationDateFrom: "",
      applicationDateTo: "",
      publicationDateFrom: "",
      publicationDateTo: "",
      certificateDateFrom: "",
      certificateDateTo: "",
      expiryDateFrom: "",
      expiryDateTo: "",
      priorityDate: "",
      applicant: "",
      representative: "",
      certificateNumber: "",
      applicationNumber: "",
      basicApplicationNumber: "",
      priorityNumber: "",
      tradeName: "",
      colorClaim: "",
      goodsServices: "",
      status: "",
      certificateStatus: "",
      recordType: "",
    });
    setActiveFilters({});
    setSearchParams(initialSearchState)
  };

  const removeFilter = async (key: string) => {
    const updatedFilters = { ...activeFilters };
    delete updatedFilters[key];
    setActiveFilters(updatedFilters);

    // Clear corresponding advancedFilters based on the key
    const newAdvancedFilters = { ...advancedFilters };
    
    switch(key) {
      case "Số đơn":
        newAdvancedFilters.applicationNumber = "";
        break;
      case "Chủ đơn":
        newAdvancedFilters.applicant = "";
        break;
      case "NICE Class":
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
      case "Vienna Class":
        newAdvancedFilters.viennaClass = "";
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
      case "Ngày ưu tiên":
        newAdvancedFilters.priorityDate = "";
        break;
      case "Đại diện":
        newAdvancedFilters.representative = "";
        break;
      case "Số bằng":
        newAdvancedFilters.certificateNumber = "";
        break;
      case "Số đơn gốc":
        newAdvancedFilters.basicApplicationNumber = "";
        break;
      case "Số ưu tiên":
        newAdvancedFilters.priorityNumber = "";
        break;
      case "Nhãn hiệu":
        newAdvancedFilters.tradeName = "";
        break;
      case "Hàng hóa/Dịch vụ":
        newAdvancedFilters.goodsServices = "";
        break;
      case "Trạng thái chứng chỉ":
        newAdvancedFilters.certificateStatus = "";
        break;
      case "Loại bản ghi":
        newAdvancedFilters.recordType = "";
        break;
    }

    setAdvancedFilters(newAdvancedFilters);

    // Update search params and trigger new search
    const newSearchParams = {
      ...initialSearchState,
      status: newAdvancedFilters?.status && newAdvancedFilters.status ? newAdvancedFilters.status : undefined,
      application_number: newAdvancedFilters?.applicationNumber ? newAdvancedFilters.applicationNumber : undefined,
      country_code: newAdvancedFilters?.ownerCountry ? newAdvancedFilters.ownerCountry : undefined,
      certificate_number: newAdvancedFilters?.certificateNumber ? newAdvancedFilters.certificateNumber : undefined,
      application_date_from: newAdvancedFilters?.applicationDateFrom ? newAdvancedFilters.applicationDateFrom : undefined,
      application_date_to: newAdvancedFilters?.applicationDateTo ? newAdvancedFilters.applicationDateTo : undefined,
      publication_date_from: newAdvancedFilters?.publicationDateFrom ? newAdvancedFilters.publicationDateFrom : undefined,
      publication_date_to: newAdvancedFilters?.publicationDateTo ? newAdvancedFilters.publicationDateTo : undefined,
      certificate_date_from: newAdvancedFilters?.certificateDateFrom ? newAdvancedFilters.certificateDateFrom : undefined,
      certificate_date_to: newAdvancedFilters?.certificateDateTo ? newAdvancedFilters.certificateDateTo : undefined,
      expiry_date_from: newAdvancedFilters?.expiryDateFrom,
      expiry_date_to: newAdvancedFilters?.expiryDateTo,
      application_country: newAdvancedFilters?.applicationCountry,
      publication_country: newAdvancedFilters?.publicationCountry,
      priority_country: newAdvancedFilters?.priorityCountry,
      nice_class: newAdvancedFilters?.niceClass,
      product_category: newAdvancedFilters?.productCategory,
      vienna_class: newAdvancedFilters?.viennaClass,
      applicant: newAdvancedFilters?.applicant,
      representative: newAdvancedFilters?.representative,
      basicApplicationNumber: newAdvancedFilters?.basicApplicationNumber,
      priority_number: newAdvancedFilters?.priorityNumber,
      trade_name: newAdvancedFilters?.tradeName,
    };

    setSearchParams(newSearchParams);
    
    await queryClient.invalidateQueries({
      queryKey: ["trademarks", { searchParams: newSearchParams }]
    });
  };

  const {
    data: trademarksData,
    isLoading: isTrademarksLoading,
    refetch: refetchTrademarks,
  } = useQuery({
    queryFn: async () => await trademarkService.search({
      ...searchParams
    }),
    queryKey: ["trademarks", sortTrigger],
    enabled: true,
  })

  useEffect(() => {
    refetchTrademarks();
  }, [searchParams, refetchTrademarks]);
console.log('trade', trademarksData);

  // const {
  //   data: companiesData,
  // } = useQuery({
  //   queryFn: async () => {
  //     const [page1, page2, page3] = await Promise.all([
  //       companyService.getAll({ limit: 500, datasource: "ALL", page: 1, page_size: 500 }),
  //       companyService.getAll({ limit: 500, datasource: "ALL", page: 2, page_size: 500 }),
  //       companyService.getAll({ limit: 500, datasource: "ALL", page: 3, page_size: 500 })
  //     ]);
      
  //     // Merge the results
  //     return {
  //       ...page1,
  //       data: {
  //         ...page1.data,
  //         items: [...(page1.data?.items || []), ...(page2.data?.items || []), ...(page3.data?.items || [])]
  //       }
  //     };
  //   },
  //   queryKey: ["companies"],
  // })

  // Create a map for quick company lookup
  // const companyMap = companiesData?.data?.items?.reduce((acc, company) => {
  //   acc[company.id] = company.name;
  //   return acc;
  // }, {} as Record<string, string>) || {};
  const companyMap = {};

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
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
          <div className="flex-1 flex items-center border rounded-lg px-4 py-2 gap-2">
            <Search className="w-5 h-5 text-gray-400 shrink-0"/>
            <input
              type="text"
              placeholder="Nhập tìm kiếm theo tên nhãn hiệu, số đơn, chủ đơn..."
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
                  <div
                    onClick={ () => removeFilter(key) }
                    className="ml-2 cursor-pointer hover:text-red-600 flex-shrink-0"
                  >
                    <XIcon size={ 15 } color="#FF0000"/>
                  </div>
                </Badge>
              )) }
              { Object.keys(activeFilters).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={ () => {
                    handleResetFilters()
                  } }
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 text-xs sm:text-sm"
                >
                  Xóa bộ lọc
                </Button>
              ) }
            </div>

            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l pt-2 sm:pt-0 sm:pl-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const currentPageData = trademarksData?.items.filter((item) => item.application_number) || [];
                    await exportTrademarksToExcel(currentPageData, companyMap);
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
                  <option value="application_date-asc">Ngày nộp đơn: Cũ → Mới</option>
                  <option value="application_date-desc">Ngày nộp đơn: Mới → Cũ</option>
                  <option value="certificate_date-asc">Ngày cấp bằng: Cũ → Mới</option>
                  <option value="certificate_date-desc">Ngày cấp bằng: Mới → Cũ</option>
                  <option value="name-asc">Tên nhãn hiệu: A → Z</option>
                  <option value="name-desc">Tên nhãn hiệu: Z → A</option>
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
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">MẪU NHÃN</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">NHÃN HIỆU</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">SỐ ĐƠN</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">NGÀY NỘP ĐƠN</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">NGÀY CÔNG BỐ</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">SỐ BẰNG</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">NGÀY CẤP</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">CHỦ ĐƠN/CHỦ BẰNG</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">NHÓM SẢN PHẨM/DỊCH VỤ</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">TRẠNG THÁI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isTrademarksLoading ? (
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
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : trademarksData?.items.filter((item) => item.application_number).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-64">
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <p className="text-lg font-semibold mb-1">Không tìm thấy kết quả</p>
                          <p className="text-sm">Vui lòng thử tìm kiếm với từ khóa khác</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    trademarksData?.items.filter((item) => item.application_number).map((item) => (
                    <TableRow 
                      key={ item.id } 
                      className="hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedTrademark(item);
                        setShowQuickView(true);
                      }}
                    >
                      <TableCell>
                        <div className="relative w-16 h-16 rounded flex items-center justify-center shadow-sm overflow-hidden group">
                          {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.name || "Trademark"} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-sm font-bold text-white">
                            {item.name ? item.name.charAt(0) : "-"}
                          </div>
                          )}
                          <div 
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTrademark(item);
                              setShowQuickView(true);
                            }}
                          >
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold line-clamp-2" title={item.name ?? "-"}>{ item.name ?? "-" }</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        { item.code }
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
                          { item.owner_name || "-" }
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="line-clamp-2" title={(item as any).nice_class_text || "-"}>
                          { (item as any).nice_class_text || "-" }
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
              {isTrademarksLoading ? (
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
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                ))
              ) : trademarksData?.items.filter((item) => item.application_number).length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-500">
                  <p className="text-lg font-semibold mb-1">Không tìm thấy kết quả</p>
                  <p className="text-sm">Vui lòng thử tìm kiếm với từ khóa khác</p>
                </div>
              ) : (
                trademarksData?.items?.filter((item) => item.application_number).map((item) => (
                <div
                  key={ item.id }
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white dark:bg-zinc-900 cursor-pointer"
                  onClick={() => {
                    setSelectedTrademark(item);
                    setShowQuickView(true);
                  }}
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
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Số đơn:</span>{ " " }
                      { item.application_number || "-" }
                    </p>
                    <p>
                      <span className="font-medium">Chủ đơn:</span>{ " " }
                      { item.owner_name || "-" }
                    </p>
                    <p>
                      <span className="font-medium">Ngày nộp đơn:</span>{ " " }
                      { item.application_date ? moment(item.application_date).format(FORMAT_DATE) : "-" }
                    </p>
                    <p>
                      <span className="font-medium">Ngày công bố:</span>{ " " }
                      { item.publication_date ? moment(item.publication_date).format(FORMAT_DATE) : "-" }
                    </p>
                    <p>
                      <span className="font-medium">Nice Class:</span>{ " " }
                      <div className="line-clamp-2" title={(item as any).nice_class_text || "-"}>
                        { (item as any).nice_class_text || "-"}
                      </div>
                    </p>
                    <p>
                      <span className="font-medium">Trạng thái:</span>{ " " }
                      {item.wipo_status ? (
                          <span className="text-xs px-2 py-1 rounded font-bold">
                            {item.wipo_status}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded font-bold">
                            {item.certificate_number ? "Cấp bằng" : "Đang giải quyết"}
                          </span>
                        )}
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
              totalPages={Math.ceil((trademarksData?.total ?? 0) / searchParams.page_size)}
              total={trademarksData?.total ?? 0}
              onPageChange={(pageVal) => setSearchParams((prev) => ({
                ...prev,
                page: pageVal
              }))}
              pageSize={searchParams.page_size}
              onPageSizeChange={(size) => setSearchParams((prev) => ({
                ...prev,
                page_size: size,
                page: 1
              }))}
            />
          </div>
      </div>

      <AdvancedSearchModal
        open={ showAdvancedFilter }
        onOpenChange={ setShowAdvancedFilter }
        advancedFilters={ advancedFilters }
        onFiltersChange={ setAdvancedFilters }
        onSearch={ handleAdvancedSearch }
        onReset={ handleResetFilters }
      />

      <TrademarkDetailModal
        open={ showQuickView }
        onOpenChange={ setShowQuickView }
        trademark={ selectedTrademark }
        companyMap={ companyMap }
      />
    </div>
  );
}
