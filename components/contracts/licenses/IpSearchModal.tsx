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

// Kiểu dữ liệu IP được chọn dùng chung giữa form và modal
export type SelectedIpItem = {
  id: number;
  ip_type: IpType;
  name: string | null;
  application_number: string | null;
  certificate_number: string | null;
  group: string | null;
  status: string | null;
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
});

// Chuẩn hóa dữ liệu kiểu dáng công nghiệp về dạng SelectedIpItem
const normalizeIndustrialDesign = (
  item: IndustrialDesignResponse
): SelectedIpItem => ({
  id: item.id,
  ip_type: IP_TYPES.INDUSTRIAL_DESIGN,
  name: item.name,
  application_number: item.application_number,
  certificate_number: item.certificate_number,
  group: Array.isArray(item.locarno_list)
    ? item.locarno_list.join(", ")
    : item.locarno_list || null,
  status:
    item.wipo_status ||
    (item.certificate_number ? "Cấp bằng" : "Đang giải quyết"),
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
                      const locarno = (item as IndustrialDesignResponse)
                        .locarno_list;
                      group = Array.isArray(locarno)
                        ? locarno.join(", ")
                        : locarno || null;
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


