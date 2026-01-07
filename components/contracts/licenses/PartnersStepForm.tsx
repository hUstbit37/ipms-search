"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import BaseSelect, { type SelectOption } from "@/components/common/select/base-select";
import { useAllCompanies } from "@/hooks/useCompanyQuery";

const partnersSchema = z.object({
  licensor_id: z.string().min(1, "Vui lòng chọn bên cấp quyền"),
  licensor_site: z.string().min(1, "Vui lòng nhập mã site (cấp quyền)"),
  licensee_id: z.string().min(1, "Vui lòng chọn bên nhận cấp quyền"),
  licensee_site: z.string().min(1, "Vui lòng nhập mã site (nhận cấp quyền)"),
  enable_third_party: z.boolean().default(false),
  third_party_name: z.string().optional(),
  third_party_site: z.string().optional(),
});

type PartnersStepFormValues = z.infer<typeof partnersSchema>;

type PartnersStepFormProps = {
  onBack: () => void;
  onNext: () => void;
};

export default function PartnersStepForm({ onBack, onNext }: PartnersStepFormProps) {
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const { companies, isLoading: isLoadingCompanies } = useAllCompanies();

  const companyOptions: SelectOption[] = useMemo(
    () =>
      companies.map((company) => ({
        value: String(company.id),
        label: `${company.name} (${company.short_name})`,
        data: company,
      })),
    [companies]
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    register,
  } = useForm<PartnersStepFormValues>({
    resolver: zodResolver(partnersSchema) as Resolver<PartnersStepFormValues>,
    defaultValues: {
      licensor_id: "",
      licensor_site: "",
      licensee_id: "",
      licensee_site: "",
      enable_third_party: false,
      third_party_name: "",
      third_party_site: "",
    },
  });

  const enableThirdParty = watch("enable_third_party");

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem("license_partners_info");
      if (!stored) return;
      const parsed = JSON.parse(stored) as PartnersStepFormValues;
      setValue("licensor_id", parsed.licensor_id || "");
      setValue("licensor_site", parsed.licensor_site || "");
      setValue("licensee_id", parsed.licensee_id || "");
      setValue("licensee_site", parsed.licensee_site || "");
      setValue("enable_third_party", parsed.enable_third_party || false);
      setValue("third_party_name", parsed.third_party_name || "");
      setValue("third_party_site", parsed.third_party_site || "");
    } catch (error) {
      console.error("Load partners draft error", error);
    }
  }, [setValue]);

  const persistDraft = (values: PartnersStepFormValues) => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem("license_partners_info", JSON.stringify(values));
    } catch (error) {
      console.error("Persist partners draft error", error);
    }
  };

  const handleSaveDraft = handleSubmit(async (values: PartnersStepFormValues) => {
    setIsSavingDraft(true);
    try {
      persistDraft(values);
      toast.success("Đã lưu nháp thông tin IP & Đối tác");
    } catch {
      toast.error("Không thể lưu nháp, vui lòng thử lại");
    } finally {
      setIsSavingDraft(false);
    }
  });

  const handleNext = handleSubmit((values: PartnersStepFormValues) => {
    persistDraft(values);
    toast.success("Đã lưu thông tin IP & Đối tác");
    onNext();
  });

  return (
    <form className="space-y-6" onSubmit={handleNext}>
      <div>
        <h4 className="text-base font-semibold">Các Bên Tham Gia</h4>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Bên cấp quyền <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="licensor_id"
            render={() => (
              <BaseSelect
                options={companyOptions}
                isLoading={isLoadingCompanies}
                value={
                  companyOptions.find(
                    (opt) => opt.value === watch("licensor_id")
                  ) || null
                }
                onChange={(option) => {
                  const selected = option as SelectOption | null;
                  setValue("licensor_id", (selected?.value as string) || "");
                  const shortName =
                    (selected?.data as { short_name?: string })?.short_name || "";
                  setValue("licensor_site", shortName || "");
                }}
                placeholder="Chọn bên cấp quyền"
                error={errors.licensor_id?.message}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Mã Site (Cấp quyền) <span className="text-red-500">*</span>
          </label>
          <Input
            value={watch("licensor_site")}
            onChange={(e) => setValue("licensor_site", e.target.value)}
            placeholder="Nhập mã site"
            className={errors.licensor_site ? "border-red-500" : ""}
          />
          {errors.licensor_site?.message && (
            <p className="text-sm text-red-500">{errors.licensor_site.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Bên nhận cấp quyền <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="licensee_id"
            render={() => (
              <BaseSelect
                options={companyOptions}
                isLoading={isLoadingCompanies}
                value={
                  companyOptions.find(
                    (opt) => opt.value === watch("licensee_id")
                  ) || null
                }
                onChange={(option) => {
                  const selected = option as SelectOption | null;
                  setValue("licensee_id", (selected?.value as string) || "");
                  const shortName =
                    (selected?.data as { short_name?: string })?.short_name || "";
                  setValue("licensee_site", shortName || "");
                }}
                placeholder="Chọn bên nhận cấp quyền"
                error={errors.licensee_id?.message}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Mã Site (Nhận cấp quyền) <span className="text-red-500">*</span>
          </label>
          <Input
            value={watch("licensee_site")}
            onChange={(e) => setValue("licensee_site", e.target.value)}
            placeholder="Nhập mã site"
            className={errors.licensee_site ? "border-red-500" : ""}
          />
          {errors.licensee_site?.message && (
            <p className="text-sm text-red-500">{errors.licensee_site.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="enable_third_party"
            checked={enableThirdParty}
            onCheckedChange={(checked) =>
              setValue("enable_third_party", checked === true)
            }
          />
          <label
            htmlFor="enable_third_party"
            className="text-sm font-medium text-gray-700"
          >
            Cấp quyền bên thứ 3
          </label>
        </div>

        {enableThirdParty && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Bên thứ 3 nhận cấp quyền
              </label>
              <Input
                {...register("third_party_name")}
                placeholder="Nhập bên thứ 3 nhận cấp quyền"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Mã Site (Bên thứ 3 nhận cấp quyền)
              </label>
              <Input
                {...register("third_party_site")}
                placeholder="Nhập mã site"
              />
            </div>
          </div>
        )}
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


