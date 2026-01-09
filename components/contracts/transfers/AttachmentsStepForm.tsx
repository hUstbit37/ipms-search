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
  onBack: () => void;
  onCreate: () => void;
};

export default function AttachmentsStepForm({
  onBack,
  onCreate,
}: AttachmentsStepFormProps) {
  const { me } = useMe();
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

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem("transfer_attachments_info");
      if (!stored) return;
      const parsed = JSON.parse(stored) as {
        files?: AttachedFile[];
        notes?: string;
      };
      if (parsed.files) {
        // Note: Files cannot be restored from localStorage, so we skip file restoration
        // In a real app, you'd need to store file metadata and re-upload
      }
      if (parsed.notes) {
        setValue("notes", parsed.notes);
      }
    } catch (error) {
      console.error("Load draft error", error);
    }
  }, [setValue]);

  const persistDraft = (values: AttachmentsStepFormValues) => {
    try {
      if (typeof window !== "undefined") {
        const fileMetadata = attachedFiles.map((f) => ({
          id: f.id,
          name: f.file.name,
          type: f.file.type,
          size: f.file.size,
          creator: f.creator,
          createdAt: f.createdAt.toISOString(),
        }));
        localStorage.setItem(
          "transfer_attachments_info",
          JSON.stringify({
            files: fileMetadata,
            notes: values.notes,
          })
        );
      }
    } catch (error) {
      console.error("Persist draft error", error);
    }
  };

  const handleSaveDraft = handleSubmit(async (values) => {
    setIsSavingDraft(true);
    try {
      persistDraft(values);
      toast.success("Đã lưu nháp đính kèm hồ sơ");
    } catch {
      toast.error("Không thể lưu nháp, vui lòng thử lại");
    } finally {
      setIsSavingDraft(false);
    }
  });

  const handleCreate = handleSubmit(async (values) => {
    persistDraft(values);
    toast.success("Đã tạo mới transfer");
    onCreate();
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
          disabled={isSavingDraft}
          onClick={handleSaveDraft}
        >
          {isSavingDraft ? "Đang lưu..." : "Lưu nháp"}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang xử lý..." : "Tạo mới"}
        </Button>
      </div>
    </form>
  );
}

