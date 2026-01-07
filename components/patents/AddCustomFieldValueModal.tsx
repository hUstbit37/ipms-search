"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, X, Check } from "lucide-react";
import { patentService, PatentResponse } from "@/services/patent.service";
import { CustomField } from "@/services/custom-fields.service";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AddCustomFieldValueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customFields: CustomField[];
  onSubmit?: (data: { custom_field_id: number; application_numbers: string[]; value: string }) => Promise<void>;
}

export default function AddCustomFieldValueModal({
  open,
  onOpenChange,
  customFields,
  onSubmit,
}: AddCustomFieldValueModalProps) {
  const [selectedField, setSelectedField] = useState<number | null>(null);
  const [fieldValue, setFieldValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PatentResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPatents, setSelectedPatents] = useState<PatentResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset form khi đóng modal
  useEffect(() => {
    if (!open) {
      setSelectedField(null);
      setFieldValue("");
      setSearchQuery("");
      setSearchResults([]);
      setSelectedPatents([]);
      setIsOpen(false);
    }
  }, [open]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [open]);

  // Hàm tìm kiếm với debounce
  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await patentService.get({
        application_number: query.trim(),
        page: 1,
        page_size: 30,
      });
      
      if (response?.items && response.items.length > 0) {
        setSearchResults(response.items);
        setIsOpen(true);
      } else {
        setSearchResults([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      setSearchResults([]);
      setIsOpen(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 500);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // Xử lý chọn/bỏ chọn patent từ kết quả tìm kiếm
  const handleSelectPatent = (e: React.MouseEvent, patent: PatentResponse) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Kiểm tra xem đã chọn chưa
    const isAlreadySelected = selectedPatents.some(
      (p) => p.application_number === patent.application_number
    );
    
    if (isAlreadySelected) {
      // Nếu đã chọn thì bỏ chọn
      setSelectedPatents((prev) =>
        prev.filter((p) => p.application_number !== patent.application_number)
      );
    } else {
      // Nếu chưa chọn thì thêm vào
      setSelectedPatents((prev) => [...prev, patent]);
    }
    // Không xóa search query và không đóng popup để có thể chọn tiếp
  };

  // Xóa patent đã chọn
  const handleRemovePatent = (applicationNumber: string) => {
    setSelectedPatents((prev) =>
      prev.filter((p) => p.application_number !== applicationNumber)
    );
  };

  // Xử lý submit
  const handleSubmit = async () => {
    if (!selectedField || selectedPatents.length === 0 || !fieldValue.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Gọi callback để xử lý update ở component cha
      if (onSubmit) {
        const applicationNumbers = selectedPatents
          .map((p) => p.application_number)
          .filter((num): num is string => !!num);
        
        await onSubmit({
          custom_field_id: selectedField,
          application_numbers: applicationNumbers,
          value: fieldValue.trim(),
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Lỗi cập nhật giá trị trường nội bộ:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm giá trị cho Trường nội bộ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Select trường */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Chọn Trường nội bộ
            </Label>
            <Select
              value={selectedField?.toString() || ""}
              onValueChange={(value) => setSelectedField(Number(value))}
            >
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Chọn trường..." />
              </SelectTrigger>
              <SelectContent>
                {customFields.map((field) => (
                  <SelectItem key={field.id} value={field.id.toString()}>
                    {field.alias_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input giá trị */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Giá trị
            </Label>
            <Input
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              placeholder="Nhập giá trị..."
            />
          </div>

          {/* Tìm kiếm số đơn patent */}
          <div ref={containerRef}>
            <Label className="text-sm font-medium mb-2 block">
              Tìm kiếm số đơn sáng chế
            </Label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0 && searchQuery.trim().length >= 2) {
                      setIsOpen(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay closing to allow click on suggestion
                    setTimeout(() => {
                      setIsOpen(false);
                    }, 200);
                  }}
                  placeholder="Nhập số đơn sáng chế..."
                  className="pl-9"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>

              {/* Dropdown kết quả tìm kiếm */}
              {isOpen && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-[300px] overflow-y-auto">
                  {searchResults.map((patent, index) => {
                    const isSelected = selectedPatents.some(
                      (p) => p.application_number === patent.application_number
                    );
                    return (
                      <div
                        key={patent.id}
                        className={cn(
                          "px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors",
                          isSelected && "bg-blue-50 dark:bg-blue-900"
                        )}
                        onClick={(e) => handleSelectPatent(e, patent)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                              {patent.application_number || "-"}
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                              {patent.name || "-"}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Hiển thị số đơn đã chọn */}
          {selectedPatents.length > 0 && (
            <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded text-sm">
              <p className="font-medium mb-2">
                Số đơn đã chọn ({selectedPatents.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedPatents.map((patent) => (
                  <Badge
                    key={patent.id}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    <span>{patent.application_number}</span>
                    <button
                      onClick={() => handleRemovePatent(patent.application_number || "")}
                      className="ml-1 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedField || selectedPatents.length === 0 || !fieldValue.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Thêm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

