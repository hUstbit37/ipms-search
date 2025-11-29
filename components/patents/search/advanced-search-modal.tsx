"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DatePickerSingle } from "@/components/common/date/date-picker-single";

interface AdvancedFilters {
  applicationNumber: string;
  applicant: string;
  name: string;
  ipcClassification: string;
  applicationDate: string;
  publicationDate: string;
  certificateDate: string;
  expiryDate: string;
  countryCode: string;
  status: string;
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
          <DialogTitle>Tìm kiếm nâng cao Sáng chế</DialogTitle>
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
                <label className="text-xs font-medium block mb-1">Mã Nước chủ đơn</label>
                <Input
                  placeholder="VN, US, JP..."
                  className="text-sm"
                  value={advancedFilters.countryCode}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      countryCode: e.target.value,
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
                <label className="text-xs font-medium block mb-1">Phân loại IPC</label>
                <Input
                  placeholder="H04L, G06F..."
                  className="text-sm"
                  value={advancedFilters.ipcClassification}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      ipcClassification: e.target.value,
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
                <label className="text-xs font-medium block mb-1">Chủ đơn</label>
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
                <label className="text-xs font-medium block mb-1">Tên sáng chế</label>
                <Input
                  placeholder="Nhập tên sáng chế..."
                  className="text-sm"
                  value={advancedFilters.name}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Trạng thái</label>
                <Input
                  placeholder="Cấp bằng, Đang xử lý..."
                  className="text-sm"
                  value={advancedFilters.status}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      status: e.target.value,
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
