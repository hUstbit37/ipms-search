"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IP_TYPES, type IpType } from "@/constants/ip-type";
import {
  trademarkService,
  type TrademarkResponse,
} from "@/services/trademark.service";
import {
  industrialDesignsService,
  type IndustrialDesignResponse,
} from "@/services/industrial-designs.service";
import { toast } from "react-toastify";

export type SelectedIpItem = {
  id: number;
  ip_type: IpType;
  name: string | null;
  application_number: string | null;
  certificate_number: string | null;
  group: string | null;
  status: string | null;
  nice_class_list_raw?: string[] | null;
  nice_class_list?: string[] | null;
  products?: Array<{ goods_name: string | null; group: string | null }> | null;
};

type IpSearchModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ipType: IpType;
  initialSelected: SelectedIpItem[];
  onConfirm: (items: SelectedIpItem[]) => void;
};

// Chuẩn hóa dữ liệu nhãn hiệu về dạng SelectedIpItem
const normalizeTrademark = (item: TrademarkResponse): SelectedIpItem => ({
  id: item.id,
  ip_type: IP_TYPES.TRADEMARK,
  name: item.name,
  application_number: item.application_number,
  certificate_number: item.certificate_number,
  group:
    item.nice_class_text ||
    (item.nice_class_list && item.nice_class_list.length > 0
      ? item.nice_class_list.join(", ")
      : null),
  status:
    item.wipo_status ||
    (item.certificate_number ? "Cấp bằng" : "Đang giải quyết"),
  nice_class_list_raw: item.nice_class_list_raw || null,
  nice_class_list: item.nice_class_list || null,
  products: null,
});

// Hàm helper xử lý locarno_list theo logic từ locarno-detail.tsx
// Trả về chuỗi đã join hoặc null
const processLocarnoList = (
  locarno_list?: Array<{ subclass?: string | null; class_number?: string | null }> | string[] | string | null,
  locarno_list_raw?: string[] | string | null
): string | null => {
  const locarnoLines: string[] = (() => {
    // Ưu tiên locarno_list_raw
    if (Array.isArray(locarno_list_raw) && locarno_list_raw.length > 0) {
      return locarno_list_raw
        .filter((entry: unknown) => typeof entry === "string" && entry.trim().length > 0)
        .map((entry: string) => entry.trim());
    }
    if (typeof locarno_list_raw === "string" && locarno_list_raw.trim().length > 0) {
      return [locarno_list_raw.trim()];
    }
    // Xử lý locarno_list
    if (Array.isArray(locarno_list) && locarno_list.length > 0) {
      // Kiểm tra xem có phải là mảng object không
      const firstItem = locarno_list[0];
      if (typeof firstItem === "object" && firstItem !== null && !Array.isArray(firstItem)) {
        // Nếu là object có subclass và class_number
        return (locarno_list as Array<{ subclass?: string | null; class_number?: string | null }>)
          .map((item) => {
            const classNum = item.class_number || "";
            const subclass = item.subclass || "";
            if (classNum && subclass) {
              return `${classNum}-${subclass}`;
            }
            return classNum || subclass || "";
          })
          .filter((item: string) => item.trim().length > 0);
      }
      // Nếu là mảng string
      if (typeof firstItem === "string") {
        return (locarno_list as string[])
          .filter((entry) => typeof entry === "string" && entry.trim().length > 0)
          .map((entry) => entry.trim());
      }
    }
    // Nếu locarno_list là string
    if (typeof locarno_list === "string" && locarno_list.trim().length > 0) {
      return [locarno_list.trim()];
    }
    return [];
  })();

  return locarnoLines.length > 0 ? locarnoLines.join(", ") : null;
};

// Chuẩn hóa dữ liệu kiểu dáng công nghiệp về dạng SelectedIpItem
const normalizeIndustrialDesign = (
  item: IndustrialDesignResponse
): SelectedIpItem => ({
  id: item.id,
  ip_type: IP_TYPES.INDUSTRIAL_DESIGN,
  name: item.name,
  application_number: item.application_number,
  certificate_number: item.certificate_number,
  group: processLocarnoList(item.locarno_list, item.locarno_list_raw),
  status:
    item.wipo_status ||
    (item.certificate_number ? "Cấp bằng" : "Đang giải quyết"),
  products: null,
});

// Modal tìm kiếm và chọn IP với debounce khi nhập từ khóa
export default function IpSearchModal({
  open,
  onOpenChange,
  ipType,
  initialSelected,
  onConfirm,
}: IpSearchModalProps) {
  const [ipSearch, setIpSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [ipResults, setIpResults] = useState<
    Array<TrademarkResponse | IndustrialDesignResponse>
  >([]);
  const [selectedInModal, setSelectedInModal] = useState<SelectedIpItem[]>([]);

  // Đồng bộ danh sách IP đã chọn mỗi khi mở modal
  useEffect(() => {
    if (open) {
      setSelectedInModal(initialSelected || []);
    }
  }, [open, initialSelected]);

  // Tự động tìm kiếm theo từ khóa với debounce
  useEffect(() => {
    const trimmed = ipSearch.trim();
    if (!trimmed) {
      setIpResults([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void handleSearch(trimmed);
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ipSearch, ipType]);

  const handleSearch = async (keyword: string) => {
    setIsSearching(true);
    try {
      if (ipType === IP_TYPES.TRADEMARK) {
        const res = await trademarkService.search({
          search: keyword,
          page: 1,
          page_size: 50,
        });
        setIpResults(res.items || []);
      } else if (ipType === IP_TYPES.INDUSTRIAL_DESIGN) {
        const res = await industrialDesignsService.get({
          search: keyword,
          page: 1,
          page_size: 50,
        });
        setIpResults(res.items || []);
      } else {
        setIpResults([]);
      }
    } catch (error) {
      console.error("Tìm kiếm IP lỗi", error);
      toast.error("Không thể tìm kiếm IP, vui lòng thử lại");
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSelectIp = (rawItem: TrademarkResponse | IndustrialDesignResponse) => {
    let normalized: SelectedIpItem;
    if ("nice_class_list" in rawItem) {
      normalized = normalizeTrademark(rawItem as TrademarkResponse);
    } else {
      normalized = normalizeIndustrialDesign(
        rawItem as IndustrialDesignResponse
      );
    }

    const exists = selectedInModal.some((ip) => ip.id === normalized.id);
    if (exists) {
      setSelectedInModal(selectedInModal.filter((ip) => ip.id !== normalized.id));
    } else {
      setSelectedInModal([...selectedInModal, normalized]);
    }
  };

  const isChecked = (id: number) =>
    selectedInModal.some((ip) => ip.id === id);

  const handleConfirm = () => {
    onConfirm(selectedInModal);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-5xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Tìm và chọn tài sản IP</DialogTitle>
        </DialogHeader>

        {/* Thanh search cố định */}
        <div className="space-y-2 pb-4">
          <label className="text-sm font-medium text-gray-700">
            Từ khóa tìm kiếm
          </label>
          <Input
            value={ipSearch}
            onChange={(e) => setIpSearch(e.target.value)}
            placeholder="Nhập tên, số đơn"
          />
        </div>

        {/* Kết quả có scroll riêng, không làm trôi search / action */}
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 w-10">
                    <span className="sr-only">Chọn</span>
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Tên IP
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Số đơn
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Số bằng
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Nhóm / Phân loại
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {isSearching ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Đang tìm kiếm dữ liệu...
                    </td>
                  </tr>
                ) : ipResults.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Chưa có kết quả. Vui lòng nhập từ khóa để tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  ipResults.map((item) => {
                    const id = item.id;
                    const name = item.name || null;
                    const applicationNumber = item.application_number || null;
                    const certificateNumber =
                      item.certificate_number || null;

                    let group: string | null = null;
                    if ("nice_class_list" in item) {
                      group =
                        (item as TrademarkResponse).nice_class_text ||
                        ((item as TrademarkResponse).nice_class_list || [])
                          .join(", ") ||
                        null;
                    } else if ("locarno_list" in item) {
                      const industrialDesignItem = item as IndustrialDesignResponse;
                      group = processLocarnoList(
                        industrialDesignItem.locarno_list,
                        industrialDesignItem.locarno_list_raw
                      );
                    }

                    const status =
                      item.wipo_status ||
                      (item.certificate_number
                        ? "Cấp bằng"
                        : "Đang giải quyết");

                    return (
                      <tr key={id} className="border-t">
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked(id)}
                            onChange={() => toggleSelectIp(item)}
                          />
                        </td>
                        <td className="px-4 py-2">{name || "-"}</td>
                        <td className="px-4 py-2">
                          {applicationNumber || "-"}
                        </td>
                        <td className="px-4 py-2">
                          {certificateNumber || "-"}
                        </td>
                        <td className="px-4 py-2 max-w-xs truncate">
                          {group || "-"}
                        </td>
                        <td className="px-4 py-2">{status || "-"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action footer cố định */}
        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={selectedInModal.length === 0}
          >
            Xác nhận
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


