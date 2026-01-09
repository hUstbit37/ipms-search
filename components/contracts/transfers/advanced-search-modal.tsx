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

export type TransferFilters = {
  transfer_method: SelectOption | null;
  transfer_type: SelectOption | null;
  transferor_site_id: SelectOption | null;
  transferee_site_id: SelectOption | null;
  goods_name: string;
  nice_group: string;
  status: SelectOption | null;
  sign_date: DateRange | undefined;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TransferFilters;
  onFilterChange: (key: keyof TransferFilters, value: SelectOption | string | DateRange | null | undefined) => void;
  onApply: () => void;
  onClear: () => void;
  labels: {
    transfer_method: string;
    transfer_type: string;
    transferor_site_id: string;
    transferee_site_id: string;
    goods_name: string;
    nice_group: string;
    status: string;
    sign_date: string;
  };
  companyOptions: SelectOption[];
  transferMethods: SelectOption[];
  transferTypes: SelectOption[];
  statusOptions: SelectOption[];
};

export function TransferAdvancedSearchModal({
  open,
  onOpenChange,
  filters,
  onFilterChange,
  onApply,
  onClear,
  labels,
  companyOptions,
  transferMethods,
  transferTypes,
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
            label={labels.transfer_method}
            options={transferMethods}
            value={filters.transfer_method}
            onChange={(value) => onFilterChange("transfer_method", value)}
            placeholder="-Tất cả-"
            size="sm"
          />

          <SingleSelect
            label={labels.transfer_type}
            options={transferTypes}
            value={filters.transfer_type}
            onChange={(value) => onFilterChange("transfer_type", value)}
            placeholder="-Tất cả-"
            size="sm"
          />

          <SingleSelect
            label={labels.transferor_site_id}
            options={companyOptions}
            value={filters.transferor_site_id}
            onChange={(value) => onFilterChange("transferor_site_id", value)}
            placeholder="-Tất cả-"
            size="sm"
          />

          <SingleSelect
            label={labels.transferee_site_id}
            options={companyOptions}
            value={filters.transferee_site_id}
            onChange={(value) => onFilterChange("transferee_site_id", value)}
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

