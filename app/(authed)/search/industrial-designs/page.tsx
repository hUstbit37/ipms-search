"use client";

import { useState } from "react";
import { Search, Settings, Trash2, LayoutGrid, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdvancedSearchModal from "@/components/industrial-designs/search/advanced-search-modal";

interface IndustrialDesign {
  id: string;
  applicationNumber: string;
  certificateNumber: string;
  applicationDate: string;
  certificateDate: string | null;
  expiryDate: string | null;
  publicationDate: string;
  applicant: string;
  agency: string;
  locarnoClass: string[];
  locarnoClassText: string;
  designType: string;
  designName: string;
  goodsDescription: string;
  countryCode: string;
  validityPeriod: string;
  designImage?: string;
  certificateNumber2?: string;
  certificateDate2?: string;
  status: string;
}

const mockData: IndustrialDesign[] = [
  {
    id: "1",
    applicationNumber: "VN-4-2025-50761",
    certificateNumber: "",
    applicationDate: "15.08.2025",
    certificateDate: null,
    expiryDate: null,
    publicationDate: "01.11.2025",
    applicant: "CÔNG TY CỔ PHẦN THIẾT KẾ CÔNG NGHIỆP",
    agency: "",
    locarnoClass: ["02", "05", "09"],
    locarnoClassText: "02, 05, 09",
    designType: "Kiểu dáng sản phẩm",
    designName: "DESIGN CONTAINER",
    goodsDescription: "Hộp chứa, bao bì sản phẩm",
    countryCode: "VN",
    validityPeriod: "10 năm",
    status: "Đang giải quyết",
  },
  {
    id: "2",
    applicationNumber: "VN-4-2025-50760",
    certificateNumber: "",
    applicationDate: "14.08.2025",
    certificateDate: null,
    expiryDate: null,
    publicationDate: "31.10.2025",
    applicant: "CÔNG TY CỔ PHẦN CÔNG NGHỆ THIẾT KẾ",
    agency: "",
    locarnoClass: ["07", "12"],
    locarnoClassText: "07, 12",
    designType: "Kiểu dáng giao diện",
    designName: "UI DESIGN BUTTON",
    goodsDescription: "Nút điều khiển, giao diện người dùng",
    countryCode: "VN",
    validityPeriod: "10 năm",
    status: "Đang giải quyết",
  },
  {
    id: "3",
    applicationNumber: "VN-4-2025-45813",
    certificateNumber: "",
    applicationDate: "20.07.2025",
    certificateDate: null,
    expiryDate: null,
    publicationDate: "15.10.2025",
    applicant: "CÔNG TY CỔ PHẦN TẬP ĐOÀN THIẾT KẾ",
    agency: "",
    locarnoClass: ["06", "14"],
    locarnoClassText: "06, 14",
    designType: "Kiểu dáng sản phẩm",
    designName: "FURNITURE DESIGN",
    goodsDescription: "Nội thất, đồ gỗ trang trí",
    countryCode: "VN",
    validityPeriod: "10 năm",
    status: "Đang giải quyết",
  },
  {
    id: "4",
    applicationNumber: "VN-4-2025-45811",
    certificateNumber: "",
    applicationDate: "19.07.2025",
    certificateDate: null,
    expiryDate: null,
    publicationDate: "14.10.2025",
    applicant: "CÔNG TY CỔ PHẦN TẬP ĐOÀN CÔNG NGHIỆP",
    agency: "",
    locarnoClass: ["03", "11"],
    locarnoClassText: "03, 11",
    designType: "Kiểu dáng sản phẩm",
    designName: "TEXTILE PATTERN",
    goodsDescription: "Vải, mẫu dệt may",
    countryCode: "VN",
    validityPeriod: "10 năm",
    status: "Đang giải quyết",
  },
  {
    id: "5",
    applicationNumber: "VN-4-2025-40271",
    certificateNumber: "4-0987654-000",
    applicationDate: "10.06.2025",
    certificateDate: "05.09.2025",
    expiryDate: "05.09.2035",
    publicationDate: "20.09.2025",
    applicant: "CÔNG TY CỔ PHẦN THIẾT KẾ QUỐC TẾ",
    agency: "",
    locarnoClass: ["02", "07"],
    locarnoClassText: "02, 07",
    designType: "Kiểu dáng sản phẩm",
    designName: "PRODUCT DESIGN",
    goodsDescription: "Sản phẩm gia dụng, điện tử",
    countryCode: "VN",
    validityPeriod: "10 năm",
    status: "Cấp bằng",
  },
  {
    id: "6",
    applicationNumber: "VN-4-2025-38722",
    certificateNumber: "",
    applicationDate: "28.07.2025",
    certificateDate: null,
    expiryDate: null,
    publicationDate: "28.09.2025",
    applicant: "CÔNG TY CỔ PHẦN THIẾT KẾ SÁNG TẠO",
    agency: "",
    locarnoClass: ["04", "06", "14"],
    locarnoClassText: "04, 06, 14",
    designType: "Kiểu dáng sản phẩm",
    designName: "ARTISTIC DESIGN",
    goodsDescription: "Các sản phẩm nghệ thuật trang trí",
    countryCode: "VN",
    validityPeriod: "10 năm",
    status: "Đang giải quyết",
  },
];

export default function IndustrialDesignsSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"table" | "grid">("table");
  const [filteredData, setFilteredData] = useState(mockData);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [advancedFilters, setAdvancedFilters] = useState({
    // Các nước
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
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = mockData.filter(
        (item) =>
          item.applicationNumber.toLowerCase().includes(query.toLowerCase()) ||
          item.applicant.toLowerCase().includes(query.toLowerCase()) ||
          item.goodsDescription.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(mockData);
    }
  };

  const handleAdvancedSearch = () => {
    let filtered = mockData;
    const newActiveFilters: Record<string, string> = {};

    if (advancedFilters.applicationNumber) {
      filtered = filtered.filter((item) =>
        item.applicationNumber
          .toLowerCase()
          .includes(advancedFilters.applicationNumber.toLowerCase())
      );
      newActiveFilters["Số đơn"] = advancedFilters.applicationNumber;
    }

    if (advancedFilters.applicant) {
      filtered = filtered.filter((item) =>
        item.applicant
          .toLowerCase()
          .includes(advancedFilters.applicant.toLowerCase())
      );
      newActiveFilters["Chủ đơn"] = advancedFilters.applicant;
    }

    if (advancedFilters.locarnoClass) {
      filtered = filtered.filter((item) =>
        item.locarnoClassText.includes(advancedFilters.locarnoClass)
      );
      newActiveFilters["Phân loại Locarno"] = advancedFilters.locarnoClass;
    }

    if (advancedFilters.ownerCountry) {
      filtered = filtered.filter(
        (item) => item.countryCode === advancedFilters.ownerCountry
      );
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
      filtered = filtered.filter((item) =>
        item.designName
          .toLowerCase()
          .includes(advancedFilters.designName.toLowerCase())
      );
      newActiveFilters["Tên thiết kế"] = advancedFilters.designName;
    }

    if (advancedFilters.designType) {
      filtered = filtered.filter((item) =>
        item.designType
          .toLowerCase()
          .includes(advancedFilters.designType.toLowerCase())
      );
      newActiveFilters["Loại thiết kế"] = advancedFilters.designType;
    }

    if (advancedFilters.goodsDescription) {
      filtered = filtered.filter((item) =>
        item.goodsDescription
          .toLowerCase()
          .includes(advancedFilters.goodsDescription.toLowerCase())
      );
      newActiveFilters["Mô tả sản phẩm"] = advancedFilters.goodsDescription;
    }

    if (advancedFilters.certificateStatus) {
      newActiveFilters["Trạng thái chứng chỉ"] = advancedFilters.certificateStatus;
    }

    if (advancedFilters.recordType) {
      newActiveFilters["Loại bản ghi"] = advancedFilters.recordType;
    }

    setActiveFilters(newActiveFilters);
    setFilteredData(filtered);
    setShowAdvancedFilter(false);
  };

  const handleResetFilters = () => {
    setAdvancedFilters({
      ownerCountry: "",
      applicationCountry: "",
      publicationCountry: "",
      priorityCountry: "",
      locarnoClass: "",
      productCategory: "",
      designDomain: "",
      applicationDate: "",
      publicationDate: "",
      certificateDate: "",
      expiryDate: "",
      priorityDate: "",
      applicant: "",
      representative: "",
      certificateNumber: "",
      applicationNumber: "",
      basicApplicationNumber: "",
      priorityNumber: "",
      designName: "",
      designType: "",
      goodsDescription: "",
      status: "",
      certificateStatus: "",
      recordType: "",
    });
    setActiveFilters({});
    setFilteredData(mockData);
  };

  const removeFilter = (key: string) => {
    const updatedFilters = { ...activeFilters };
    delete updatedFilters[key];
    setActiveFilters(updatedFilters);
  };

  return (
    <div className="flex-1">
      {/* Search Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 px-4 py-6">
        <div className="container mx-auto">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
            {/* Search Input */}
            <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2 gap-2">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Enter Keyword(s)"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-blue-600 border-white hover:bg-blue-50 text-sm font-medium"
              >
                Truy vấn
              </Button>
              <Button
                onClick={() => setShowAdvancedFilter(true)}
                variant="outline"
                size="sm"
                className="bg-white text-blue-600 border-white hover:bg-blue-50 text-sm font-medium"
              >
                Truy vấn nâng cao
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-gray-50 dark:bg-zinc-900 border-b px-4 py-4">
        <div className="container mx-auto">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(activeFilters).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="rounded-full text-xs sm:text-sm">
                  <span className="truncate">{key}:</span>
                  <span className="ml-1 truncate">{value}</span>
                  <button
                    onClick={() => removeFilter(key)}
                    className="ml-2 hover:text-red-600 flex-shrink-0"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {Object.keys(activeFilters).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveFilters({});
                    setFilteredData(mockData);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 text-xs sm:text-sm"
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Results Count and Controls */}
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                Showing 1 to 30 of {filteredData.length}
              </span>

              {/* Pagination */}
              <div className="flex items-center gap-1 text-xs sm:text-sm overflow-x-auto">
                <button className="px-2 py-1 border rounded hover:bg-gray-100 dark:hover:bg-zinc-800 flex-shrink-0">
                  ⏮
                </button>
                <button className="px-2 py-1 border rounded hover:bg-gray-100 dark:hover:bg-zinc-800 flex-shrink-0">
                  1
                </button>
                <button className="px-2 py-1 border rounded hover:bg-gray-100 dark:hover:bg-zinc-800 flex-shrink-0">
                  2
                </button>
                <button className="px-2 py-1 border rounded bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex-shrink-0">
                  3
                </button>
                <button className="px-2 py-1 border rounded hover:bg-gray-100 dark:hover:bg-zinc-800 flex-shrink-0">
                  4
                </button>
                <button className="px-2 py-1 border rounded hover:bg-gray-100 dark:hover:bg-zinc-800 flex-shrink-0">
                  5
                </button>
                <button className="px-2 py-1 border rounded hover:bg-gray-100 dark:hover:bg-zinc-800 flex-shrink-0">
                  ⏭
                </button>
              </div>

              {/* View Toggle and Sort */}
              <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4">
                <select className="text-xs sm:text-sm bg-transparent border rounded px-2 py-1">
                  <option>Ngày nộp đơn</option>
                  <option>Ngày cấp bằng</option>
                  <option>Tên thiết kế</option>
                </select>
                <button
                  onClick={() => setViewType("table")}
                  className={`p-2 rounded flex-shrink-0 ${
                    viewType === "table"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-600"
                      : "hover:bg-gray-100 dark:hover:bg-zinc-800"
                  }`}
                  title="Table view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewType("grid")}
                  className={`p-2 rounded flex-shrink-0 ${
                    viewType === "grid"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-600"
                      : "hover:bg-gray-100 dark:hover:bg-zinc-800"
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 flex-shrink-0" title="Delete">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="px-4 py-6">
        <div className="container mx-auto">
          {viewType === "table" ? (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-blue-700 dark:bg-blue-900">
                  <TableRow>
                    <TableHead className="text-white">HỆ LỤC THIẾT KẾ</TableHead>
                    <TableHead className="text-white">TÊN THIẾT KẾ</TableHead>
                    <TableHead className="text-white">SỐ ĐƠN</TableHead>
                    <TableHead className="text-white">NGÀY NỘP ĐƠN</TableHead>
                    <TableHead className="text-white">NGÀY CÔNG BỐ</TableHead>
                    <TableHead className="text-white">SỐ BẰNG</TableHead>
                    <TableHead className="text-white">NGÀY CẤP</TableHead>
                    <TableHead className="text-white">CHỦ ĐƠN/CHỦ BẰNG</TableHead>
                    <TableHead className="text-white">LOẠI THIẾT KẾ</TableHead>
                    <TableHead className="text-white">TRẠNG THÁI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-400 rounded flex items-center justify-center text-sm font-bold text-white shadow-sm">
                          {item.designName.charAt(0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{item.designName}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.applicationNumber}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.applicationDate}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.publicationDate}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.certificateNumber || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.certificateDate || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.applicant}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.designType}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          {item.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white dark:bg-zinc-900"
                >
                  <h3 className="font-semibold mb-2">{item.applicationNumber}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Tên thiết kế:</span>{" "}
                      {item.designName}
                    </p>
                    <p>
                      <span className="font-medium">Chủ đơn:</span>{" "}
                      {item.applicant}
                    </p>
                    <p>
                      <span className="font-medium">Loại thiết kế:</span>{" "}
                      {item.designType}
                    </p>
                    <p>
                      <span className="font-medium">Ngày nộp:</span>{" "}
                      {item.applicationDate}
                    </p>
                    <p>
                      <span className="font-medium">Phân loại Locarno:</span>{" "}
                      {item.locarnoClassText}
                    </p>
                    <p>
                      <span className="font-medium">Mô tả sản phẩm:</span>{" "}
                      {item.goodsDescription}
                    </p>
                    <p>
                      <span className="font-medium">Trạng thái:</span>{" "}
                      <Badge variant="default" className="bg-blue-600 text-xs">
                        {item.status}
                      </Badge>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filter Modal */}
      <AdvancedSearchModal
        open={showAdvancedFilter}
        onOpenChange={setShowAdvancedFilter}
        advancedFilters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        onSearch={handleAdvancedSearch}
        onReset={handleResetFilters}
      />
    </div>
  );
}
