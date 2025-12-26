"use client"

import { useState } from "react";
import { Download, FileDown, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { downloadFileDirect, downloadMultipleFiles } from "@/lib/api/documentApi";

interface Document {
  id?: number;
  document_type?: string | null;
  display_name?: string | null;
  file_path?: string | null;
  file_size?: number | null;
  file_type?: string | null;
}

interface IpDocumentProps {
  documents?: Document[] | null;
}

const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

export default function IpDocument({ documents }: IpDocumentProps) {
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const validDocs = documents?.filter(doc => doc.id) || [];

  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-8 text-center">Không có tài liệu đính kèm</div>
    );
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocs(validDocs.map(doc => doc.id!));
    } else {
      setSelectedDocs([]);
    }
  };

  const handleSelectDoc = (docId: number, checked: boolean) => {
    if (checked) {
      setSelectedDocs(prev => [...prev, docId]);
    } else {
      setSelectedDocs(prev => prev.filter(id => id !== docId));
    }
  };

  const handleDownloadSingle = async (doc: Document) => {
    if (!doc.id) {
      toast.error("Không thể tải file: thiếu ID");
      return;
    }

    try {
      setDownloadingId(doc.id);
      const blob = await downloadFileDirect(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.display_name || `file_${doc.id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Đã tải file thành công");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Không thể tải file. Vui lòng thử lại.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedDocs.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một tài liệu");
      return;
    }

    try {
      setIsDownloading(true);
      const blob = await downloadMultipleFiles(selectedDocs);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documents_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Đã tải ${selectedDocs.length} file thành công`);
      setSelectedDocs([]);
    } catch (error) {
      console.error("Bulk download failed:", error);
      toast.error("Không thể tải files. Vui lòng thử lại.");
    } finally {
      setIsDownloading(false);
    }
  };

  const allSelected = validDocs.length > 0 && selectedDocs.length === validDocs.length;
  const someSelected = selectedDocs.length > 0 && selectedDocs.length < validDocs.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-sm text-gray-900">Tài liệu đính kèm</div>
        {selectedDocs.length > 0 && (
          <Button
            onClick={handleBulkDownload}
            disabled={isDownloading}
            size="sm"
            className="gap-2"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Tải xuống ({selectedDocs.length})
          </Button>
        )}
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {validDocs.length > 0 && (
                <th className="px-4 py-2 text-center border-b w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Chọn tất cả"
                    className={someSelected ? "data-[state=checked]:bg-blue-500" : ""}
                  />
                </th>
              )}
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700 border-b w-16">STT</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Loại tài liệu</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Tên tài liệu</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Loại file</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Kích thước</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700 border-b w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, index) => (
              <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                {doc.id && (
                  <td className="px-4 py-2 text-center">
                    <Checkbox
                      checked={selectedDocs.includes(doc.id)}
                      onCheckedChange={(checked) => handleSelectDoc(doc.id!, checked as boolean)}
                      aria-label={`Chọn ${doc.display_name}`}
                    />
                  </td>
                )}
                {!doc.id && <td className="px-4 py-2"></td>}
                <td className="px-4 py-2 text-sm text-gray-700 text-center">{index + 1}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{doc.document_type || ""}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{doc.display_name || ""}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{doc.file_type || ""}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{formatFileSize(doc.file_size)}</td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  <div className="flex items-center justify-center gap-2">
                    {doc.file_path && (
                      <a
                        href={doc.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Xem
                      </a>
                    )}
                    {doc.id && (
                      <button
                        onClick={() => handleDownloadSingle(doc)}
                        disabled={downloadingId === doc.id}
                        className="text-green-600 hover:text-green-700 disabled:opacity-50"
                        title="Tải xuống"
                      >
                        {downloadingId === doc.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <FileDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {!doc.file_path && !doc.id && (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

