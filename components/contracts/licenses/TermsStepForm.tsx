"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BaseSelect, { type SelectOption } from "@/components/common/select/base-select";
import { DatePickerSingle } from "@/components/common/date/date-picker-single";

// Constants for dropdown options
const TERM_TYPE_OPTIONS: SelectOption[] = [
  { value: "FIXED", label: "Có thời hạn" },
  { value: "UNLIMITED", label: "Không có thời hạn cụ thể" },
];

const GEOGRAPHICAL_AREA_OPTIONS: SelectOption[] = [
  { value: "VIETNAM", label: "Việt Nam" },
  { value: "ASIA", label: "Châu Á" },
  { value: "WORLDWIDE", label: "Toàn thế giới" },
];

const SCOPE_OF_RIGHTS_OPTIONS: SelectOption[] = [
  { value: "FULL", label: "Toàn bộ quyền" },
  { value: "PARTIAL", label: "Một phần quyền" },
  { value: "EXCLUSIVE", label: "Độc quyền" },
];

const FEE_TYPE_OPTIONS: SelectOption[] = [
  { value: "NO_FEE", label: "Không phí" },
  { value: "FIXED", label: "Phí cố định" },
  { value: "PERCENTAGE", label: "Theo % doanh số" },
];

const CURRENCY_OPTIONS: SelectOption[] = [
  { value: "VND", label: "VND" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

const PAYMENT_PERIOD_OPTIONS: SelectOption[] = [
  { value: "MONTHLY", label: "Hàng tháng" },
  { value: "QUARTERLY", label: "Hàng quý" },
  { value: "YEARLY", label: "Hàng năm" },
  { value: "ONE_TIME", label: "Một lần" },
];

const PAYMENT_METHOD_OPTIONS: SelectOption[] = [
  { value: "CASH", label: "Tiền mặt" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản" },
];

const RENEWAL_UNIT_OPTIONS: SelectOption[] = [
  { value: "year", label: "Năm" },
  { value: "month", label: "Tháng" },
  { value: "day", label: "Ngày" },
];

const termsSchema = z.object({
  term_type: z.string().min(1, "Vui lòng chọn loại thời hạn"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  geographical_area: z.string().min(1, "Vui lòng chọn khu vực địa lý"),
  scope_of_rights: z.string().min(1, "Vui lòng chọn phạm vi cấp quyền"),
  purpose: z.string().optional(),
  auto_renew: z.boolean().default(false),
  renewal_period: z.number().optional(),
  renewal_unit: z.string().optional(),
  fee_type: z.string().min(1, "Vui lòng chọn cấu hình loại phí"),
  fee_percentage: z.string().optional(),
  currency: z.string().optional(),
  payment_period: z.string().optional(),
  payment_method: z.string().optional(),
  due_date: z.string().optional(),
});

type TermsStepFormValues = z.infer<typeof termsSchema>;

type TermsStepFormProps = {
  onBack: () => void;
  onNext: () => void;
};

// Simple Switch component using checkbox styling
function Switch({
  checked,
  onCheckedChange,
  id,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function TermsStepForm({ onBack, onNext }: TermsStepFormProps) {
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TermsStepFormValues>({
    resolver: zodResolver(termsSchema) as Resolver<TermsStepFormValues>,
    defaultValues: {
      term_type: "FIXED",
      start_date: "",
      end_date: "",
      geographical_area: "",
      scope_of_rights: "",
      purpose: "",
      auto_renew: false,
      renewal_period: undefined,
      renewal_unit: "year",
      fee_type: "PERCENTAGE",
      fee_percentage: "",
      currency: "VND",
      payment_period: "YEARLY",
      payment_method: "CASH",
      due_date: "",
    },
  });

  const termType = watch("term_type");
  const autoRenew = watch("auto_renew");
  const feeType = watch("fee_type");
  const selectedGeographicalArea = watch("geographical_area");
  const selectedScopeOfRights = watch("scope_of_rights");
  const selectedCurrency = watch("currency");
  const selectedPaymentPeriod = watch("payment_period");
  const selectedPaymentMethod = watch("payment_method");
  const renewalPeriod = watch("renewal_period");
  const selectedRenewalUnit = watch("renewal_unit");

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem("license_terms_info");
      if (!stored) return;
      const parsed = JSON.parse(stored) as TermsStepFormValues;
      Object.keys(parsed).forEach((key) => {
        const value = parsed[key as keyof TermsStepFormValues];
        if (value !== undefined && value !== null) {
          setValue(key as keyof TermsStepFormValues, value as any);
        }
      });
    } catch (error) {
      console.error("Load draft error", error);
    }
  }, [setValue]);

  const persistDraft = (values: TermsStepFormValues) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("license_terms_info", JSON.stringify(values));
      }
    } catch (error) {
      console.error("Persist draft error", error);
    }
  };

  const handleSaveDraft = handleSubmit(async (values) => {
    setIsSavingDraft(true);
    try {
      persistDraft(values);
      toast.success("Đã lưu nháp điều khoản");
    } catch {
      toast.error("Không thể lưu nháp, vui lòng thử lại");
    } finally {
      setIsSavingDraft(false);
    }
  });

  const handleNext = handleSubmit((values) => {
    persistDraft(values);
    toast.success("Đã lưu Điều khoản, chuyển sang bước tiếp theo");
    onNext();
  });

  return (
    <form className="space-y-6" onSubmit={handleNext}>
      {/* Thời Hạn Cho Phép Sử Dụng */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">
          Thời Hạn Cho Phép Sử Dụng
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Loại thời hạn <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="term_type"
              render={() => (
                <BaseSelect
                  options={TERM_TYPE_OPTIONS}
                  value={
                    TERM_TYPE_OPTIONS.find((opt) => opt.value === termType) ||
                    null
                  }
                  onChange={(option) =>
                    setValue(
                      "term_type",
                      (option as SelectOption | null)?.value as string
                    )
                  }
                  placeholder="Chọn loại thời hạn"
                  error={errors.term_type?.message}
                />
              )}
            />
          </div>

          {(termType === "FIXED" || termType === "UNLIMITED") && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Từ ngày
              </label>
              <Controller
                control={control}
                name="start_date"
                render={({ field }) => (
                  <DatePickerSingle
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    placeholder="dd/mm/yyyy"
                  />
                )}
              />
            </div>
          )}

          {termType === "FIXED" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Đến ngày
              </label>
              <Controller
                control={control}
                name="end_date"
                render={({ field }) => (
                  <DatePickerSingle
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    placeholder="dd/mm/yyyy"
                  />
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* Phạm Vi Cho Phép Sử Dụng */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">
          Phạm Vi Cho Phép Sử Dụng
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Khu vực địa lý <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="geographical_area"
              render={() => (
                <BaseSelect
                  options={GEOGRAPHICAL_AREA_OPTIONS}
                  value={
                    GEOGRAPHICAL_AREA_OPTIONS.find(
                      (opt) => opt.value === selectedGeographicalArea
                    ) || null
                  }
                  onChange={(option) =>
                    setValue(
                      "geographical_area",
                      (option as SelectOption | null)?.value as string
                    )
                  }
                  placeholder="Chọn khu vực địa lý"
                  error={errors.geographical_area?.message}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Phạm vi cấp quyền <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="scope_of_rights"
              render={() => (
                <BaseSelect
                  options={SCOPE_OF_RIGHTS_OPTIONS}
                  value={
                    SCOPE_OF_RIGHTS_OPTIONS.find(
                      (opt) => opt.value === selectedScopeOfRights
                    ) || null
                  }
                  onChange={(option) =>
                    setValue(
                      "scope_of_rights",
                      (option as SelectOption | null)?.value as string
                    )
                  }
                  placeholder="Chọn phạm vi cấp quyền"
                  error={errors.scope_of_rights?.message}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Mục Đích Cấp Quyền */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">
          Mục Đích Cấp Quyền
        </h4>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Mục đích cấp quyền
          </label>
          <Controller
            control={control}
            name="purpose"
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Nhập mục đích cấp quyền"
                className={errors.purpose ? "border-red-500" : ""}
              />
            )}
          />
          {errors.purpose?.message && (
            <p className="text-sm text-red-500">{errors.purpose.message}</p>
          )}
        </div>
      </div>

      {/* Gia Hạn */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">Gia Hạn</h4>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRenew}
              onCheckedChange={(checked) => setValue("auto_renew", checked)}
              id="auto_renew"
            />
            <label
              htmlFor="auto_renew"
              className="text-sm font-medium text-gray-700"
            >
              Tự động gia hạn
            </label>
          </div>

          {autoRenew && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Thời gian gia hạn thêm
                </label>
                <Controller
                  control={control}
                  name="renewal_period"
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(
                          value === "" ? undefined : Number(value)
                        );
                      }}
                      placeholder="Nhập số"
                      type="number"
                      min="1"
                      className={errors.renewal_period ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.renewal_period?.message && (
                  <p className="text-sm text-red-500">
                    {errors.renewal_period.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Đơn vị gia hạn
                </label>
                <Controller
                  control={control}
                  name="renewal_unit"
                  render={() => (
                    <BaseSelect
                      options={RENEWAL_UNIT_OPTIONS}
                      value={
                        RENEWAL_UNIT_OPTIONS.find(
                          (opt) => opt.value === selectedRenewalUnit
                        ) || null
                      }
                      onChange={(option) =>
                        setValue(
                          "renewal_unit",
                          (option as SelectOption | null)?.value as string
                        )
                      }
                      placeholder="Chọn đơn vị"
                      error={errors.renewal_unit?.message}
                    />
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phí Cấp Quyền */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">Phí Cấp Quyền</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Cấu hình loại phí <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="fee_type"
              render={() => (
                <BaseSelect
                  options={FEE_TYPE_OPTIONS}
                  value={
                    FEE_TYPE_OPTIONS.find((opt) => opt.value === feeType) ||
                    null
                  }
                  onChange={(option) =>
                    setValue(
                      "fee_type",
                      (option as SelectOption | null)?.value as string
                    )
                  }
                  placeholder="Chọn cấu hình loại phí"
                  error={errors.fee_type?.message}
                />
              )}
            />
          </div>

          {feeType === "PERCENTAGE" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                % phí
              </label>
              <Controller
                control={control}
                name="fee_percentage"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Nhập % phí"
                    type="number"
                    min="0"
                    max="100"
                  />
                )}
              />
            </div>
          )}

          {feeType === "FIXED" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Số tiền
              </label>
              <Controller
                control={control}
                name="fee_percentage"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Nhập số tiền"
                    type="number"
                    min="0"
                  />
                )}
              />
            </div>
          )}

          {feeType !== "NO_FEE" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tiền tệ
                </label>
                <Controller
                  control={control}
                  name="currency"
                  render={() => (
                    <BaseSelect
                      options={CURRENCY_OPTIONS}
                      value={
                        CURRENCY_OPTIONS.find(
                          (opt) => opt.value === selectedCurrency
                        ) || null
                      }
                      onChange={(option) =>
                        setValue(
                          "currency",
                          (option as SelectOption | null)?.value as string
                        )
                      }
                      placeholder="Chọn tiền tệ"
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Kỳ thanh toán
                </label>
                <Controller
                  control={control}
                  name="payment_period"
                  render={() => (
                    <BaseSelect
                      options={PAYMENT_PERIOD_OPTIONS}
                      value={
                        PAYMENT_PERIOD_OPTIONS.find(
                          (opt) => opt.value === selectedPaymentPeriod
                        ) || null
                      }
                      onChange={(option) =>
                        setValue(
                          "payment_period",
                          (option as SelectOption | null)?.value as string
                        )
                      }
                      placeholder="Chọn kỳ thanh toán"
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Phương thức thanh toán
                </label>
                <Controller
                  control={control}
                  name="payment_method"
                  render={() => (
                    <BaseSelect
                      options={PAYMENT_METHOD_OPTIONS}
                      value={
                        PAYMENT_METHOD_OPTIONS.find(
                          (opt) => opt.value === selectedPaymentMethod
                        ) || null
                      }
                      onChange={(option) =>
                        setValue(
                          "payment_method",
                          (option as SelectOption | null)?.value as string
                        )
                      }
                      placeholder="Chọn phương thức thanh toán"
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Ngày đến hạn
                </label>
                <Controller
                  control={control}
                  name="due_date"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Ví dụ: Ngày 15 hàng năm"
                      className={errors.due_date ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.due_date?.message && (
                  <p className="text-sm text-red-500">
                    {errors.due_date.message}
                  </p>
                )}
              </div>
            </>
          )}
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
          onClick={handleSaveDraft}
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

