"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DatePickerSingle } from "@/components/common/date/date-picker-single";

interface AdvancedFilters {
  ownerCountry: string;
  applicationCountry: string;
  publicationCountry: string;
  priorityCountry: string;
  locarnoClass: string;
  productCategory: string;
  designDomain: string;
  applicationDate: string;
  publicationDate: string;
  certificateDate: string;
  expiryDate: string;
  priorityDate: string;
  applicant: string;
  representative: string;
  certificateNumber: string;
  applicationNumber: string;
  basicApplicationNumber: string;
  priorityNumber: string;
  designName: string;
  designType: string;
  goodsDescription: string;
  status: string;
  certificateStatus: string;
  recordType: string;
}

interface AdvancedSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  advancedFilters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function AdvancedSearchModal({
  open,
  onOpenChange,
  advancedFilters,
  onFiltersChange,
  onSearch,
  onReset,
}: AdvancedSearchModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-white dark:bg-zinc-950 z-10">
          <DialogTitle>Truy vấn nâng cao</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 overflow-y-auto flex-1 px-6 py-4 min-h-0">
          {/* Các nước */}
          <div>
            <button
              onClick={() => {
                const el = document.querySelector('[data-group="countries"]');
                if (el) el.classList.toggle('hidden');
              }}
              className="flex items-center gap-2 font-semibold text-sm cursor-pointer hover:text-blue-600 w-full"
            >
              <span>▶</span>
              <span>Các nước</span>
            </button>
            <div data-group="countries" className="space-y-2 ml-4 mt-2">
              <div>
                <label className="text-xs font-medium block mb-1">Mã Nước chủ đơn/Chủ bằng</label>
                <Input
                  placeholder="VN, US, JP..."
                  className="text-sm"
                  value={advancedFilters.ownerCountry}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      ownerCountry: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Mã Nước nộp đơn</label>
                <Input
                  placeholder="VN, US, JP..."
                  className="text-sm"
                  value={advancedFilters.applicationCountry}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      applicationCountry: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Mã Nước công bố</label>
                <Input
                  placeholder="VN, US, JP..."
                  className="text-sm"
                  value={advancedFilters.publicationCountry}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      publicationCountry: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Mã Nước của đơn ưu tiên</label>
                <Input
                  placeholder="VN, US, JP..."
                  className="text-sm"
                  value={advancedFilters.priorityCountry}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      priorityCountry: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Phân loại */}
          <div>
            <button
              onClick={() => {
                const el = document.querySelector('[data-group="categories"]');
                if (el) el.classList.toggle('hidden');
              }}
              className="flex items-center gap-2 font-semibold text-sm cursor-pointer hover:text-blue-600 w-full"
            >
              <span>▶</span>
              <span>Phân loại</span>
            </button>
            <div data-group="categories" className="space-y-2 ml-4 mt-2">
              <div>
                <label className="text-xs font-medium block mb-1">Phân loại Locarno</label>
                <Input
                  placeholder="Nhập phân loại Locarno..."
                  className="text-sm"
                  value={advancedFilters.locarnoClass}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      locarnoClass: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Danh mục sản phẩm</label>
                <Input
                  placeholder="Nhập danh mục..."
                  className="text-sm"
                  value={advancedFilters.productCategory}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      productCategory: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Lĩnh vực thiết kế</label>
                <Input
                  placeholder="Nhập lĩnh vực..."
                  className="text-sm"
                  value={advancedFilters.designDomain}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      designDomain: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Ngày */}
          <div>
            <button
              onClick={() => {
                const el = document.querySelector('[data-group="dates"]');
                if (el) el.classList.toggle('hidden');
              }}
              className="flex items-center gap-2 font-semibold text-sm cursor-pointer hover:text-blue-600 w-full"
            >
              <span>▶</span>
              <span>Ngày</span>
            </button>
            <div data-group="dates" className="space-y-3 ml-4 mt-2">
              <div>
                <label className="text-xs font-medium block mb-1">Ngày nộp đơn</label>
                <DatePickerSingle
                  value={advancedFilters.applicationDate}
                  onChange={(date) =>
                    onFiltersChange({
                      ...advancedFilters,
                      applicationDate: date,
                    })
                  }
                  placeholder="Chọn ngày nộp đơn"
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Ngày công bố</label>
                <DatePickerSingle
                  value={advancedFilters.publicationDate}
                  onChange={(date) =>
                    onFiltersChange({
                      ...advancedFilters,
                      publicationDate: date,
                    })
                  }
                  placeholder="Chọn ngày công bố"
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Ngày cấp</label>
                <DatePickerSingle
                  value={advancedFilters.certificateDate}
                  onChange={(date) =>
                    onFiltersChange({
                      ...advancedFilters,
                      certificateDate: date,
                    })
                  }
                  placeholder="Chọn ngày cấp"
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Ngày hết hạn</label>
                <DatePickerSingle
                  value={advancedFilters.expiryDate}
                  onChange={(date) =>
                    onFiltersChange({
                      ...advancedFilters,
                      expiryDate: date,
                    })
                  }
                  placeholder="Chọn ngày hết hạn"
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Ngày ưu tiên</label>
                <DatePickerSingle
                  value={advancedFilters.priorityDate}
                  onChange={(date) =>
                    onFiltersChange({
                      ...advancedFilters,
                      priorityDate: date,
                    })
                  }
                  placeholder="Chọn ngày ưu tiên"
                />
              </div>
            </div>
          </div>

          {/* Tên người */}
          <div>
            <button
              onClick={() => {
                const el = document.querySelector('[data-group="owner"]');
                if (el) el.classList.toggle('hidden');
              }}
              className="flex items-center gap-2 font-semibold text-sm cursor-pointer hover:text-blue-600 w-full"
            >
              <span>▶</span>
              <span>Tên người</span>
            </button>
            <div data-group="owner" className="space-y-2 ml-4 mt-2">
              <div>
                <label className="text-xs font-medium block mb-1">Chủ đơn/Chủ bằng</label>
                <Input
                  placeholder="Nhập tên chủ đơn..."
                  className="text-sm"
                  value={advancedFilters.applicant}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      applicant: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Đại diện SHCN</label>
                <Input
                  placeholder="Nhập tên đại diện..."
                  className="text-sm"
                  value={advancedFilters.representative}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      representative: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Số */}
          <div>
            <button
              onClick={() => {
                const el = document.querySelector('[data-group="numbers"]');
                if (el) el.classList.toggle('hidden');
              }}
              className="flex items-center gap-2 font-semibold text-sm cursor-pointer hover:text-blue-600 w-full"
            >
              <span>▶</span>
              <span>Số</span>
            </button>
            <div data-group="numbers" className="space-y-2 ml-4 mt-2">
              <div>
                <label className="text-xs font-medium block mb-1">Số bằng</label>
                <Input
                  placeholder="Nhập số bằng..."
                  className="text-sm"
                  value={advancedFilters.certificateNumber}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      certificateNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Số đơn</label>
                <Input
                  placeholder="Nhập số đơn..."
                  className="text-sm"
                  value={advancedFilters.applicationNumber}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      applicationNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Số đơn góc</label>
                <Input
                  placeholder="Nhập số đơn góc..."
                  className="text-sm"
                  value={advancedFilters.basicApplicationNumber}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      basicApplicationNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Số ưu tiên</label>
                <Input
                  placeholder="Nhập số ưu tiên..."
                  className="text-sm"
                  value={advancedFilters.priorityNumber}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      priorityNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Mục khác */}
          <div>
            <button
              onClick={() => {
                const el = document.querySelector('[data-group="other"]');
                if (el) el.classList.toggle('hidden');
              }}
              className="flex items-center gap-2 font-semibold text-sm cursor-pointer hover:text-blue-600 w-full"
            >
              <span>▶</span>
              <span>Mục khác</span>
            </button>
            <div data-group="other" className="space-y-2 ml-4 mt-2">
              <div>
                <label className="text-xs font-medium block mb-1">Tên thiết kế</label>
                <Input
                  placeholder="Nhập tên thiết kế..."
                  className="text-sm"
                  value={advancedFilters.designName}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      designName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Loại thiết kế</label>
                <Input
                  placeholder="Nhập loại thiết kế..."
                  className="text-sm"
                  value={advancedFilters.designType}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      designType: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Mô tả sản phẩm</label>
                <Input
                  placeholder="Nhập mô tả..."
                  className="text-sm"
                  value={advancedFilters.goodsDescription}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      goodsDescription: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 border-t bg-white dark:bg-zinc-950">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onReset();
            }}
          >
            Xóa bộ lọc
          </Button>
          <Button onClick={onSearch} className="bg-blue-600 hover:bg-blue-700">
            Tìm kiếm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
