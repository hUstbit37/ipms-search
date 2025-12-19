"use client"

import { Button } from "@/components/ui/button"
import { FileText, FolderPlus, Upload, Trash2, Download, Move } from "lucide-react"

type Props = {
  onAddFolder?: () => void
  onUploadFile?: () => void
  onExport?: () => void
  selectedFilesCount?: number
  selectedFoldersCount?: number
  onBulkDelete?: () => void
  onBulkDownload?: () => void
  onMove?: () => void
  isDeleting?: boolean
  isDownloading?: boolean
}

export function DocumentPageHeader({ 
  onAddFolder, 
  onUploadFile,
  onExport,
  selectedFilesCount = 0,
  selectedFoldersCount = 0,
  onBulkDelete,
  onBulkDownload,
  onMove,
  isDeleting = false,
  isDownloading = false
}: Props) {
  const hasSelection = selectedFilesCount > 0 || selectedFoldersCount > 0
  const hasFileSelection = selectedFilesCount > 0

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center px-4 pb-2 gap-4">
        {/* Left side - Title (Fixed, no scroll) */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Quản lý Hồ sơ SHTT</h1>
            <p className="text-sm text-gray-600">Masan Group</p>
          </div>
        </div>

        {/* Right side - Actions (Scrollable horizontally, aligned to right) */}
        <div className="flex-1 min-w-0 overflow-x-auto">
          <div className="flex items-center gap-3 whitespace-nowrap justify-end">
            <Button
              onClick={onExport}
              variant="outline"
              size="default"
              className="gap-2 flex-shrink-0"
            >
              <Download className="h-4 w-4" />
              Xuất dữ liệu
            </Button>
            {hasSelection && (
              <Button
                onClick={onBulkDelete}
                variant="destructive"
                size="default"
                disabled={isDeleting}
                className="gap-2 flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
                {selectedFilesCount > 0 && selectedFoldersCount > 0
                  ? `Xóa đã chọn (${selectedFilesCount} file, ${selectedFoldersCount} folder)`
                  : selectedFilesCount > 0
                  ? `Xóa đã chọn (${selectedFilesCount} file)`
                  : `Xóa đã chọn (${selectedFoldersCount} folder)`}
              </Button>
            )}
            {hasFileSelection && (
              <>
                <Button
                  onClick={onMove}
                  variant="outline"
                  size="default"
                  className="gap-2 flex-shrink-0"
                >
                  <Move className="h-4 w-4" />
                  Di chuyển ({selectedFilesCount})
                </Button>
                <Button
                  onClick={onBulkDownload}
                  variant="outline"
                  size="default"
                  disabled={isDownloading}
                  className="gap-2 flex-shrink-0"
                >
                  <Download className="h-4 w-4" />
                  Tải xuống ({selectedFilesCount})
                </Button>
              </>
            )}
            <Button
              onClick={onUploadFile}
              variant="outline"
              size="default"
              className="gap-2 flex-shrink-0"
            >
              <Upload className="h-4 w-4" />
              Tải lên File
            </Button>
            <Button
              onClick={onAddFolder}
              variant="outline"
              size="default"
              className="gap-2 flex-shrink-0"
            >
              <FolderPlus className="h-4 w-4" />
              Thêm thư mục
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
