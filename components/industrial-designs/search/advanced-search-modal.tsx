"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DateRangePicker } from "@/components/common/date/date-range-picker";

interface AdvancedFilters {
  ownerCountry: string;
  applicationCountry: string;
  publicationCountry: string;
  priorityCountry: string;
  niceClass: string;
  productCategory: string;
  designDomain: string;
  applicationDateFrom: string;
  applicationDateTo: string;
  publicationDateFrom: string;
  publicationDateTo: string;
  certificateDateFrom: string;
  certificateDateTo: string;
  expiryDateFrom: string;
  expiryDateTo: string;
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
      <DialogContent className="max-w-6xl min-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-2 border-b sticky top-0 bg-white dark:bg-zinc-950 z-10">
          <DialogTitle>Truy vấn nâng cao</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto flex-1 px-4 pt-2 pb-4 min-h-0">
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
            <div data-group="countries" className="ml-4 mt-2 flex flex-wrap items-center justify-between gap-4 w-full">
              {/* <div className="w-[49%]">
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
              </div> */}
              <div className="w-[49%]">
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
              <div className="w-[49%]">
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
              <div className="w-[49%]">
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
            <div data-group="dates" className="ml-4 mt-2 flex flex-wrap items-start justify-between gap-4">
              <div className="w-full sm:w-[49%]">
                <label className="text-xs font-medium block mb-1">Ngày nộp đơn</label>
                <DateRangePicker
                  showPresets={true}
                  date={{
                    from: advancedFilters.applicationDateFrom ? new Date(advancedFilters.applicationDateFrom) : undefined,
                    to: advancedFilters.applicationDateTo ? new Date(advancedFilters.applicationDateTo) : undefined
                  }}
                  onDateChange={(range) => {
                    onFiltersChange({
                      ...advancedFilters,
                      applicationDateFrom: range?.from ? range.from.toISOString().split('T')[0] : '',
                      applicationDateTo: range?.to ? range.to.toISOString().split('T')[0] : ''
                    });
                  }}
                  className="w-full"
                />
              </div>
              <div className="w-full sm:w-[49%]">
                <label className="text-xs font-medium block mb-1">Ngày công bố</label>
                <DateRangePicker
                  showPresets={true}
                  date={{
                    from: advancedFilters.publicationDateFrom ? new Date(advancedFilters.publicationDateFrom) : undefined,
                    to: advancedFilters.publicationDateTo ? new Date(advancedFilters.publicationDateTo) : undefined
                  }}
                  onDateChange={(range) => {
                    onFiltersChange({
                      ...advancedFilters,
                      publicationDateFrom: range?.from ? range.from.toISOString().split('T')[0] : '',
                      publicationDateTo: range?.to ? range.to.toISOString().split('T')[0] : ''
                    });
                  }}
                  className="w-full"
                />
              </div>
              <div className="w-full sm:w-[49%]">
                <label className="text-xs font-medium block mb-1">Ngày cấp</label>
                <DateRangePicker
                  showPresets={true}
                  date={{
                    from: advancedFilters.certificateDateFrom ? new Date(advancedFilters.certificateDateFrom) : undefined,
                    to: advancedFilters.certificateDateTo ? new Date(advancedFilters.certificateDateTo) : undefined
                  }}
                  onDateChange={(range) => {
                    onFiltersChange({
                      ...advancedFilters,
                      certificateDateFrom: range?.from ? range.from.toISOString().split('T')[0] : '',
                      certificateDateTo: range?.to ? range.to.toISOString().split('T')[0] : ''
                    });
                  }}
                  className="w-full"
                />
              </div>
              <div className="w-full sm:w-[49%]">
                <label className="text-xs font-medium block mb-1">Ngày hết hạn</label>
                <DateRangePicker
                  showPresets={true}
                  date={{
                    from: advancedFilters.expiryDateFrom ? new Date(advancedFilters.expiryDateFrom) : undefined,
                    to: advancedFilters.expiryDateTo ? new Date(advancedFilters.expiryDateTo) : undefined
                  }}
                  onDateChange={(range) => {
                    onFiltersChange({
                      ...advancedFilters,
                      expiryDateFrom: range?.from ? range.from.toISOString().split('T')[0] : '',
                      expiryDateTo: range?.to ? range.to.toISOString().split('T')[0] : ''
                    });
                  }}
                  className="w-full"
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
            <div data-group="owner" className="ml-4 mt-2 flex flex-wrap items-center justify-between w-full gap-4">
              <div className="w-[49%]">
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
              <div className="w-[49%]">
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
            <div data-group="numbers" className="ml-4 mt-2 flex flex-wrap items-center justify-between w-full gap-4">
              <div className="w-[49%]">
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
              <div className="w-[49%]">
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
              <div className="w-[49%]">
                <label className="text-xs font-medium block mb-1">Số đơn gốc</label>
                <Input
                  placeholder="Nhập số đơn gốc..."
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
              {/* <div className="w-[49%]">
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
              </div> */}
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
            <div data-group="categories" className="ml-4 mt-2 flex flex-wrap items-center justify-between gap-4 w-full">
              <div className="w-[32%]">
                <label className="text-xs font-medium block mb-1">Phân loại Locarno</label>
                <Input
                  placeholder="Nhập phân loại Locarno..."
                  className="text-sm"
                  value={advancedFilters.niceClass}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      niceClass: e.target.value,
                    })
                  }
                />
              </div>
              {/* <div className="w-[32%]">
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
              <div className="w-[32%]">
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
              </div> */}
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
            <div data-group="other" className="ml-4 mt-2 flex flex-wrap items-center justify-between w-full gap-4">
              <div className="w-[32%]">
                <label className="text-xs font-medium block mb-1">Tên KDCN</label>
                <Input
                  placeholder="Nhập tên KDCN..."
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
              {/* <div className="w-[32%]">
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
              </div> */}
              {/* <div className="w-[32%]">
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
              </div> */}
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
