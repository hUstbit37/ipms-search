import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import SingleSelect from "@/components/common/select/single-select";
import { SelectOption } from "@/components/common/select/base-select";
import { DateRangePicker } from "@/components/common/date/date-range-picker";
import { DateRange } from "react-day-picker";
import { Search } from "lucide-react";

export type LicenseFilters = {
  license_method: SelectOption | null;
  license_type: SelectOption | null;
  licensor_site_id: SelectOption | null;
  licensee_site_id: SelectOption | null;
  goods_name: string;
  nice_group: string;
  status: SelectOption | null;
  sign_date: DateRange | undefined;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: LicenseFilters;
  onFilterChange: (key: keyof LicenseFilters, value: SelectOption | string | DateRange | null | undefined) => void;
  onApply: () => void;
  onClear: () => void;
  labels: {
    license_method: string;
    license_type: string;
    licensor_site_id: string;
    licensee_site_id: string;
    goods_name: string;
    nice_group: string;
    status: string;
    sign_date: string;
  };
  companyOptions: SelectOption[];
  licenseMethods: SelectOption[];
  licenseTypes: SelectOption[];
  statusOptions: SelectOption[];
};

export function LicenseAdvancedSearchModal({
  open,
  onOpenChange,
  filters,
  onFilterChange,
  onApply,
  onClear,
  labels,
  companyOptions,
  licenseMethods,
  licenseTypes,
  statusOptions,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Truy vấn nâng cao</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SingleSelect
            label={labels.license_method}
            options={licenseMethods}
            value={filters.license_method}
            onChange={(value) => onFilterChange("license_method", value)}
            placeholder="-Tất cả-"
            size="sm"
          />

          <SingleSelect
            label={labels.license_type}
            options={licenseTypes}
            value={filters.license_type}
            onChange={(value) => onFilterChange("license_type", value)}
            placeholder="-Tất cả-"
            size="sm"
          />

          <SingleSelect
            label={labels.licensor_site_id}
            options={companyOptions}
            value={filters.licensor_site_id}
            onChange={(value) => onFilterChange("licensor_site_id", value)}
            placeholder="-Tất cả-"
            size="sm"
          />

          <SingleSelect
            label={labels.licensee_site_id}
            options={companyOptions}
            value={filters.licensee_site_id}
            onChange={(value) => onFilterChange("licensee_site_id", value)}
            placeholder="-Tất cả-"
            size="sm"
          />

          <div>
            <label className="text-sm font-medium mb-1 block">{labels.goods_name}</label>
            <Input
              value={filters.goods_name}
              onChange={(e) => onFilterChange("goods_name", e.target.value)}
              placeholder="Nhập sản phẩm"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">{labels.nice_group}</label>
            <Input
              value={filters.nice_group}
              onChange={(e) => onFilterChange("nice_group", e.target.value)}
              placeholder="Nhập nhóm sản phẩm"
              className="w-full"
            />
          </div>

          <SingleSelect
            label={labels.status}
            options={statusOptions}
            value={filters.status}
            onChange={(value) => onFilterChange("status", value)}
            placeholder="-Tất cả-"
            size="sm"
          />

          <div>
            <label className="text-sm font-medium mb-1 block">{labels.sign_date}</label>
            <DateRangePicker
              date={filters.sign_date}
              onDateChange={(date) => onFilterChange("sign_date", date)}
              placeholder="Chọn khoảng thời gian"
              showPresets={true}
              dateFormat="dd/MM/yyyy"
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => {
              onClear();
            }}
          >
            Xóa bộ lọc
          </Button>
          <Button
            onClick={() => {
              onApply();
            }}
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Tìm kiếm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

