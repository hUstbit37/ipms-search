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
import { LICENSE_METHODS, LICENSE_TYPES } from "@/constants/license";

export type GeneralInfoStepFormValues = {
  license_method: string;
  license_type: string;
  doc_number: string;
  sign_date?: string;
  status: string;
};

export type GeneralInfoStepFormProps = {
  control: Control<GeneralInfoStepFormValues>;
  errors: FieldErrors<GeneralInfoStepFormValues>;
  selectedLicenseMethod: string;
  selectedLicenseType: string;
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
  selectedLicenseMethod,
  selectedLicenseType,
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
            Hình thức cấp quyền <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="license_method"
            render={() => (
              <BaseSelect
                options={LICENSE_METHODS}
                value={
                  LICENSE_METHODS.find(
                    (opt) => opt.value === selectedLicenseMethod
                  ) || null
                }
                onChange={(option) =>
                  setValue(
                    "license_method",
                    (option as SelectOption | null)?.value as string
                  )
                }
                placeholder="Chọn hình thức cấp quyền"
                error={errors.license_method?.message}
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
            Loại license <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="license_type"
            render={() => (
              <BaseSelect
                options={LICENSE_TYPES}
                value={
                  LICENSE_TYPES.find(
                    (opt) => opt.value === selectedLicenseType
                  ) || null
                }
                onChange={(option) =>
                  setValue(
                    "license_type",
                    (option as SelectOption | null)?.value as string
                  )
                }
                placeholder="Chọn loại license"
                error={errors.license_type?.message}
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
          {isSubmitting ? "Đang xử lý..." : "Lưu & Tiếp tục"}
        </Button>
      </div>
    </form>
  );
}


