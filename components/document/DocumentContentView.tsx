"use client"

import { useState } from "react"
import { Folder, FileText, Image, Download, Trash2, FileSpreadsheet } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

type FolderNode = {
  id: string | number
  name: string
  path?: string
  fileCount?: number
}

type FileItem = {
  id: number
  name: string
  size: string | null
  type: "pdf" | "image" | "excel" | "doc"
  modifiedDate: string
  updatedBy: string
  fileUrl?: string
}

type Props = {
  folders: FolderNode[]
  files: FileItem[]
  selectedFiles: number[]
  selectedFolders: string[]
  onSelectFiles: (ids: number[]) => void
  onSelectFolders: (paths: string[]) => void
  onToggleFolderSelect: (folderPath: string) => void
  onDoubleClickFolder: (folder: FolderNode) => void
  onDownload?: (fileId: number) => void
  onDelete?: (fileId: number) => void
  loading?: boolean
}

export function DocumentContentView({
  folders,
  files,
  selectedFiles,
  selectedFolders,
  onSelectFiles,
  onSelectFolders,
  onToggleFolderSelect,
  onDoubleClickFolder,
  onDownload,
  onDelete,
  loading = false,
}: Props) {
  const [lastClick, setLastClick] = useState<{ id: number | string; time: number } | null>(null)

  const handleFolderClick = (folder: FolderNode, e: React.MouseEvent) => {
    const now = Date.now()
    const isDoubleClick = lastClick && 
      lastClick.id === folder.id && 
      (now - lastClick.time) < 300

    if (isDoubleClick) {
      // Double click: navigate into folder
      onDoubleClickFolder(folder)
      setLastClick(null)
    } else {
      // Single click: toggle selection
      if (folder.path) {
        onToggleFolderSelect(folder.path)
      }
      setLastClick({ id: folder.id, time: now })
      setTimeout(() => setLastClick(null), 300)
    }
  }

  const handleFileClick = (file: FileItem) => {
    toggleSelect(file.id)
  }

  const toggleSelect = (id: number) => {
    if (selectedFiles.includes(id)) {
      onSelectFiles(selectedFiles.filter(x => x !== id))
    } else {
      onSelectFiles([...selectedFiles, id])
    }
  }

  const getFileIcon = (type: string) => {
    if (type === "image") {
      return <Image className="h-5 w-5 text-purple-500" />
    }
    if (type === "excel") {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />
    }
    return <FileText className="h-5 w-5 text-red-500" />
  }

  const allItems = [
    ...folders.map(f => ({ ...f, itemType: 'folder' as const })),
    ...files.map(f => ({ ...f, itemType: 'file' as const }))
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-12 text-gray-500">
        <div className="text-sm">Đang tải...</div>
      </div>
    )
  }

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-12 text-gray-500">
        <Folder className="h-12 w-12 mb-4 text-gray-400" />
        <p className="text-sm">Thư mục trống</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-gray-50 z-10">
          <TableRow className="hover:bg-gray-50">
            <TableHead className="w-12"></TableHead>
            <TableHead>Tên</TableHead>
            <TableHead className="w-48">Ngày sửa đổi</TableHead>
            <TableHead className="w-48">Người cập nhật</TableHead>
            <TableHead className="w-32">Kích thước</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Folders first */}
          {folders.map(folder => {
            const isSelected = folder.path ? selectedFolders.includes(folder.path) : false
            return (
              <TableRow
                key={`folder-${folder.id}`}
                className={cn(
                  "hover:bg-gray-50 cursor-pointer",
                  isSelected && "bg-blue-50 hover:bg-blue-50"
                )}
                onDoubleClick={() => onDoubleClickFolder(folder)}
                onClick={(e) => handleFolderClick(folder, e)}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => {
                      if (folder.path) {
                        onToggleFolderSelect(folder.path)
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Folder className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-900 font-medium">{folder.name}</span>
                    {folder.fileCount !== undefined && folder.fileCount > 0 && (
                      <span className="text-xs text-gray-500">({folder.fileCount})</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">-</TableCell>
                <TableCell className="text-sm text-gray-600">-</TableCell>
                <TableCell className="text-sm text-gray-600">-</TableCell>
                <TableCell></TableCell>
              </TableRow>
            )
          })}

          {/* Files */}
          {files.map(file => (
            <TableRow
              key={file.id}
              className={cn(
                selectedFiles.includes(file.id) && "bg-blue-50 hover:bg-blue-50",
                "hover:bg-gray-50"
              )}
              onClick={() => handleFileClick(file)}
            >
              <TableCell>
                <Checkbox
                  checked={selectedFiles.includes(file.id)}
                  onCheckedChange={() => toggleSelect(file.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <span className="text-sm text-gray-900 truncate">{file.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {file.modifiedDate}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {file.updatedBy}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {file.size || "-"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDownload?.(file.id)
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete?.(file.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

