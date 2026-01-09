"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import type { SelectOption } from "@/components/common/select/base-select";
import {
  GeneralInfoStepForm,
  PartnersStepForm,
  TermsStepForm,
  AttachmentsStepForm,
} from "@/components/contracts/licenses";
import { LICENSE_STATUS_OPTIONS } from "@/constants/license";
import { useMe } from "@/providers/auth/MeProvider";

const generalInfoSchema = z.object({
  license_method: z.string().min(1, "Vui lòng chọn hình thức cấp quyền"),
  license_type: z.string().min(1, "Vui lòng chọn loại license"),
  doc_number: z.string().min(1, "Vui lòng nhập mã hợp đồng/công văn"),
  sign_date: z.string().optional(),
  status: z.string().min(1, "Vui lòng chọn trạng thái"),
});

type GeneralInfoForm = z.infer<typeof generalInfoSchema>;


const steps = [
  { key: "general", title: "Bước 1: Thông tin chung" },
  { key: "partners", title: "Bước 2: Chọn IP & Đối tác" },
  { key: "terms", title: "Bước 3: Điều khoản" },
  { key: "attachments", title: "Bước 4: Đính kèm hồ sơ" },
];

export default function LicenseCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { me } = useMe();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<GeneralInfoForm>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: {
      license_method: "",
      license_type: "",
      doc_number: "",
      sign_date: "",
      status: "DRAFT",
    },
  });

  const selectedLicenseMethod = watch("license_method");
  const selectedLicenseType = watch("license_type");
  const selectedStatus = watch("status");

  const statusOptions = useMemo<SelectOption[]>(
    () =>
      LICENSE_STATUS_OPTIONS.map((option) => ({
        ...option,
      })),
    []
  );

  // Hàm chuyển bước và đồng bộ param step trên URL
  const goToStep = (step: number) => {
    setCurrentStep(step);
    try {
      if (typeof window === "undefined") {
        router.push("/contracts/licenses/create");
        return;
      }
      const params = new URLSearchParams(window.location.search);
      params.set("step", String(step));
      const query = params.toString();
      router.push(
        `/contracts/licenses/create${query ? `?${query}` : ""}`,
        { scroll: false },
      );
    } catch (error) {
      console.error("Không thể cập nhật bước trên URL", error);
    }
  };

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem("license_general_info");
      if (!stored) return;
      const parsed = JSON.parse(stored) as Partial<GeneralInfoForm>;
      setValue("license_method", parsed.license_method || "");
      setValue("license_type", parsed.license_type || "");
      setValue("doc_number", parsed.doc_number || "");
      setValue("sign_date", parsed.sign_date || "");
      setValue("status", parsed.status || "DRAFT");
    } catch (error) {
      console.error("Load draft error", error);
    }
  }, [setValue]);

  // Đồng bộ bước hiện tại với query param step trên URL
  useEffect(() => {
    const stepParam = searchParams.get("step");
    const stepFromUrl = stepParam ? Number(stepParam) : 1;

    if (!Number.isNaN(stepFromUrl) && stepFromUrl >= 1 && stepFromUrl <= 4) {
      setCurrentStep(stepFromUrl);
    } else {
      setCurrentStep(1);
    }
  }, [searchParams]);

  const persistDraft = (values: GeneralInfoForm) => {
    try {
      const payload = {
        ...values,
        created_by: me?.fullname,
        created_by_id: me?.id,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("license_general_info", JSON.stringify(payload));
      }
    } catch (error) {
      console.error("Persist draft error", error);
    }
  };

  const onSaveDraft = handleSubmit(async (values) => {
    setIsSavingDraft(true);
    try {
      persistDraft({ ...values, status: values.status || "DRAFT" });
      toast.success("Đã lưu nháp thông tin chung");
    } catch {
      toast.error("Không thể lưu nháp, vui lòng thử lại");
    } finally {
      setIsSavingDraft(false);
    }
  });

  const onNextStep = handleSubmit((values) => {
    persistDraft(values);
    toast.success("Đã lưu Thông tin chung, chuyển sang bước tiếp theo");
    goToStep(2);
  });

  return (
    <div className="grid grid-cols-[280px_1fr] gap-6 h-full">
      <aside className="bg-white dark:bg-zinc-900 border rounded-lg ">
        <ol className="divide-y">
          {steps.map((step, index) => {
            const isActive = currentStep === index + 1;
            const isDone = currentStep > index + 1;
            return (
              <li
                key={step.key}
                className={`px-4 py-3 flex items-center gap-3 ${
                  isActive
                    ? "bg-blue-50 border-l-4 border-blue-600"
                    : "border-l-4 border-transparent"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    isDone
                      ? "bg-green-100 text-green-700"
                      : isActive
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {step.title}
                  </p>
                  {isActive && (
                    <p className="text-xs text-muted-foreground">
                      Điền đầy đủ thông tin yêu cầu
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </aside>

      <section className="bg-white dark:bg-zinc-900 border rounded-lg p-6 space-y-6 w-full">
        <div>
          <h3 className="text-xl font-semibold">
            {currentStep === 1
              ? "Thông tin chung"
              : currentStep === 2
                ? "Chọn IP & Đối tác"
                : currentStep === 3
                  ? "Bước 3/4: Điều khoản"
                  : currentStep === 4
                    ? "Bước 4/4: Đính kèm hồ sơ"
                    : "Các bước tiếp theo"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {currentStep === 1
              ? "Nhập thông tin cơ bản của hợp đồng/ công văn"
              : currentStep === 2
                ? "Khai báo các bên tham gia hợp đồng"
                : currentStep === 3
                  ? "Cấu hình các điều khoản và phí cấp quyền"
                  : currentStep === 4
                    ? "Đính kèm các tài liệu và ghi chú bổ sung"
                    : "Tiếp tục cấu hình chi tiết cho hợp đồng"}
          </p>
        </div>

        {currentStep === 1 && (
          <GeneralInfoStepForm
            control={control}
            errors={errors}
            selectedLicenseMethod={selectedLicenseMethod}
            selectedLicenseType={selectedLicenseType}
            selectedStatus={selectedStatus}
            statusOptions={statusOptions}
            isSavingDraft={isSavingDraft}
            isSubmitting={isSubmitting}
            onSaveDraft={onSaveDraft}
            onNextStep={onNextStep}
            onBack={() => router.push("/contracts/licenses")}
            meFullname={me?.fullname}
            setValue={setValue}
          />
        )}

        {currentStep === 2 && (
          <PartnersStepForm
            onBack={() => goToStep(1)}
            onNext={() => goToStep(3)}
          />
        )}

        {currentStep === 3 && (
          <TermsStepForm
            onBack={() => goToStep(2)}
            onNext={() => goToStep(4)}
          />
        )}

        {currentStep === 4 && (
          <AttachmentsStepForm
            onBack={() => goToStep(3)}
            onCreate={() => router.push("/contracts/licenses")}
          />
        )}

        {currentStep > 4 && (
          <div className="flex items-center justify-center h-80">
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">Bước {currentStep} đang được xây dựng</p>
              <p className="text-sm text-muted-foreground">
                Tiếp tục điền thông tin các bước sau trong các lần cập nhật tới.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Quay lại bước 1
                </Button>
                <Button onClick={() => router.push("/contracts/licenses")}>
                  Về danh sách
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

