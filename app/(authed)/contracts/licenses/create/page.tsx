"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
import { licenseService } from "@/services/license.service";

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
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [licenseId, setLicenseId] = useState<string | number | null>(null);

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
      // Thêm id vào URL nếu có và step > 1
      if (licenseId && step > 1) {
        params.set("id", String(licenseId));
      }
      const query = params.toString();
      router.push(
        `/contracts/licenses/create${query ? `?${query}` : ""}`,
        { scroll: false },
      );
    } catch (error) {
      console.error("Không thể cập nhật bước trên URL", error);
    }
  };


  // Query để fetch license detail khi có licenseId
  const {
    data: licenseData,
    isLoading: isLoadingLicense,
  } = useQuery({
    queryKey: ["license", licenseId],
    queryFn: async () => {
      if (!licenseId) return null;
      return await licenseService.getById(String(licenseId));
    },
    enabled: !!licenseId,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });

  // Đồng bộ bước hiện tại với query param step trên URL và lấy id nếu có
  useEffect(() => {
    const stepParam = searchParams.get("step");
    const stepFromUrl = stepParam ? Number(stepParam) : 1;
    const idParam = searchParams.get("id");

    if (!Number.isNaN(stepFromUrl) && stepFromUrl >= 1 && stepFromUrl <= 4) {
      setCurrentStep(stepFromUrl);
    } else {
      setCurrentStep(1);
    }

    // Lấy id từ URL nếu có (cho step 2, 3, 4)
    if (idParam) {
      setLicenseId(idParam);
    }
  }, [searchParams]);

  // Load dữ liệu vào form khi có licenseData và đang ở step 1
  useEffect(() => {
    if (licenseData && currentStep === 1) {
      setValue("license_method", licenseData.license_method || "");
      setValue("license_type", licenseData.license_type || "");
      setValue("doc_number", licenseData.doc_number || "");
      setValue("sign_date", licenseData.sign_date || "");
      setValue("status", licenseData.status || "DRAFT");
    }
  }, [licenseData, currentStep, setValue]);

  // Mutation để update license step 1
  const updateStep1Mutation = useMutation({
    mutationFn: async (data: {
      id: string | number;
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
      // Lưu nháp qua API nếu đã có licenseId
      if (licenseId) {
        await updateStep1Mutation.mutateAsync({
          id: licenseId,
          values,
        });
      } else {
        toast.success("Đã lưu nháp thông tin chung");
      }
    } catch {
      // Error đã được xử lý trong mutation
    } finally {
      setIsSavingDraft(false);
    }
  });

  // Mutation để create license
  const createLicenseMutation = useMutation({
    mutationFn: async (data: GeneralInfoForm) => {
      return await licenseService.create({
        license_method: data.license_method,
        doc_number: data.doc_number,
        license_type: data.license_type,
        status: data.status,
        sign_date: data.sign_date || undefined,
        step: 1,
      });
    },
    onSuccess: (response) => {
      // Lưu id từ response
      if (response.id) {
        setLicenseId(response.id);
        // Set cache với dữ liệu vừa tạo
        queryClient.setQueryData(["license", response.id], {
          id: response.id,
          license_method: response.license_method,
          doc_number: response.doc_number,
          license_type: response.license_type,
          status: response.status,
          sign_date: response.sign_date,
        });
        toast.success("Đã tạo license, chuyển sang bước tiếp theo");
        goToStep(2);
      } else {
        toast.error("Không thể tạo license, vui lòng thử lại");
      }
    },
    onError: (error: any) => {
      console.error("Lỗi khi tạo license:", error);
      toast.error(
        error?.response?.data?.message || "Không thể tạo license, vui lòng thử lại"
      );
    },
  });

  const onNextStep = handleSubmit(async (values) => {
    // Nếu đã có licenseId, dùng update thay vì create
    if (licenseId) {
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
    } else {
      // Chưa có licenseId, tạo mới
      await createLicenseMutation.mutateAsync(values);
    }
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
          <>
            {isLoadingLicense && licenseId ? (
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
                isSubmitting={isSubmitting || createLicenseMutation.isPending}
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
          <>
            {!licenseId ? (
              <div className="flex flex-col items-center justify-center h-80 space-y-4">
                <p className="text-lg font-semibold text-red-600">
                  Chưa có thông tin license
                </p>
                <p className="text-sm text-gray-600">
                  Vui lòng hoàn thành bước 1 trước khi tiếp tục
                </p>
                <Button onClick={() => goToStep(1)}>Quay lại bước 1</Button>
              </div>
            ) : (
              <PartnersStepForm
                licenseId={licenseId}
                onBack={() => goToStep(1)}
                onNext={() => goToStep(3)}
              />
            )}
          </>
        )}

        {currentStep === 3 && (
          <>
            {!licenseId ? (
              <div className="flex flex-col items-center justify-center h-80 space-y-4">
                <p className="text-lg font-semibold text-red-600">
                  Chưa có thông tin license
                </p>
                <p className="text-sm text-gray-600">
                  Vui lòng hoàn thành bước 1 trước khi tiếp tục
                </p>
                <Button onClick={() => goToStep(1)}>Quay lại bước 1</Button>
              </div>
            ) : (
              <TermsStepForm
                licenseId={licenseId}
                onBack={() => goToStep(2)}
                onNext={() => goToStep(4)}
              />
            )}
          </>
        )}

        {currentStep === 4 && (
          <>
            {!licenseId ? (
              <div className="flex flex-col items-center justify-center h-80 space-y-4">
                <p className="text-lg font-semibold text-red-600">
                  Chưa có thông tin license
                </p>
                <p className="text-sm text-gray-600">
                  Vui lòng hoàn thành bước 1 trước khi tiếp tục
                </p>
                <Button onClick={() => goToStep(1)}>Quay lại bước 1</Button>
              </div>
            ) : (
              <AttachmentsStepForm
                licenseId={licenseId}
                onBack={() => goToStep(3)}
                onCreate={() => router.push("/contracts/licenses")}
              />
            )}
          </>
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

