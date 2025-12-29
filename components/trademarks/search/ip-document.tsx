"use client"

import { useState } from "react";
import { Download, Loader2, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { getDefaultStore } from "@/lib/jotai";
import { authContextAtom } from "@/providers/auth/AuthProvider";
import { Button } from "@/components/ui/button";

const store = getDefaultStore();

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
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);

  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-8 text-center">Không có tài liệu đính kèm</div>
    );
  }

  const handleDownload = async (doc: Document) => {
    if (!doc.id) {
      toast.error("Không thể tải file: thiếu ID");
      return;
    }

    try {
      setDownloadingId(doc.id);
      
      // Get token from store
      const authContext = store.get(authContextAtom);
      const token = authContext?.token;
      
      if (!token) {
        toast.error("Vui lòng đăng nhập lại");
        return;
      }

      const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://20.205.246.175/api';
      const response = await fetch(
        `${BACKEND_URL}/v1/file-management/files/${doc.id}/download`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/octet-stream, application/pdf, image/*, */*',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Lấy filename từ Content-Disposition header hoặc dùng default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = doc.display_name || `document_${doc.id}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Thêm extension nếu chưa có
      if (!filename.includes('.') && doc.file_type) {
        filename += `.${doc.file_type}`;
      }

      // Convert response to blob và trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
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
    if (selectedFiles.length === 0) {
      toast.warning("Vui lòng chọn ít nhất 1 file để tải xuống");
      return;
    }

    try {
      setIsBulkDownloading(true);
      
      const authContext = store.get(authContextAtom);
      const token = authContext?.token;
      
      if (!token) {
        toast.error("Vui lòng đăng nhập lại");
        return;
      }

      const response = await fetch('/api/file-download/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_ids: selectedFiles,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `documents_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success(`Đã tải ${selectedFiles.length} file thành công`);
        setSelectedFiles([]);
      }
    } catch (error) {
      // Ignore error - IDM sẽ tự động tải file
    } finally {
      setIsBulkDownloading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allFileIds = documents.filter(doc => doc.id).map(doc => doc.id!);
      setSelectedFiles(allFileIds);
    } else {
      setSelectedFiles([]);
    }
  };

  const handleSelectFile = (fileId: number, checked: boolean) => {
    if (checked) {
      setSelectedFiles(prev => [...prev, fileId]);
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    }
  };

  const allSelected = documents.filter(doc => doc.id).length > 0 && 
    documents.filter(doc => doc.id).every(doc => selectedFiles.includes(doc.id!));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-sm text-gray-900">Tài liệu đính kèm</div>
        {selectedFiles.length > 0 && (
          <button
            onClick={handleBulkDownload}
            disabled={isBulkDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isBulkDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tải...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Tải {selectedFiles.length} file</span>
              </>
            )}
          </button>
        )}
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700 border-b w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </th>
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
                <td className="px-4 py-2 text-sm text-gray-700 text-center">
                  {doc.id && (
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(doc.id)}
                      onChange={(e) => handleSelectFile(doc.id!, e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  )}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 text-center">{index + 1}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{doc.document_type || ""}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{doc.display_name || ""}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{doc.file_type || ""}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{formatFileSize(doc.file_size)}</td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  <div className="flex items-center justify-center gap-1">
                    {doc.file_path && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(doc.file_path || '', '_blank');
                        }}
                        title="Xem file"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {doc.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(doc);
                        }}
                        disabled={downloadingId === doc.id}
                        title="Tải xuống"
                      >
                        {downloadingId === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
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

