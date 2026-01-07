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
import {
  IP_TYPES,
  IP_TYPE_LABELS,
  type IpType,
} from "@/constants/ip-type";
import IpSearchModal, {
  type SelectedIpItem,
} from "@/components/contracts/licenses/IpSearchModal";

const partnersSchema = z.object({
  licensor_id: z.string().min(1, "Vui lòng chọn bên cấp quyền"),
  licensee_id: z.string().min(1, "Vui lòng chọn bên nhận cấp quyền"),
  enable_third_party: z.boolean().default(false),
  third_party_name: z.string().optional(),
  third_party_site: z.string().optional(),
  ip_type: z
    .enum([IP_TYPES.TRADEMARK, IP_TYPES.INDUSTRIAL_DESIGN])
    .default(IP_TYPES.TRADEMARK),
  ip_items: z
    .array(
      z.object({
        id: z.number(),
        ip_type: z.string(),
        name: z.string().nullable(),
        application_number: z.string().nullable().optional(),
        certificate_number: z.string().nullable().optional(),
        group: z.string().nullable().optional(),
        status: z.string().nullable().optional(),
      })
    )
    .default([]),
});

type PartnersStepFormValues = z.infer<typeof partnersSchema>;

type PartnersStepFormProps = {
  onBack: () => void;
  onNext: () => void;
};

// Form chọn các bên tham gia và danh mục IP áp dụng cho hợp đồng cấp quyền
export default function PartnersStepForm({ onBack, onNext }: PartnersStepFormProps) {
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const { companies, isLoading: isLoadingCompanies } = useAllCompanies();
  const [isIpModalOpen, setIsIpModalOpen] = useState(false);

  const companyOptions: SelectOption[] = useMemo(
    () =>
      companies.map((company) => ({
        value: String(company.id),
        label: `${company.short_name} - ${company.name}`,
        data: company,
      })),
    [companies]
  );

  const ipTypeOptions: SelectOption[] = useMemo(
    () => [
      {
        value: IP_TYPES.TRADEMARK,
        label: IP_TYPE_LABELS[IP_TYPES.TRADEMARK],
      },
      {
        value: IP_TYPES.INDUSTRIAL_DESIGN,
        label: IP_TYPE_LABELS[IP_TYPES.INDUSTRIAL_DESIGN],
      },
    ],
    []
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
      licensee_id: "",
      enable_third_party: false,
      third_party_name: "",
      third_party_site: "",
      ip_type: IP_TYPES.TRADEMARK,
      ip_items: [],
    },
  });

  const enableThirdParty = watch("enable_third_party");
  const currentIpType = watch("ip_type");
  const selectedIps = watch("ip_items") as SelectedIpItem[];

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem("license_partners_info");
      if (!stored) return;
      const parsed = JSON.parse(stored) as PartnersStepFormValues;
      setValue("licensor_id", parsed.licensor_id || "");
      setValue("licensee_id", parsed.licensee_id || "");
      setValue("enable_third_party", parsed.enable_third_party || false);
      setValue("third_party_name", parsed.third_party_name || "");
      setValue("third_party_site", parsed.third_party_site || "");
      if (parsed.ip_type) {
        setValue("ip_type", parsed.ip_type);
      }
      if (parsed.ip_items) {
        setValue("ip_items", parsed.ip_items as SelectedIpItem[]);
      }
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

      <div className="grid md:grid-cols-1 gap-4">
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
                }}
                placeholder="Chọn bên cấp quyền"
                error={errors.licensor_id?.message}
              />
            )}
          />
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
                }}
                placeholder="Chọn bên nhận cấp quyền"
                error={errors.licensee_id?.message}
              />
            )}
          />
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
      <hr />

      <div className="space-y-4">
        <div>
          <h4 className="text-base font-semibold">Danh mục Tài sản IP</h4>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,220px)_auto] items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Loại tài sản IP
            </label>
            <BaseSelect
              options={ipTypeOptions}
              value={
                ipTypeOptions.find((opt) => opt.value === currentIpType) || null
              }
              onChange={(option) => {
                const selected = option as SelectOption | null;
                const value = selected?.value as IpType | undefined;
                const safeValue =
                  value === IP_TYPES.TRADEMARK || value === IP_TYPES.INDUSTRIAL_DESIGN
                    ? value
                    : IP_TYPES.TRADEMARK;
                setValue("ip_type", safeValue);
              }}
              placeholder="Chọn loại IP"
            />
          </div>

          <Button
            type="button"
            onClick={() => setIsIpModalOpen(true)}
            className="whitespace-nowrap mt-6 w-fit"
          >
            Tìm và chọn IP
          </Button>
        </div>

        {selectedIps && selectedIps.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Tên IP
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Số đơn
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Số bằng
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Nhóm / Phân loại
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Trạng thái
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedIps.map((ip) => (
                  <tr key={ip.id} className="border-t">
                    <td className="px-4 py-2">{ip.id}</td>
                    <td className="px-4 py-2">{ip.name || "-"}</td>
                    <td className="px-4 py-2">
                      {ip.application_number || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {ip.certificate_number || "-"}
                    </td>
                    <td className="px-4 py-2 max-w-xs truncate">
                      {ip.group || "-"}
                    </td>
                    <td className="px-4 py-2">{ip.status || "-"}</td>
                    <td className="px-4 py-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setValue(
                            "ip_items",
                            selectedIps.filter((item) => item.id !== ip.id),
                            { shouldDirty: true }
                          )
                        }
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      <IpSearchModal
        open={isIpModalOpen}
        onOpenChange={setIsIpModalOpen}
        ipType={currentIpType}
        initialSelected={selectedIps || []}
        onConfirm={(items) =>
          setValue("ip_items", items, {
            shouldDirty: true,
          })
        }
      />
    </form>
  );
}


