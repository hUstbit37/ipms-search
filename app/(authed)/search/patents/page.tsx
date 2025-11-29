"use client";

import { useState } from "react";
import { Search, Trash2, LayoutGrid, List } from "lucide-react";
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
import AdvancedSearchModal from "@/components/patents/search/advanced-search-modal";

interface Patent {
  id: string;
  name: string;
  logo?: string;
  applicationNumber: string;
  certificateNumber: string;
  applicationDate: string;
  certificateDate: string | null;
  expiryDate: string | null;
  publicationDate: string;
  applicant: string;
  agency: string;
  ipcClassification: string;
  originCountryCode: string;
  countryCode: string;
  status: "CẤP BẰNG" | "ĐANG XỬ LÝ" | "BỊ TỪ CHỐI" | "HẾT HẠN";
}

const mockData: Patent[] = [
  {
    id: "1",
    name: "Hệ thống xử lý dữ liệu thông minh",
    logo: "HT",
    applicationNumber: "VN-2024-00001",
    certificateNumber: "VN108822",
    applicationDate: "15.01.2024",
    certificateDate: "20.10.2024",
    expiryDate: "14.01.2044",
    publicationDate: "15.04.2024",
    applicant: "Công ty TNHH Công nghệ ABC",
    agency: "NOIP",
    ipcClassification: "G06F",
    originCountryCode: "VN",
    countryCode: "VN",
    status: "CẤP BẰNG",
  },
  {
    id: "2",
    name: "Thiết bị điều khiển từ xa thế hệ mới",
    logo: "TD",
    applicationNumber: "VN-2024-00002",
    certificateNumber: "",
    applicationDate: "20.02.2024",
    certificateDate: null,
    expiryDate: null,
    publicationDate: "22.05.2024",
    applicant: "Công ty Cổ phần Công nghệ XYZ",
    agency: "NOIP",
    ipcClassification: "H04L",
    originCountryCode: "VN",
    countryCode: "VN",
    status: "ĐANG XỬ LÝ",
  },
  {
    id: "3",
    name: "Pin năng lượng mặt trời cải tiến",
    logo: "PN",
    applicationNumber: "VN-2024-00003",
    certificateNumber: "VN108824",
    applicationDate: "10.03.2024",
    certificateDate: "25.09.2024",
    expiryDate: "09.03.2044",
    publicationDate: "10.06.2024",
    applicant: "Công ty Cổ phần Điện tử Việt",
    agency: "NOIP",
    ipcClassification: "H01M",
    originCountryCode: "VN",
    countryCode: "VN",
    status: "CẤP BẰNG",
  },
  {
    id: "4",
    name: "Vật liệu sinh học tái tạo",
    logo: "VL",
    applicationNumber: "VN-2024-00004",
    certificateNumber: "",
    applicationDate: "05.04.2024",
    certificateDate: null,
    expiryDate: null,
    publicationDate: "05.07.2024",
    applicant: "Đại học Bách khoa Hà Nội",
    agency: "NOIP",
    ipcClassification: "C08G",
    originCountryCode: "VN",
    countryCode: "VN",
    status: "ĐANG XỬ LÝ",
  },
  {
    id: "5",
    name: "Phương pháp sản xuất vaccine mới",
    logo: "PH",
    applicationNumber: "VN-2024-00005",
    certificateNumber: "VN108825",
    applicationDate: "12.05.2024",
    certificateDate: "18.10.2024",
    expiryDate: "11.05.2044",
    publicationDate: "14.08.2024",
    applicant: "Công ty Cổ phần Dược phẩm Thế kỷ",
    agency: "NOIP",
    ipcClassification: "A61K",
    originCountryCode: "VN",
    countryCode: "VN",
    status: "CẤP BẰNG",
  },
  {
    id: "6",
    name: "Hệ thống cấp nước sạch tự động",
    logo: "HC",
    applicationNumber: "VN-2024-00006",
    certificateNumber: "",
    applicationDate: "22.06.2024",
    certificateDate: null,
    expiryDate: null,
    publicationDate: "25.09.2024",
    applicant: "Startup Công nghệ Xanh",
    agency: "NOIP",
    ipcClassification: "C02F",
    originCountryCode: "VN",
    countryCode: "VN",
    status: "ĐANG XỬ LÝ",
  },
];

export default function PatentsSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"table" | "grid">("table");
  const [filteredData, setFilteredData] = useState(mockData);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [advancedFilters, setAdvancedFilters] = useState({
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = mockData.filter(
        (item) =>
          item.applicationNumber.toLowerCase().includes(query.toLowerCase()) ||
          item.applicant.toLowerCase().includes(query.toLowerCase()) ||
          item.name.toLowerCase().includes(query.toLowerCase())
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
      newActiveFilters["Người đơn"] = advancedFilters.applicant;
    }

    if (advancedFilters.name) {
      filtered = filtered.filter((item) =>
        item.name
          .toLowerCase()
          .includes(advancedFilters.name.toLowerCase())
      );
      newActiveFilters["Tên sáng chế"] = advancedFilters.name;
    }

    if (advancedFilters.ipcClassification) {
      filtered = filtered.filter((item) =>
        item.ipcClassification.includes(advancedFilters.ipcClassification)
      );
      newActiveFilters["Phân loại IPC"] = advancedFilters.ipcClassification;
    }

    if (advancedFilters.countryCode) {
      filtered = filtered.filter(
        (item) => item.countryCode === advancedFilters.countryCode
      );
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
    setFilteredData(filtered);
    setShowAdvancedFilter(false);
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
    setFilteredData(mockData);
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
      {/* Search Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 px-4 py-6">
        <div className="container mx-auto">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
            {/* Toggle */}
            <button className="text-white hover:bg-blue-600 dark:hover:bg-blue-700 rounded-full p-2 transition-colors shrink-0">
              <div className="w-6 h-6 rounded-full border-2 border-white bg-white/30"></div>
            </button>

            {/* Search Input */}
            <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2 gap-2">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Tìm kiếm sáng chế..."
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
                Tìm kiếm
              </Button>
              <Button
                onClick={() => setShowAdvancedFilter(true)}
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
                Hiển thị 1 đến 30 của {filteredData.length}
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
                  <option>Ngày đơn đăng ký</option>
                  <option>Ngày cấp bằng</option>
                  <option>Tiêu đề</option>
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
                <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 flex-shrink-0" title="Xóa">
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
                    <TableHead className="text-white">LOGO</TableHead>
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
                  {filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-400 rounded flex items-center justify-center text-sm font-bold text-white shadow-sm">
                          {item.logo || item.name.charAt(0)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="font-semibold">{item.name}</div>
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
                        {item.ipcClassification}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(item.status)}`}>
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
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm flex-1">{item.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ml-2 ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{item.applicationNumber}</p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>
                      <span className="font-medium">Người đơn:</span>{" "}
                      {item.applicant}
                    </p>
                    <p>
                      <span className="font-medium">Ngày nộp:</span>{" "}
                      {item.applicationDate}
                    </p>
                    <p>
                      <span className="font-medium">Ngày công bố:</span>{" "}
                      {item.publicationDate}
                    </p>
                    <p>
                      <span className="font-medium">Số bằng:</span>{" "}
                      {item.certificateNumber || "-"}
                    </p>
                    <p>
                      <span className="font-medium">IPC:</span>{" "}
                      {item.ipcClassification}
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
