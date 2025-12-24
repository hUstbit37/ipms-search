import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateFilterProps {
  dateType: "application" | "certificate";
  onDateTypeChange: (value: "application" | "certificate") => void;
  preset?: string;
  onPresetChange?: (value: string) => void;
}

const presetOptions = [
  { value: "today", label: "Hôm nay" },
  { value: "last_7_days", label: "7 ngày qua" },
  { value: "last_30_days", label: "30 ngày qua" },
  { value: "last_6_months", label: "6 tháng qua" },
  { value: "last_1_year", label: "1 năm qua" },
  { value: "all", label: "Toàn bộ" },
  { value: "custom", label: "Tùy chỉnh" },
];

export const DateFilter = ({
  dateType,
  onDateTypeChange,
  preset = "all",
  onPresetChange,
}: DateFilterProps) => {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-1">
        <Button
          variant={dateType === "application" ? "default" : "ghost"}
          size="sm"
          onClick={() => onDateTypeChange("application")}
          className="text-xs"
        >
          Ngày nộp đơn
        </Button>
        <Button
          variant={dateType === "certificate" ? "default" : "ghost"}
          size="sm"
          onClick={() => onDateTypeChange("certificate")}
          className="text-xs"
        >
          Ngày cấp bằng
        </Button>
      </div>

      {onPresetChange && (
        <Select value={preset} onValueChange={onPresetChange}>
          <SelectTrigger className="w-40 bg-card">
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {presetOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
