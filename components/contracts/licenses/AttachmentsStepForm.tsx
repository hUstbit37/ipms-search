"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { Upload, Eye, Trash2, ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMe } from "@/providers/auth/MeProvider";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { licenseService } from "@/services/license.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const attachmentsSchema = z.object({
  files: z.array(z.instanceof(File)).default([]),
  notes: z.string().optional(),
});

type AttachmentsStepFormValues = z.infer<typeof attachmentsSchema>;

type AttachedFile = {
  id: string;
  file: File;
  creator: string;
  createdAt: Date;
};

type AttachmentsStepFormProps = {
  licenseId?: string | number | null;
  onBack: () => void;
  onCreate: () => void;
};

export default function AttachmentsStepForm({
  licenseId,
  onBack,
  onCreate,
}: AttachmentsStepFormProps) {
  const { me } = useMe();
  const queryClient = useQueryClient();
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(true);
  const [isOtherOpen, setIsOtherOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<AttachmentsStepFormValues>({
    resolver: zodResolver(attachmentsSchema) as Resolver<AttachmentsStepFormValues>,
    defaultValues: {
      files: [],
      notes: "",
    },
  });

  const notes = watch("notes");

  // Query để fetch license detail từ cache
  const { data: licenseData } = useQuery({
    queryKey: ["license", licenseId],
    queryFn: async () => {
      if (!licenseId) return null;
      return await licenseService.getById(String(licenseId));
    },
    enabled: !!licenseId,
    staleTime: 5 * 60 * 1000,
  });

  // Load dữ liệu vào form khi có licenseData
  useEffect(() => {
    if (licenseData && licenseData.notes) {
      setValue("notes", licenseData.notes);
    }
    // Note: Files không thể load từ cache vì là File objects
  }, [licenseData, setValue]);

  // Mutation để update step 4
  const updateStep4Mutation = useMutation({
    mutationFn: async (values: AttachmentsStepFormValues) => {
      if (!licenseId) throw new Error("Không có licenseId");
      return await licenseService.update(licenseId, {
        files: attachedFiles.map((f) => f.file),
        notes: values.notes || undefined,
        step: 4,
      });
    },
    onSuccess: (data, variables) => {
      // Update cache với dữ liệu mới
      queryClient.setQueryData(["license", licenseId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          notes: variables.notes || null,
          // Files không thể cache vì là File objects
        };
      });
    },
  });

  const handleSaveDraft = handleSubmit(async (values) => {
    setIsSavingDraft(true);
    try {
      if (licenseId) {
        await updateStep4Mutation.mutateAsync(values);
        toast.success("Đã lưu nháp đính kèm hồ sơ");
      } else {
        toast.success("Đã lưu nháp đính kèm hồ sơ");
      }
    } catch (error: any) {
      console.error("Lỗi khi lưu nháp step 4:", error);
      toast.error(
        error?.response?.data?.message || "Không thể lưu nháp, vui lòng thử lại"
      );
    } finally {
      setIsSavingDraft(false);
    }
  });

  const handleCreate = handleSubmit(async (values) => {
    if (!licenseId) {
      toast.error("Không tìm thấy ID license, vui lòng quay lại bước 1");
      return;
    }
    console.log(values);
    try {
      await updateStep4Mutation.mutateAsync(values);
      toast.success("Đã tạo mới license");
      onCreate();
    } catch (error: any) {
      console.error("Lỗi khi cập nhật step 4:", error);
      toast.error(
        error?.response?.data?.message || "Không thể tạo license, vui lòng thử lại"
      );
    }
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: AttachedFile[] = Array.from(files).map((file) => ({
      id: `file_${Date.now()}_${Math.random()}`,
      file,
      creator: me?.fullname || "Người dùng",
      createdAt: new Date(),
    }));

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    setValue(
      "files",
      [...attachedFiles.map((f) => f.file), ...newFiles.map((f) => f.file)]
    );
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDeleteFile = (id: string) => {
    setAttachedFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      setValue(
        "files",
        updated.map((f) => f.file)
      );
      return updated;
    });
  };

  const handleViewFile = (file: AttachedFile) => {
    const url = URL.createObjectURL(file.file);
    window.open(url, "_blank");
    // Clean up after a delay
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const getFileTypeLabel = (file: File): string => {
    const extension = file.name.split(".").pop()?.toUpperCase() || "";
    return extension || "FILE";
  };

  return (
    <form className="space-y-6" onSubmit={handleCreate}>
      {/* Hồ Sơ Đính Kèm */}
      <div className="border rounded-lg">
        <button
          type="button"
          onClick={() => setIsDocumentsOpen(!isDocumentsOpen)}
          className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h4 className="text-lg font-semibold text-gray-800">
            Hồ Sơ Đính Kèm
          </h4>
          {isDocumentsOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {isDocumentsOpen && (
          <div className="p-4 space-y-4">
            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-gray-50 hover:border-gray-400"
              }`}
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Upload file</p>
              <p className="text-sm text-gray-500 mb-4">
                Kéo thả file vào đây hoặc click để chọn
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                id="file-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Chọn file
              </Button>
            </div>

            {/* Files Table */}
            {attachedFiles.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        STT
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Tên file
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Loại file
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Người tạo
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Ngày tạo
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {attachedFiles.map((file, index) => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {String(index + 1).padStart(2, "0")}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {file.file.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {getFileTypeLabel(file.file)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {file.creator}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {format(file.createdAt, "dd/MM/yyyy HH:mm", {
                            locale: vi,
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewFile(file)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Xem file"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFile(file.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Xóa file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Khác */}
      <div className="border rounded-lg">
        <button
          type="button"
          onClick={() => setIsOtherOpen(!isOtherOpen)}
          className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h4 className="text-lg font-semibold text-gray-800">Khác</h4>
          {isOtherOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {isOtherOpen && (
          <div className="p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Ghi chú
              </label>
              <textarea
                value={notes || ""}
                onChange={(e) => setValue("notes", e.target.value)}
                placeholder="Nhập ghi chú"
                rows={4}
                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
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
          disabled={isSavingDraft || updateStep4Mutation.isPending}
          onClick={handleSaveDraft}
        >
          {isSavingDraft || updateStep4Mutation.isPending ? "Đang lưu..." : "Lưu nháp"}
        </Button>
        <Button type="submit" disabled={isSubmitting || updateStep4Mutation.isPending}>
          {isSubmitting || updateStep4Mutation.isPending ? "Đang xử lý..." : "Tạo mới"}
        </Button>
      </div>
    </form>
  );
}

