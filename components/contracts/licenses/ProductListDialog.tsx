"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";
import type { SelectedIpItem } from "./IpSearchModal";

type ProductGroup = {
  niceClass: string;
  productText: string;
  selected: boolean;
};

type ProductListDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ip: SelectedIpItem | null;
  onSaveProducts?: (
    ipId: number,
    products: Array<{ goods_name: string | null; group: string | null }> | null
  ) => void;
};

// Component hiển thị dialog danh sách sản phẩm với các nhóm Nice class
export default function ProductListDialog({
  open,
  onOpenChange,
  ip,
  onSaveProducts,
}: ProductListDialogProps) {
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);

  // Khởi tạo dữ liệu từ nice_class_list
  useEffect(() => {
    if (!ip || !open) {
      setProductGroups([]);
      return;
    }

    const niceClasses = ip.nice_class_list || [];

    const existingProducts = ip.products || [];

    // Tạo các nhóm sản phẩm từ nice_class_list
    // Mỗi nice class sẽ là một card nhóm sản phẩm
    const groups: ProductGroup[] = niceClasses.map((niceClass) => {
      const matched = existingProducts.find((p) => p.group === niceClass);
      return {
        niceClass,
        productText: matched?.goods_name || "",
        selected: Boolean(matched?.group),
      };
    });

    setProductGroups(groups);
  }, [ip, open]);

  // Xử lý toggle checkbox cho nhóm
  const handleToggleGroup = (niceClass: string) => {
    setProductGroups((prev) =>
      prev.map((group) =>
        group.niceClass === niceClass
          ? { ...group, selected: !group.selected }
          : group
      )
    );
  };

  // Xử lý thay đổi input text sản phẩm
  const handleProductTextChange = (niceClass: string, value: string) => {
    setProductGroups((prev) =>
      prev.map((group) =>
        group.niceClass === niceClass
          ? { ...group, productText: value }
          : group
      )
    );
  };

  // Xử lý lưu
  const handleSave = () => {
    if (!ip) {
      onOpenChange(false);
      return;
    }

    const products = productGroups
      .filter((group) => group.selected && group.productText.trim().length > 0)
      .map((group) => ({
        goods_name: group.productText.trim(),
        group: group.niceClass,
      }));

    onSaveProducts?.(ip.id, products.length > 0 ? products : null);
    onOpenChange(false);
  };

  const selectedCount = productGroups.filter((g) => g.selected).length;
  const totalCount = productGroups.length;

  if (!ip) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            IP: {ip.id}_Danh Sách Sản Phẩm
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 mb-4 text-sm text-gray-600">
          Đã chọn: {selectedCount}/{totalCount} nhóm sản phẩm
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {productGroups.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Không có nhóm sản phẩm
            </div>
          ) : (
            productGroups.map((group, index) => {
              // Lấy mô tả từ nice_class_list_raw tương ứng với index của nhóm trong nice_class_list
              const descriptions = ip.nice_class_list_raw || [];
              const description = descriptions[index] || null;

              return (
                <div
                  key={group.niceClass}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`group-${group.niceClass}`}
                      checked={group.selected}
                      onCheckedChange={() => handleToggleGroup(group.niceClass)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`group-${group.niceClass}`}
                        className="text-sm font-medium text-gray-900 cursor-pointer block"
                      >
                        Nhóm sản phẩm: {group.niceClass}
                      </label>
                      {description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Sản phẩm
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={group.productText}
                        onChange={(e) =>
                          handleProductTextChange(group.niceClass, e.target.value)
                        }
                        placeholder="Nhập sản phẩm"
                        className="pr-8"
                        disabled={!group.selected}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button type="button" onClick={handleSave}>
            Lưu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

