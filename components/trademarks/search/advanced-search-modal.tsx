"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DatePickerSingle } from "@/components/common/date/date-picker-single";
import { DateRangePicker } from "@/components/common/date/date-range-picker";

interface AdvancedFilters {
  ownerCountry: string;
  applicationCountry: string;
  publicationCountry: string;
  priorityCountry: string; //mã nước của đơn ưu tiên
  niceClass: string; //nhóm sản phẩm dịch vụ nice
  productCategory: string; //danh mục sản phẩm
  viennaClass: string;
  applicationDateFrom: string; //ngày nộp đơn từ
  applicationDateTo: string; //ngày nộp đơn đến
  publicationDateFrom: string; //ngày công bố từ
  publicationDateTo: string; //ngày công bố đến
  certificateDateFrom: string; //ngày cấp bằng từ
  certificateDateTo: string; //ngày cấp bằng đến
  expiryDateFrom: string; //ngày hết hạn từ
  expiryDateTo: string; //ngày hết hạn đến
  priorityDate: string; //ngày ưu tiên
  applicant: string; //chủ đơn/chủ bằng
  representative: string; //đại diện sở hữu công nghiệp
  certificateNumber: string; //số bằng
  applicationNumber: string; //số đơn
  basicApplicationNumber: string; //số đơn gốc
  priorityNumber: string; //số ưu tiên
  tradeName: string; //tên thương mại
  colorClaim: string; //yêu cầu màu sắc
  goodsServices: string; //hàng hóa/dịch vụ
  status: string; //trạng thái
  certificateStatus: string; //trạng thái cấp bằng
  recordType: string; //loại hồ sơ
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
        <DialogHeader className="px-4 pt-4 pb-4 border-b sticky top-0 bg-white dark:bg-zinc-950 z-10">
          <DialogTitle>Truy vấn nâng cao</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 overflow-y-auto flex-1 px-6 py-4 min-h-0 w-full">
          {/* Các nước */}
          <div className="w-full">
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
            <div data-group="countries" className="ml-4 mt-2 flex flex-wrap justify-between items-center w-full gap-4">
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
              {/* <div className="w-[49%]">
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
              </div> */}
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
            <div data-group="categories" className="ml-4 mt-2 flex flex-wrap items-center justify-between w-full gap-4">
              <div className="w-[32%]">
                <label className="text-xs font-medium block mb-1">Nhóm sản phẩm/dịch vụ</label>
                <Input
                  placeholder="Nhập phân loại..."
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
              <div className="w-[32%]">
                <label className="text-xs font-medium block mb-1">Danh mục sản phẩm dịch vụ</label>
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
                <label className="text-xs font-medium block mb-1">Phân loại Viện</label>
                <Input
                  placeholder="Nhập phân loại..."
                  className="text-sm"
                  value={advancedFilters.viennaClass}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      viennaClass: e.target.value,
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
            <div data-group="dates" className="space-y-3 ml-4 mt-2 flex items-center flex-wrap justify-between gap-4">
              <div className="w-[49%]">
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
              <div className="w-[49%]">
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
              <div className="w-[49%]">
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
              <div className="w-[49%]">
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
              {/* <div className="w-full">
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
              </div> */}
            </div>
          </div>

          {/* Tên người */}
          <div>
            <button
              onClick={() => {
                const el = document.querySelector('[data-group="owner"]');
                if (el) el.classList.toggle('hidden');
              }}
              className="flex items-center gap-2 font-semibold text-sm cursor-pointer hover:text-blue-600 w-full gap-4"
            >
              <span>▶</span>
              <span>Chủ đơn/Đại diện</span>
            </button>
            <div data-group="owner" className="ml-4 mt-2 flex items-center flex-wrap justify-between">
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
            <div data-group="numbers" className="ml-4 mt-2 flex items-center flex-wrap justify-between w-full gap-4">
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
              <div className="w-[49%]">
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
              className="flex items-center gap-2 font-semibold text-sm cursor-pointer hover:text-blue-600 w-full gap-4"
            >
              <span>▶</span>
              <span>Mục khác</span>
            </button>
            <div data-group="other" className="ml-4 mt-2 flex items-center flex-wrap justify-between gap-4">
              {/* <div className="w-[49%]">
                <label className="text-xs font-medium block mb-1">Định danh</label>
                <Input
                  placeholder="Nhập định danh..."
                  className="text-sm"
                />
              </div> */}
              <div className="w-[49%]">
                <label className="text-xs font-medium block mb-1">Nhãn hiệu</label>
                <Input
                  placeholder="Nhập tên nhãn hiệu..."
                  className="text-sm"
                  value={advancedFilters.tradeName}
                  onChange={(e) =>
                    onFiltersChange({
                      ...advancedFilters,
                      tradeName: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-4 pb-4 pt-4 border-t bg-white dark:bg-zinc-950">
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
