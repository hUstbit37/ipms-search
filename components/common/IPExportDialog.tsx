"use client";

import { useState, useEffect } from "react";
import { Loader2, Download, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery, useMutation } from "@/lib/react-query";
import { ipExportService, type IpType } from "@/services/ip-export.service";
import { toast } from "react-toastify";

interface IPExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ipType: IpType;
  searchParams: any; // Search params để convert thành filters
}

export function IPExportDialog({
  open,
  onOpenChange,
  ipType,
  searchParams,
}: IPExportDialogProps) {
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "polling" | "completed" | "failed">("idle");
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);

  const { data: documentTypes, isLoading: isLoadingTypes } = useQuery({
    queryKey: ["document-types"],
    queryFn: () => ipExportService.getDocumentTypes(),
    enabled: open,
  });

  // Hàm download file
  const downloadFile = (url: string, totalItems: number) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `ip_export_${ipType}_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Export thành công! Đã tải xuống ${totalItems} bản ghi.`);
    setExportStatus("completed");
    onOpenChange(false);
  };

  // Hàm polling để check status
  const startPolling = (jobId: number) => {
    setExportStatus("polling");
    setCurrentJobId(jobId);

    const interval = setInterval(async () => {
      try {
        const status = await ipExportService.checkExportStatus(ipType, jobId);
        
        if (status.status === "completed" && status.download_url) {
          clearInterval(interval);
          setPollingInterval(null);
          downloadFile(status.download_url, status.total_items);
        } else if (status.status === "failed") {
          clearInterval(interval);
          setPollingInterval(null);
          setExportStatus("failed");
          toast.error("Export thất bại. Vui lòng thử lại.");
        }
        // Nếu vẫn pending/processing → tiếp tục poll
      } catch (error: any) {
        // Nếu endpoint check status không tồn tại, dừng polling
        if (error?.response?.status === 404) {
          clearInterval(interval);
          setPollingInterval(null);
          setExportStatus("failed");
          toast.warning("Không thể kiểm tra trạng thái export. Vui lòng thử lại sau vài phút.");
        } else {
          console.error("Polling error:", error);
          // Tiếp tục poll nếu là lỗi khác
        }
      }
    }, 5000); // Poll mỗi 5 giây

    setPollingInterval(interval);

    // Timeout sau 10 phút
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setPollingInterval(null);
        setExportStatus("failed");
        toast.warning("Export đang mất quá nhiều thời gian. Vui lòng thử lại sau.");
      }
    }, 600000); // 10 phút
  };

  // Cleanup polling khi component unmount hoặc dialog đóng
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    };
  }, [pollingInterval]);

  useEffect(() => {
    if (!open) {
      // Reset state khi đóng dialog
      setExportStatus("idle");
      setCurrentJobId(null);
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  }, [open, pollingInterval]);

  const exportMutation = useMutation({
    mutationFn: (request: any) => {
      setExportStatus("exporting");
      return ipExportService.exportIPData(ipType, request);
    },
    onSuccess: (response) => {
      if (response.status === "completed" && response.download_url) {
        // Hoàn thành ngay → download
        downloadFile(response.download_url, response.total_items);
      } else if (response.status === "pending" || response.status === "processing") {
        // Chuyển sang polling
        if (response.job_id) {
          startPolling(response.job_id);
        } else {
          toast.warning("Export đang được xử lý. Vui lòng thử lại sau vài phút.");
          setExportStatus("failed");
        }
      } else if (response.status === "failed") {
        setExportStatus("failed");
        toast.error("Export thất bại. Vui lòng thử lại.");
      }
    },
    onError: (error: any) => {
      setExportStatus("failed");
      
      // Xử lý timeout
      if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
        toast.warning("Export đang mất quá nhiều thời gian. Vui lòng thử lại với bộ lọc nhỏ hơn hoặc thử lại sau.");
      } else {
        toast.error(error?.message || "Export thất bại. Vui lòng thử lại.");
      }
    },
  });

  useEffect(() => {
    if (open) {
      if (documentTypes && documentTypes.length > 0) {
        // Mặc định chọn tất cả
        setSelectAll(true);
        setSelectedDocumentTypes(documentTypes);
      } else {
        // Nếu không có document types, mặc định selectAll = true
        setSelectAll(true);
        setSelectedDocumentTypes([]);
      }
    }
  }, [open, documentTypes]);

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedDocumentTypes(documentTypes || []);
    } else {
      setSelectedDocumentTypes([]);
    }
  };

  const handleDocumentTypeChange = (docType: string, checked: boolean) => {
    if (checked) {
      setSelectedDocumentTypes((prev) => [...prev, docType]);
    } else {
      setSelectedDocumentTypes((prev) => prev.filter((t) => t !== docType));
      setSelectAll(false);
    }
  };

  const convertSearchParamsToFilters = (params: any): Record<string, any> | null => {
    if (!params || Object.keys(params).length === 0) {
      return null;
    }

    const filters: Record<string, any> = {};

    // Map các field từ searchParams sang filters
    if (params.search) filters.name = params.search;
    if (params.status) filters.status = params.status;
    if (params.country_code) filters.country_code = params.country_code;
    if (params.application_number) filters.application_number = params.application_number;
    if (params.certificate_number) filters.certificate_number = params.certificate_number;
    if (params.application_date_from) filters.application_date_from = params.application_date_from;
    if (params.application_date_to) filters.application_date_to = params.application_date_to;
    if (params.certificate_date_from) filters.certificate_date_from = params.certificate_date_from;
    if (params.certificate_date_to) filters.certificate_date_to = params.certificate_date_to;
    if (params.publicationDateFrom) filters.publication_date_from = params.publicationDateFrom;
    if (params.publicationDateTo) filters.publication_date_to = params.publicationDateTo;
    if (params.expiryDateFrom) filters.expiry_date_from = params.expiryDateFrom;
    if (params.expiryDateTo) filters.expiry_date_to = params.expiryDateTo;
    if (params.priorityCountry) filters.priority_country = params.priorityCountry;
    if (params.niceClass) filters.nice_class = Array.isArray(params.niceClass) ? params.niceClass : [params.niceClass];
    if (params.productCategory) filters.product_category = params.productCategory;
    if (params.viennaClass) filters.vienna_class = Array.isArray(params.viennaClass) ? params.viennaClass : [params.viennaClass];
    if (params.applicant) filters.applicant = params.applicant;
    if (params.representative) filters.representative = params.representative;
    if (params.basicApplicationNumber) filters.basic_application_number = params.basicApplicationNumber;
    if (params.name) filters.name = params.name;

    return Object.keys(filters).length > 0 ? filters : null;
  };

  const handleExport = () => {
    const filters = convertSearchParamsToFilters(searchParams);

    // Logic: Nếu selectAll hoặc không có selection hoặc không có document types
    // → không truyền document_types (tải toàn bộ)
    let document_types: string[] | null = null;
    
    if (documentTypes && documentTypes.length > 0) {
      if (selectAll) {
        document_types = null; // Tải toàn bộ
      } else if (selectedDocumentTypes.length > 0) {
        document_types = selectedDocumentTypes; // Chỉ tải các loại đã chọn
      } else {
        document_types = null; // Không chọn gì → tải toàn bộ
      }
    }
    // Nếu không có documentTypes → document_types = null (tải toàn bộ)

    const request = {
      filters,
      document_types,
      format: "zip" as const,
      include_documents: true,
      include_metadata: true,
    };

    exportMutation.mutate(request);
  };

  // Tính toán text hiển thị cho dropdown
  const getDropdownText = () => {
    if (selectAll || !documentTypes || documentTypes.length === 0) {
      return "Toàn bộ";
    }
    if (selectedDocumentTypes.length === 0) {
      return "Toàn bộ";
    }
    if (selectedDocumentTypes.length === documentTypes.length) {
      return "Toàn bộ";
    }
    return `${selectedDocumentTypes.length} loại đã chọn`;
  };

  const isExporting = exportMutation.isPending || exportStatus === "exporting" || exportStatus === "polling";
  
  const getExportStatusText = () => {
    if (exportStatus === "exporting") {
      return "Đang tạo export...";
    }
    if (exportStatus === "polling") {
      return "Đang xử lý export...";
    }
    return "Export";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xuất Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoadingTypes ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Đang tải danh sách loại tài liệu...</span>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Loại dữ liệu cần tải xuống</Label>
                
                <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      <span>{getDropdownText()}</span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <div className="max-h-[300px] overflow-y-auto p-2">
                      <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded">
                        <Checkbox
                          id="select-all"
                          checked={selectAll}
                          onCheckedChange={handleSelectAllChange}
                        />
                        <Label
                          htmlFor="select-all"
                          className="text-sm font-medium cursor-pointer flex-1"
                        >
                          Toàn bộ
                        </Label>
                      </div>

                      {documentTypes && documentTypes.length > 0 && (
                        <div className="space-y-1 pt-1 border-t">
                          {documentTypes.map((docType) => (
                            <div
                              key={docType}
                              className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded"
                            >
                              <Checkbox
                                id={docType}
                                checked={selectedDocumentTypes.includes(docType)}
                                onCheckedChange={(checked) =>
                                  handleDocumentTypeChange(docType, checked as boolean)
                                }
                                disabled={selectAll}
                              />
                              <Label
                                htmlFor={docType}
                                className="text-sm cursor-pointer flex-1 capitalize"
                              >
                                {docType.replace(/_/g, " ")}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {exportStatus === "polling" && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Loader2 className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0 animate-spin" />
                    <div className="text-xs text-yellow-800 dark:text-yellow-300">
                      <p className="font-medium mb-1">Đang xử lý export...</p>
                      <p>Quá trình này có thể mất vài phút. Vui lòng đợi trong khi hệ thống xử lý.</p>
                    </div>
                  </div>
                </div>
              )}

              {exportStatus !== "polling" && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Download className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800 dark:text-blue-300">
                      <p className="font-medium mb-1">Lưu ý:</p>
                      <p>File sẽ được export dưới dạng ZIP bao gồm metadata Excel và các tài liệu đã chọn.</p>
                      <p className="mt-1 text-blue-700 dark:text-blue-400">Quá trình export có thể mất vài phút tùy thuộc vào số lượng dữ liệu.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || isLoadingTypes}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {getExportStatusText()}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

