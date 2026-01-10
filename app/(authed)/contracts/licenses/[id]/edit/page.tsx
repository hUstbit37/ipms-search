"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

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
import { licenseService, LicenseResponse } from "@/services/license.service";
import { useAuth } from "@/providers/auth/AuthProvider";

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

export default function LicenseEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const licenseId = params?.id as string;
  const { me } = useMe();
  const { authContext } = useAuth();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
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

  // Lấy dữ liệu license từ API
  const {
    data: licenseData,
    isLoading: isLoadingLicense,
    error: licenseError,
  } = useQuery({
    queryFn: async () => await licenseService.getById(licenseId),
    queryKey: ["license", licenseId],
    enabled: !!licenseId && !!authContext?.token,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
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
        router.push(`/contracts/licenses/${licenseId}/edit`);
        return;
      }
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("step", String(step));
      const query = urlParams.toString();
      router.push(
        `/contracts/licenses/${licenseId}/edit${query ? `?${query}` : ""}`,
        { scroll: false },
      );
    } catch (error) {
      console.error("Không thể cập nhật bước trên URL", error);
    }
  };

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

  // Load dữ liệu từ API vào form khi có dữ liệu và đang ở step 1
  useEffect(() => {
    if (licenseData && currentStep === 1) {
      // Map dữ liệu từ API vào form general info
      const generalInfo = (licenseData as any).general_info || licenseData;
      
      setValue("license_method", generalInfo.license_method || "");
      setValue("license_type", generalInfo.license_type || "");
      setValue("doc_number", generalInfo.doc_number || "");
      setValue("sign_date", generalInfo.sign_date || "");
      setValue("status", generalInfo.status || "DRAFT");
    }
  }, [licenseData, currentStep, setValue]);

  // Mutation để update license step 1
  const updateStep1Mutation = useMutation({
    mutationFn: async (data: {
      id: string;
      values: GeneralInfoForm;
      showToast?: boolean;
    }) => {
      return await licenseService.update(data.id, {
        license_method: data.values.license_method,
        doc_number: data.values.doc_number,
        license_type: data.values.license_type,
        status: data.values.status || "DRAFT",
        sign_date: data.values.sign_date || undefined,
        step: 1,
      });
    },
    onSuccess: (data, variables) => {
      // Update cache với dữ liệu mới
      queryClient.setQueryData(["license", variables.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          license_method: variables.values.license_method,
          doc_number: variables.values.doc_number,
          license_type: variables.values.license_type,
          status: variables.values.status || "DRAFT",
          sign_date: variables.values.sign_date || undefined,
        };
      });
      // Chỉ hiển thị toast nếu showToast = true (mặc định true)
      if (variables.showToast !== false) {
        toast.success("Đã lưu nháp thông tin chung");
      }
    },
    onError: (error: any) => {
      console.error("Lỗi khi lưu nháp step 1:", error);
      toast.error(
        error?.response?.data?.message || "Không thể lưu nháp, vui lòng thử lại"
      );
    },
  });

  const onSaveDraft = handleSubmit(async (values) => {
    setIsSavingDraft(true);
    try {
      await updateStep1Mutation.mutateAsync({
        id: licenseId,
        values,
      });
    } catch {
      // Error đã được xử lý trong mutation
    } finally {
      setIsSavingDraft(false);
    }
  });

  const onNextStep = handleSubmit(async (values) => {
    try {
      await updateStep1Mutation.mutateAsync({
        id: licenseId,
        values,
        showToast: false, // Không hiển thị toast "Đã lưu nháp"
      });
      toast.success("Đã cập nhật license, chuyển sang bước tiếp theo");
      goToStep(2);
    } catch (error) {
      // Error đã được xử lý trong mutation
    }
  });

  // Hiển thị loading khi đang tải dữ liệu
  if (isLoadingLicense) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu license...</p>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi nếu không tải được dữ liệu
  if (licenseError || !licenseData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-red-600">
            Không thể tải dữ liệu license
          </p>
          <p className="text-sm text-muted-foreground">
            {licenseError instanceof Error
              ? licenseError.message
              : "Vui lòng thử lại sau"}
          </p>
          <Button onClick={() => router.push("/contracts/licenses")}>
            Về danh sách
          </Button>
        </div>
      </div>
    );
  }

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
              ? "Chỉnh sửa thông tin chung"
              : currentStep === 2
                ? "Chỉnh sửa IP & Đối tác"
                : currentStep === 3
                  ? "Chỉnh sửa điều khoản"
                  : currentStep === 4
                    ? "Chỉnh sửa đính kèm hồ sơ"
                    : "Các bước tiếp theo"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {currentStep === 1
              ? "Cập nhật thông tin cơ bản của hợp đồng/ công văn"
              : currentStep === 2
                ? "Cập nhật các bên tham gia hợp đồng"
                : currentStep === 3
                  ? "Cập nhật các điều khoản và phí cấp quyền"
                  : currentStep === 4
                    ? "Cập nhật các tài liệu và ghi chú bổ sung"
                    : "Tiếp tục cấu hình chi tiết cho hợp đồng"}
          </p>
        </div>

        {currentStep === 1 && (
          <>
            {isLoadingLicense ? (
              <div className="flex items-center justify-center h-40">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Đang tải dữ liệu...</span>
                </div>
              </div>
            ) : (
              <GeneralInfoStepForm
                control={control}
                errors={errors}
                selectedLicenseMethod={selectedLicenseMethod}
                selectedLicenseType={selectedLicenseType}
                selectedStatus={selectedStatus}
                statusOptions={statusOptions}
                isSavingDraft={isSavingDraft || updateStep1Mutation.isPending}
                isSubmitting={isSubmitting || updateStep1Mutation.isPending}
                onSaveDraft={onSaveDraft}
                onNextStep={onNextStep}
                onBack={() => router.push("/contracts/licenses")}
                meFullname={me?.fullname}
                setValue={setValue}
              />
            )}
          </>
        )}

        {currentStep === 2 && (
          <PartnersStepForm
            licenseId={licenseId}
            onBack={() => goToStep(1)}
            onNext={() => goToStep(3)}
          />
        )}

        {currentStep === 3 && (
          <TermsStepForm
            licenseId={licenseId}
            onBack={() => goToStep(2)}
            onNext={() => goToStep(4)}
          />
        )}

        {currentStep === 4 && (
          <AttachmentsStepForm
            licenseId={licenseId}
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
                <Button variant="outline" onClick={() => goToStep(1)}>
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

