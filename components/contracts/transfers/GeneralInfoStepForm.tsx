import type React from "react";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BaseSelect, {
  type SelectOption,
} from "@/components/common/select/base-select";
import { DatePickerSingle } from "@/components/common/date/date-picker-single";
import { TRANSFER_METHODS, TRANSFER_TYPES } from "@/constants/transfer";

export type GeneralInfoStepFormValues = {
  transfer_method: string;
  transfer_type: string;
  doc_number: string;
  sign_date?: string;
  status: string;
};

export type GeneralInfoStepFormProps = {
  control: Control<GeneralInfoStepFormValues>;
  errors: FieldErrors<GeneralInfoStepFormValues>;
  selectedTransferMethod: string;
  selectedTransferType: string;
  selectedStatus: string;
  statusOptions: SelectOption[];
  isSavingDraft: boolean;
  isSubmitting: boolean;
  onSaveDraft: () => void;
  onNextStep: (event?: React.BaseSyntheticEvent) => void;
  onBack: () => void;
  meFullname?: string;
  setValue: UseFormSetValue<GeneralInfoStepFormValues>;
};

export default function GeneralInfoStepForm({
  control,
  errors,
  selectedTransferMethod,
  selectedTransferType,
  selectedStatus,
  statusOptions,
  isSavingDraft,
  isSubmitting,
  onSaveDraft,
  onNextStep,
  onBack,
  meFullname,
  setValue,
}: GeneralInfoStepFormProps) {
  return (
    <form className="space-y-6" onSubmit={onNextStep}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Hình thức chuyển nhượng <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="transfer_method"
            render={() => (
              <BaseSelect
                options={TRANSFER_METHODS}
                value={
                  TRANSFER_METHODS.find(
                    (opt) => opt.value === selectedTransferMethod
                  ) || null
                }
                onChange={(option) =>
                  setValue(
                    "transfer_method",
                    (option as SelectOption | null)?.value as string
                  )
                }
                placeholder="Chọn hình thức chuyển nhượng"
                error={errors.transfer_method?.message}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Mã hợp đồng/ công văn <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="doc_number"
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Nhập mã hợp đồng/ công văn"
                className={errors.doc_number ? "border-red-500" : ""}
              />
            )}
          />
          {errors.doc_number?.message && (
            <p className="text-sm text-red-500">{errors.doc_number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Loại chuyển nhượng <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="transfer_type"
            render={() => (
              <BaseSelect
                options={TRANSFER_TYPES}
                value={
                  TRANSFER_TYPES.find(
                    (opt) => opt.value === selectedTransferType
                  ) || null
                }
                onChange={(option) =>
                  setValue(
                    "transfer_type",
                    (option as SelectOption | null)?.value as string
                  )
                }
                placeholder="Chọn loại chuyển nhượng"
                error={errors.transfer_type?.message}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Ngày ký</label>
          <Controller
            control={control}
            name="sign_date"
            render={({ field }) => (
              <DatePickerSingle
                value={field.value}
                onChange={(value) => field.onChange(value)}
                placeholder="dd/mm/yyyy"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Trạng thái <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="status"
            render={() => (
              <BaseSelect
                options={statusOptions}
                value={
                  statusOptions.find((opt) => opt.value === selectedStatus) ||
                  null
                }
                onChange={(option) =>
                  setValue(
                    "status",
                    (option as SelectOption | null)?.value as string
                  )
                }
                placeholder="Chọn trạng thái"
                error={errors.status?.message}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Người tạo</label>
          <Input
            value={meFullname || "Đang cập nhật"}
            disabled
            className="bg-gray-100"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Quay lại
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isSavingDraft}
          onClick={onSaveDraft}
        >
          {isSavingDraft ? "Đang lưu..." : "Lưu nháp"}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang xử lý..." : "Tiếp tục"}
        </Button>
      </div>
    </form>
  );
}


