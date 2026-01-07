"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { CustomField } from "@/services/custom-fields.service";

interface EditCustomFieldValueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customField: CustomField | null;
  currentValue: string | null;
  applicationNumber: string;
  onUpdate: (data: { custom_field_id: number; application_numbers: string[]; value: string | null }) => Promise<void>;
  isUpdating?: boolean;
}

export default function EditCustomFieldValueModal({
  open,
  onOpenChange,
  customField,
  currentValue,
  applicationNumber,
  onUpdate,
  isUpdating = false,
}: EditCustomFieldValueModalProps) {
  const [fieldValue, setFieldValue] = useState("");

  // Reset form khi mở modal hoặc customField thay đổi
  useEffect(() => {
    if (open && customField) {
      setFieldValue(currentValue || "");
    }
  }, [open, customField, currentValue]);

  const handleSubmit = async () => {
    if (!customField) return;

    await onUpdate({
      custom_field_id: customField.id,
      application_numbers: [applicationNumber],
      value: fieldValue.trim() || null,
    });
  };

  if (!customField) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa giá trị trường nội bộ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Trường nội bộ
            </Label>
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 px-3 py-2 rounded">
              {customField.alias_name.toUpperCase()}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Số đơn
            </Label>
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 px-3 py-2 rounded">
              {applicationNumber}
            </div>
          </div>
          <div>
            <Label htmlFor="field-value" className="text-sm font-medium mb-2 block">
              Giá trị
            </Label>
            <Input
              id="field-value"
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              placeholder="Nhập giá trị..."
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              "Cập nhật"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

