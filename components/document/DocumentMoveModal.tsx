"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Folder, FolderOpen, ChevronRight, ChevronDown, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTree, TreeNode, moveDocuments, MoveDocumentResult } from "@/lib/api/documentApi"
// import toast from "react-hot-toast"
import { toast } from "react-toastify";


type FolderNode = {
  id: string | number
  name: string
  children?: FolderNode[]
  path?: string
  folderId?: number
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentIds: number[]
  currentPath: string
  onSuccess?: () => void
}

// Transform API TreeNode to FolderNode format
const transformTreeNode = (node: TreeNode): FolderNode => {
  return {
    id: node.key,
    name: node.title,
    path: node.metadata?.path ?? node.key,
    folderId: node.id ?? undefined, // Use node.id directly from API response
    children: node.children?.filter(child => 
      child.type === "folder" || 
      child.type === "ip_folder" || 
      child.type === "site" || 
      child.type === "country" || 
      child.type === "ip_type" || 
      child.type === "procedure"
    ).map(transformTreeNode),
  }
}

// Generate unique key for folder
const getFolderKey = (folder: FolderNode, level: number, index: number): string => {
  if (folder.folderId) {
    return `folder-${folder.folderId}-${level}-${index}`
  }
  if (folder.path) {
    return `path-${folder.path}-${level}-${index}`
  }
  return `id-${folder.id}-${level}-${index}`
}

// Normalize path (remove leading and trailing slashes)
const normalizePath = (path?: string) => {
  if (!path) return ""
  return path.replace(/^\/+/, "").replace(/\/+$/, "")
}

export function DocumentMoveModal({ open, onOpenChange, documentIds, currentPath, onSuccess }: Props) {
  const [targetPath, setTargetPath] = useState<string>("")
  const [overwrite, setOverwrite] = useState(false)
  const [folders, setFolders] = useState<FolderNode[]>([])
  const [selectedFolder, setSelectedFolder] = useState<FolderNode | null>(null)
  const [expandedIds, setExpandedIds] = useState<(string | number)[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [moveResults, setMoveResults] = useState<MoveDocumentResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [navigationPath, setNavigationPath] = useState<FolderNode[]>([]) // Track navigation path
  const [currentViewFolders, setCurrentViewFolders] = useState<FolderNode[]>([]) // Folders in current view

  // Load folder tree
  useEffect(() => {
    if (open) {
      setNavigationPath([])
      loadFolders()
    }
  }, [open])

  const loadFolders = async (path?: string) => {
    try {
      setIsLoading(true)
      const treeData = await getTree(path)
      const transformedRoot = transformTreeNode(treeData)
      const folders = transformedRoot.children && transformedRoot.children.length > 0
        ? transformedRoot.children
        : []
      setCurrentViewFolders(folders)
      setFolders(folders) // Keep for tree view compatibility
      
      // Auto-expand root folders only at root level
      if (!path) {
        const rootIds = folders.map(f => f.id)
        setExpandedIds(rootIds)
      }
    } catch (err: any) {
      console.error("Failed to load folders:", err)
      toast.error("Không thể tải danh sách thư mục")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpand = (id: string | number) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSelectFolder = (folder: FolderNode) => {
    setSelectedFolder(folder)
    setTargetPath(folder.path || "")
    setError(null)
  }

  const handleNavigateInto = async (folder: FolderNode) => {
    // Add folder to navigation path
    setNavigationPath(prev => [...prev, folder])
    // Load children of this folder
    const folderPath = normalizePath(folder.path || "")
    await loadFolders(folderPath)
    // Clear selection when navigating
    setSelectedFolder(null)
    setTargetPath("")
  }

  const handleNavigateBack = async (index: number) => {
    // Truncate navigation path
    const newPath = navigationPath.slice(0, index)
    setNavigationPath(newPath)
    
    // Load folders for the target level
    if (newPath.length === 0) {
      // Back to root
      await loadFolders()
    } else {
      const targetFolder = newPath[newPath.length - 1]
      const folderPath = normalizePath(targetFolder.path || "")
      await loadFolders(folderPath)
    }
    
    // Clear selection
    setSelectedFolder(null)
    setTargetPath("")
  }

  const handleMove = async () => {
    if (!targetPath) {
      setError("Vui lòng chọn thư mục đích")
      return
    }

    if (targetPath === currentPath) {
      setError("Thư mục đích phải khác thư mục hiện tại")
      return
    }

    try {
      setIsMoving(true)
      setError(null)
      setMoveResults(null)

      const response = await moveDocuments({
        document_ids: documentIds,
        target_path: targetPath,
        overwrite,
      })

      setMoveResults(response.results)

      const successCount = response.results.filter(r => r.status === "moved").length
      const errorCount = response.results.filter(r => r.status === "error").length

      if (successCount > 0 && errorCount === 0) {
        toast.success(`Đã di chuyển ${successCount} file(s) thành công`)
        handleClose()
        onSuccess?.()
      } else if (successCount > 0 && errorCount > 0) {
        toast.error(`Đã di chuyển ${successCount} file(s), ${errorCount} file(s) thất bại`)
      } else {
        toast.error("Không thể di chuyển file(s)")
      }
    } catch (err: any) {
      console.error("Move failed:", err)
      const errorMessage = err.response?.data?.detail || err.message || "Không thể di chuyển file(s)"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsMoving(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTargetPath("")
    setOverwrite(false)
    setSelectedFolder(null)
    setMoveResults(null)
    setError(null)
    setNavigationPath([])
    setCurrentViewFolders([])
  }

  const FolderItem = ({ folder, level = 0, index = 0 }: { folder: FolderNode; level?: number; index?: number }) => {
    const hasChildren = folder.children && folder.children.length > 0
    const isExpanded = expandedIds.includes(folder.id)
    const isSelected = selectedFolder?.id === folder.id

    return (
      <div>
        <div className="flex items-center gap-2">
          {/* Expand/Collapse button (for tree view) */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand(folder.id)
              }}
              className="flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
            </button>
          )}
          
          {/* Folder icon and name - click to navigate or select */}
          <div
            className={cn(
              "flex items-center gap-2 flex-1 px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded transition-colors",
              isSelected && "bg-blue-100 hover:bg-blue-100",
              level === 0 && "font-medium"
            )}
            style={{ paddingLeft: level > 0 ? `${level * 16}px` : "0px" }}
            onClick={() => {
              if (hasChildren) {
                handleNavigateInto(folder)
              } else {
                handleSelectFolder(folder)
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation()
              // Double-click to select folder as target (even if it has children)
              handleSelectFolder(folder)
            }}
          >
            {isExpanded && hasChildren ? (
              <FolderOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
            )}
            
            <span className={cn("flex-1 text-sm", isSelected && "text-blue-700 font-medium")}>
              {folder.name}
            </span>
          </div>
        </div>

        {/* Tree view children (if expanded) */}
        {hasChildren && isExpanded && (
          <div>
            {folder.children!.map((child, childIndex) => (
              <FolderItem 
                key={getFolderKey(child, level + 1, childIndex)} 
                folder={child} 
                level={level + 1}
                index={childIndex}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Di chuyển {documentIds.length} file(s)</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Current Path */}
          <div className="space-y-1">
            <Label>Thư mục hiện tại</Label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">
              {currentPath || "Root"}
            </div>
          </div>

          {/* Target Path */}
          <div className="space-y-1">
            <Label>Thư mục đích *</Label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700 min-h-[2.5rem]">
              {targetPath || "Chưa chọn thư mục"}
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          {navigationPath.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
              <button
                onClick={() => handleNavigateBack(0)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Kho Tài liệu
              </button>
              {navigationPath.map((folder, index) => (
                <div key={folder.id} className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3 text-gray-400" />
                  <button
                    onClick={() => handleNavigateBack(index + 1)}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      // Double-click on breadcrumb to select that folder
                      handleSelectFolder(folder)
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {folder.name}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Folder Tree Selector */}
          <div className="space-y-1">
            <Label>Chọn thư mục</Label>
            <div className="border rounded-md p-2 max-h-[300px] overflow-y-auto bg-gray-50">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {navigationPath.length === 0 && (
                    <div
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded transition-colors",
                        selectedFolder === null && "bg-blue-100 hover:bg-blue-100",
                        "font-medium"
                      )}
                      onClick={() => {
                        setSelectedFolder(null)
                        setTargetPath("")
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        setSelectedFolder(null)
                        setTargetPath("")
                      }}
                    >
                      <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className={cn("flex-1 text-sm", selectedFolder === null && "text-blue-700 font-medium")}>
                        Kho Tài liệu (Root)
                      </span>
                    </div>
                  )}
                  {currentViewFolders.length > 0 ? (
                    currentViewFolders.map((folder, index) => (
                      <FolderItem key={getFolderKey(folder, 0, index)} folder={folder} index={index} />
                    ))
                  ) : (
                    folders.map((folder, index) => (
                      <FolderItem key={getFolderKey(folder, 0, index)} folder={folder} index={index} />
                    ))
                  )}
                </>
              )}
            </div>
          </div>

          {/* Overwrite Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="overwrite"
              checked={overwrite}
              onCheckedChange={(checked) => setOverwrite(checked === true)}
            />
            <Label htmlFor="overwrite" className="cursor-pointer">
              Ghi đè file nếu đã tồn tại
            </Label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Move Results */}
          {moveResults && moveResults.length > 0 && (
            <div className="space-y-2">
              <Label>Kết quả di chuyển</Label>
              <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto bg-gray-50">
                {moveResults.map((result) => (
                  <div
                    key={result.document_id}
                    className={cn(
                      "flex items-center gap-2 py-2 border-b last:border-b-0",
                      result.status === "moved" ? "text-green-700" : "text-red-700"
                    )}
                  >
                    {result.status === "moved" ? (
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 flex-shrink-0" />
                    )}
                    <div className="flex-1 text-sm">
                      <div className="font-medium">File ID: {result.document_id}</div>
                      {result.status === "moved" && result.new_blob_path && (
                        <div className="text-xs text-gray-600">{result.new_blob_path}</div>
                      )}
                      {result.status === "error" && result.error && (
                        <div className="text-xs">{result.error}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isMoving}>
            {moveResults ? "Đóng" : "Hủy"}
          </Button>
          {!moveResults && (
            <Button onClick={handleMove} disabled={isMoving || !targetPath}>
              {isMoving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang di chuyển...
                </>
              ) : (
                "Di chuyển"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

