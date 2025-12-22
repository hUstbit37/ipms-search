"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Image, Download, Trash2, ChevronRight, ChevronDown, Folder } from "lucide-react"
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

type FileItem = {
  id: number
  name: string
  size: string | null
  type: "pdf" | "image" | "doc"
  modifiedDate: string
  updatedBy: string
  fileUrl?: string
  blob_path?: string
}

type FileGroup = {
  folderPath: string
  folderName: string
  files: FileItem[]
  pathCount?: number // Number of different paths with this folder name
}

const groupFilesByPath = (files: FileItem[]): FileGroup[] => {
  const groups: Record<string, { folderName: string; files: FileItem[]; paths: Set<string> }> = {}
  
  files.forEach(file => {
    let folderName = "Root"
    let folderKey = "root"
    
    if (file.blob_path) {
      // Extract folder path (remove filename)
      const lastSlashIndex = file.blob_path.lastIndexOf('/')
      if (lastSlashIndex > 0) {
        const folderPath = file.blob_path.substring(0, lastSlashIndex)
        // Get folder name (last part of path) - group by name only, not full path
        const pathParts = folderPath.split('/').filter(Boolean)
        folderName = pathParts[pathParts.length - 1] || "Root"
        folderKey = folderName.toLowerCase() // Use folder name as key to group same-named folders
      } else {
        // File at root level
        folderName = "Root"
        folderKey = "root"
      }
    }
    
    if (!groups[folderKey]) {
      groups[folderKey] = {
        folderName,
        files: [],
        paths: new Set()
      }
    }
    groups[folderKey].files.push(file)
    // Track all paths for this folder name
    if (file.blob_path) {
      const lastSlashIndex = file.blob_path.lastIndexOf('/')
      if (lastSlashIndex > 0) {
        groups[folderKey].paths.add(file.blob_path.substring(0, lastSlashIndex))
      }
    }
  })
  
  // Convert to array and sort
  return Object.entries(groups)
    .map(([folderKey, data]) => ({
      folderPath: folderKey, // Use folderKey as unique identifier
      folderName: data.folderName,
      files: data.files,
      pathCount: data.paths.size, // Number of different paths with this folder name
    }))
    .sort((a, b) => {
      // Sort: Root first, then alphabetically
      if (a.folderPath === "root") return -1
      if (b.folderPath === "root") return 1
      return a.folderName.localeCompare(b.folderName)
    })
}

type Props = {
  files: FileItem[]
  selectedFiles: number[]
  onSelectFiles: (ids: number[]) => void
  onDownload?: (fileId: number) => void
  onDelete?: (fileId: number) => void
}

export function DocumentFileList({ 
  files, 
  selectedFiles, 
  onSelectFiles,
  onDownload,
  onDelete 
}: Props) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isAllExpanded, setIsAllExpanded] = useState(true)

  // Auto-expand all folders on initial load
  useEffect(() => {
    if (files.length > 0) {
      const groups = groupFilesByPath(files)
      const allFolderPaths = new Set(groups.map(g => g.folderPath))
      setExpandedFolders(allFolderPaths)
      setIsAllExpanded(true)
    }
  }, [files])

  const isAllSelected = files.length > 0 && selectedFiles.length === files.length

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(folderPath)) {
        next.delete(folderPath)
      } else {
        next.add(folderPath)
      }
      // Update isAllExpanded state
      const groups = groupFilesByPath(files)
      const allFolderPaths = new Set(groups.map(g => g.folderPath))
      setIsAllExpanded(allFolderPaths.size === next.size && Array.from(allFolderPaths).every(p => next.has(p)))
      return next
    })
  }

  const toggleExpandAll = () => {
    const groups = groupFilesByPath(files)
    const allFolderPaths = new Set(groups.map(g => g.folderPath))
    
    if (isAllExpanded) {
      // Collapse all
      setExpandedFolders(new Set())
      setIsAllExpanded(false)
    } else {
      // Expand all
      setExpandedFolders(allFolderPaths)
      setIsAllExpanded(true)
    }
  }

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onSelectFiles([])
    } else {
      onSelectFiles(files.map(f => f.id))
    }
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
    return <FileText className="h-5 w-5 text-red-500" />
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-12 text-gray-500">
        <FileText className="h-12 w-12 mb-4 text-gray-400" />
        <p className="text-sm">Thư mục trống</p>
      </div>
    )
  }

  const fileGroups = groupFilesByPath(files)
  const hasMultipleFolders = fileGroups.length > 1 || (fileGroups.length === 1 && fileGroups[0].folderPath !== "/root")

  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-gray-50 z-10">
          <TableRow className="hover:bg-gray-50">
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>Tên</TableHead>
            <TableHead className="w-48">Ngày sửa đổi</TableHead>
            <TableHead className="w-48">Người cập nhật</TableHead>
            <TableHead className="w-32">Kích thước</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fileGroups.map(group => {
            const isExpanded = expandedFolders.has(group.folderPath)
            const isRoot = group.folderPath === "root"
            
            // If only one folder and it's root, don't show folder header
            if (!hasMultipleFolders && group.folderPath === "root") {
              return group.files.map(file => (
                <TableRow
                  key={file.id}
                  className={cn(
                    selectedFiles.includes(file.id) && "bg-blue-50 hover:bg-blue-50"
                  )}
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
                        onClick={() => onDownload?.(file.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete?.(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            }

            // Show folder header and files
            return (
              <>
                {/* Folder Header Row */}
                <TableRow
                  key={`folder-${group.folderPath}`}
                  className="bg-gray-100 hover:bg-gray-200 cursor-pointer"
                  onClick={() => toggleFolder(group.folderPath)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Folder className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-semibold text-gray-900">{group.folderName}</span>
                      {group.pathCount && group.pathCount > 1 && (
                        <span className="text-xs text-gray-400">({group.pathCount} thư mục)</span>
                      )}
                      <span className="text-xs text-gray-500">({group.files.length} file{group.files.length !== 1 ? 's' : ''})</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600"></TableCell>
                  <TableCell className="text-sm text-gray-600"></TableCell>
                  <TableCell className="text-sm text-gray-600"></TableCell>
                  <TableCell></TableCell>
                </TableRow>
                
                {/* Files inside folder (only when expanded) */}
                {isExpanded && group.files.map(file => (
                  <TableRow
                    key={file.id}
                    className={cn(
                      selectedFiles.includes(file.id) && "bg-blue-50 hover:bg-blue-50",
                      "hover:bg-gray-50"
                    )}
                  >
                    <TableCell>
                      <div className="pl-8">
                        <Checkbox
                          checked={selectedFiles.includes(file.id)}
                          onCheckedChange={() => toggleSelect(file.id)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 pl-8">
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
              </>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
