"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { DocumentSidebar } from "@/components/document/DocumentSidebar"
import { DocumentHeader } from "@/components/document/DocumentHeader"
import { DocumentContentView } from "@/components/document/DocumentContentView"
import { DocumentPageHeader } from "@/components/document/DocumentPageHeader"
import { getTree, TreeNode, listFiles, FileListItem, deleteFiles, deleteFolder, searchFiles, FileSearchItem } from "@/lib/api/documentApi"
import { DocumentUploadModal } from "@/components/document/DocumentUploadModal"
import { DocumentCreateFolderModal } from "@/components/document/DocumentCreateFolderModal"
import { DocumentExportModal } from "@/components/document/DocumentExportModal"
import { DocumentMoveModal } from "@/components/document/DocumentMoveModal"
import { format } from "date-fns"
import { toast } from "react-toastify";
import { getDefaultStore } from "@/lib/jotai";
import { authContextAtom } from "@/providers/auth/AuthProvider";

const store = getDefaultStore();

type FolderNode = {
  id: string | number
  name: string
  children?: FolderNode[]
  fileCount?: number
  year?: string
  path?: string
  folderId?: number // Numeric folder ID for API calls (if available)
}

type UiFileItem = {
  id: number
  name: string
  size: string | null
  type: "pdf" | "image" | "excel" | "doc"
  modifiedDate: string
  updatedBy: string
  fileUrl?: string
  blob_path?: string
}

// Transform API TreeNode to FolderNode format
const transformTreeNode = (node: TreeNode): FolderNode => {
  return {
    id: node.key,
    name: node.title,
    fileCount: node.document_count,
    // API provides the actual navigable path in metadata.path; key may not be a path
    path: node.metadata?.path ?? node.key,
    folderId: node.id ?? undefined, // Use node.id directly from API response
    children: node.children?.map(transformTreeNode),
  }
}

const normalizePath = (path?: string) => {
  if (!path) return ""
  // Remove both leading and trailing slashes for consistent comparison
  return path.replace(/^\/+/, "").replace(/\/+$/, "")
}

const getParentDirFromBlobPath = (blobPath?: string) => {
  if (!blobPath) return ""
  const trimmed = blobPath.replace(/\/+$/, "")
  const idx = trimmed.lastIndexOf("/")
  if (idx <= 0) return ""
  return trimmed.slice(0, idx)
}

const formatSize = (bytes?: number) => {
  if (bytes === undefined || bytes === null) return "-"
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

const detectType = (mime?: string): UiFileItem["type"] => {
  if (!mime) return "doc"
  if (mime.startsWith("image/")) return "image"
  if (mime.includes("pdf")) return "pdf"
  if (mime.includes("spreadsheet") || mime.includes("excel")) return "excel"
  return "doc"
}

const mapFile = (item: FileListItem): UiFileItem => {
  const dateStr = item.updated_at || item.created_at
  const modifiedDate = dateStr ? format(new Date(dateStr), "dd/MM/yyyy") : "-"
  return {
    id: item.id,
    name: item.display_name || item.file_name || "Chưa có tên",
    size: formatSize(item.file_size),
    type: detectType(item.mime_type),
    modifiedDate,
    updatedBy: item.updated_by_name || "",
    fileUrl: item.file_url,
    blob_path: item.blob_path,
  }
}

const mapSearchFile = (item: FileSearchItem): UiFileItem => {
  const dateStr = item.created_at
  const modifiedDate = dateStr ? format(new Date(dateStr), "dd/MM/yyyy") : "-"
  return {
    id: item.id,
    name: item.display_name || item.file_name || "Chưa có tên",
    size: formatSize(item.file_size),
    type: detectType(item.mime_type),
    modifiedDate,
    updatedBy: "", // Search API doesn't provide updated_by_name
    fileUrl: item.blob_path, // Use blob_path as fileUrl
    blob_path: item.blob_path,
  }
}

const getErrorMessage = (err: unknown, fallback: string) => {
  const e = err as {
    response?: { data?: { detail?: string; message?: string } }
    message?: string
  }
  return e?.response?.data?.detail || e?.response?.data?.message || e?.message || fallback
}

const findFolderByPath = (nodes: FolderNode[], targetPath: string): FolderNode | null => {
  const normalizedTarget = normalizePath(targetPath)
  for (const node of nodes) {
    if (normalizePath(node.path) === normalizedTarget) return node
    if (node.children) {
      const found = findFolderByPath(node.children, normalizedTarget)
      if (found) return found
    }
  }
  return null
}

// Find path from root to target folder in tree
const findPathToFolder = (
  nodes: FolderNode[], 
  targetFolder: FolderNode, 
  currentPath: FolderNode[] = []
): FolderNode[] | null => {
  for (const node of nodes) {
    const newPath = [...currentPath, node]
    
    // Check if this is the target folder
    if (node.id === targetFolder.id || 
        normalizePath(node.path || "") === normalizePath(targetFolder.path || "")) {
      return newPath
    }
    
    // Recursively search in children
    if (node.children && node.children.length > 0) {
      const found = findPathToFolder(node.children, targetFolder, newPath)
      if (found) return found
    }
  }
  return null
}

export default function DocumentPage() {
  const [folders, setFolders] = useState<FolderNode[]>([])
  const [selectedFolder, setSelectedFolder] = useState<FolderNode | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<number[]>([])
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]) // Folder paths
  const [navigationHistory, setNavigationHistory] = useState<FolderNode[]>([]) // Track navigation path
  const [searchValue, setSearchValue] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<UiFileItem[]>([])
  const [contentFolders, setContentFolders] = useState<FolderNode[]>([]) // Folders in current view
  const [contentLoading, setContentLoading] = useState(false)
  const [filesLoading, setFilesLoading] = useState(false)
  const [filesError, setFilesError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const resolvedPath = useMemo(() => {
    return selectedFolder?.path || ""
  }, [selectedFolder?.path])

  // Load full tree for sidebar
  const loadFullTree = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // Clear folders state before loading to prevent duplicates
      setFolders([])
      const treeData = await getTree()
      // Transform root node - if it has children, show them; otherwise show root itself
      const transformedRoot = transformTreeNode(treeData)
      const transformedFolders = transformedRoot.children && transformedRoot.children.length > 0
        ? transformedRoot.children
        : [transformedRoot]
      // Completely replace folders state (not append)
      setFolders(transformedFolders)
    } catch (err: unknown) {
      console.error("Failed to load tree:", err)
      setError(getErrorMessage(err, "Không thể tải cây thư mục"))
      // Clear folders on error to prevent stale data
      setFolders([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Load content (folders + files) of selected folder
  const loadFolderContent = useCallback(async (path: string) => {
    try {
      setContentLoading(true)
      setFilesLoading(true)
      setFilesError(null)
      
      const normalizedCurrentPath = normalizePath(path)

      // Load tree for this specific path to get immediate child folders and files
      const treeData = await getTree(normalizedCurrentPath || undefined)
      
      // Extract folders from tree response
      const folderNodes = (treeData.children || [])
        .filter((child) => {
          // Only include actual folder types, exclude files
          // Valid folder types: 'site', 'country', 'ip_type', 'ip_folder', 'procedure', 'folder'
          // Exclude: 'document' and 'file' (which represent files)
          return child.type === "folder" || 
                 child.type === "ip_folder" || 
                 child.type === "site" || 
                 child.type === "country" || 
                 child.type === "ip_type" || 
                 child.type === "procedure"
        })
        .map(transformTreeNode)
      setContentFolders(folderNodes)
      
      // If searching, use search API; otherwise use tree API
      if (searchValue.trim().length > 0) {
        // Use search API for search
        const searchResponse = await searchFiles({
          query: searchValue,
          search_in_files: true,
          search_in_folders: true,
          search_in_path: true,
          search_in_content: true,
          files_page: 1,
          files_page_size: 50,
          folders_page: 1,
          folders_page_size: 50,
        })
        
        // Map search files to UiFileItem
        const mappedFiles = (searchResponse.files.items || []).map(mapSearchFile)
        setFiles(mappedFiles)
        
        // Also update folders from search results if any
        if (searchResponse.folders.items && searchResponse.folders.items.length > 0) {
          const searchFolders = searchResponse.folders.items.map((folder) => ({
            id: folder.path,
            name: folder.name,
            fileCount: folder.file_count,
            path: folder.path,
            children: undefined,
          } as FolderNode))
          // Merge with existing folders or replace
          setContentFolders([...folderNodes, ...searchFolders])
        }
      } else {
        // Use tree API for normal browsing
        const filesFromTree = (treeData.children || [])
          .filter((child) => child.type === "file" || child.type === "document")
          .map((fileNode) => {
            // Transform tree file node to UiFileItem format
            const metadata = fileNode.metadata
            const dateStr = metadata?.last_modified
            const modifiedDate = dateStr ? format(new Date(dateStr), "dd/MM/yyyy") : "-"
            
            // Extract file ID from key or use a hash if no ID
            let fileId = fileNode.id || 0
            if (!fileId && fileNode.key) {
              // Generate a simple hash from key for ID
              fileId = fileNode.key.split('').reduce((acc, char) => {
                const hash = ((acc << 5) - acc) + char.charCodeAt(0)
                return hash & hash
              }, 0)
            }
            
            return {
              id: Math.abs(fileId), // Ensure positive ID
              name: fileNode.title || "Chưa có tên",
              size: formatSize(metadata?.size),
              type: detectType(metadata?.mime_type),
              modifiedDate,
              updatedBy: "", // Tree API doesn't provide this
              fileUrl: fileNode.key, // Use key as file path/URL
              blob_path: fileNode.key, // Use key as blob_path
            } as UiFileItem
          })
        
        // Files from tree are direct children of current folder, so always show them
        setFiles(filesFromTree)
      }
      setSelectedFiles([])
    } catch (err: unknown) {
      console.error("Failed to load folder content:", err)
      setFilesError(getErrorMessage(err, "Không thể tải nội dung thư mục"))
      setContentFolders([])
      setFiles([])
    } finally {
      setContentLoading(false)
      setFilesLoading(false)
    }
  }, [searchValue])

  useEffect(() => {
    loadFullTree()
  }, [loadFullTree])

  // Load content when folder selection or search changes
  useEffect(() => {
    if (resolvedPath === undefined) return
    const handle = setTimeout(() => {
      loadFolderContent(resolvedPath)
    }, searchValue ? 300 : 0) // Debounce only for search, not for folder change
    return () => clearTimeout(handle)
  }, [resolvedPath, searchValue, loadFolderContent])

  const getBreadcrumbs = () => {
    const result = ["Kho Tài liệu"]
    
    // Use navigation history if available, otherwise build from path
    if (navigationHistory.length > 0) {
      // Track seen paths to avoid duplicates
      const seenPaths = new Set<string>()
      navigationHistory.forEach(folder => {
        const normalizedPath = normalizePath(folder.path || "")
        // Skip if we've already seen this path
        if (normalizedPath && seenPaths.has(normalizedPath)) {
          return
        }
        seenPaths.add(normalizedPath)
        
        // Get folder name from path or use name property
        const pathParts = folder.path?.split("/").filter(Boolean) || []
        const folderName = pathParts.length > 0 ? pathParts[pathParts.length - 1] : folder.name
        if (folderName && !result.includes(folderName)) {
          result.push(folderName)
        } else if (folderName) {
          // If name already exists, use path to make it unique
          const uniqueName = pathParts.length > 1 ? pathParts.slice(-2).join("/") : folderName
          if (!result.includes(uniqueName)) {
            result.push(uniqueName)
          }
        }
      })
    } else if (selectedFolder) {
      // Fallback: build from selectedFolder path
      const pathParts = selectedFolder.path?.split("/").filter(Boolean) || []
      if (pathParts.length > 0) {
        // Remove duplicates
        const uniqueParts: string[] = []
        pathParts.forEach(part => {
          if (uniqueParts.length === 0 || uniqueParts[uniqueParts.length - 1] !== part) {
            uniqueParts.push(part)
          }
        })
        result.push(...uniqueParts)
      } else if (selectedFolder.name) {
        result.push(selectedFolder.name)
      }
    }
    
    return result
  }

  const handleRefresh = () => {
    // Only refresh current folder content, not the entire sidebar tree
    if (resolvedPath !== undefined) {
      loadFolderContent(resolvedPath)
    } else {
      // If at root, refresh root content
      loadFolderContent("")
    }
  }

  const handleOpenCreate = () => {
    setIsCreateOpen(true)
  }

  const handleOpenUpload = () => {
    setIsUploadOpen(true)
  }

  const handleCreateSuccess = async () => {
    await loadFullTree()
    // Reload content of current folder
    if (resolvedPath !== undefined) {
      await loadFolderContent(resolvedPath)
    }
  }

  const handleUploadSuccess = async () => {
    await loadFullTree()
    // Reload content of current folder
    if (resolvedPath !== undefined) {
      await loadFolderContent(resolvedPath)
    }
  }

  const handleDoubleClickFolder = (folder: FolderNode) => {
    // Clear folder selection when navigating
    setSelectedFolders([])
    // Update navigation history
    setNavigationHistory(prev => {
      const normalizedFolderPath = normalizePath(folder.path || "")
      
      // Find if folder already in history (to handle back navigation)
      const existingIndex = prev.findIndex(f => normalizePath(f.path || "") === normalizedFolderPath)
      if (existingIndex >= 0) {
        // If found, truncate history to that point (don't add again)
        return prev.slice(0, existingIndex + 1)
      }
      
      // Check if this is the same as the last folder in history (avoid duplicates)
      if (prev.length > 0) {
        const lastFolder = prev[prev.length - 1]
        const lastPath = normalizePath(lastFolder.path || "")
        if (lastPath === normalizedFolderPath) {
          // Same folder, don't add
          return prev
        }
      }
      
      // Otherwise, add to history
      return [...prev, folder]
    })
    setSelectedFolder(folder)
    // loadFolderContent will be triggered by useEffect
  }

  const toggleFolderSelect = (folderPath: string) => {
    setSelectedFolders(prev => {
      if (prev.includes(folderPath)) {
        return prev.filter(p => p !== folderPath)
      }
      return [...prev, folderPath]
    })
  }

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      // Click root - set selectedFolder to null and clear history
      setSelectedFolder(null)
      setNavigationHistory([])
      setSelectedFolders([])
    } else {
      // Navigate to folder at history index (index - 1 because index 0 is root)
      const targetIndex = index - 1
      if (targetIndex < navigationHistory.length) {
        const targetFolder = navigationHistory[targetIndex]
        // Truncate history to clicked breadcrumb
        setNavigationHistory(prev => prev.slice(0, targetIndex + 1))
        setSelectedFolder(targetFolder)
        setSelectedFolders([])
      } else {
        // Fallback: build path from breadcrumbs and find in tree
        const breadcrumbs = getBreadcrumbs()
        const targetPathParts = breadcrumbs.slice(1, index + 1)
        const targetPath = "/" + targetPathParts.join("/")
        
        const foundFolder = findFolderByPath(folders, targetPath)
        if (foundFolder) {
          // Rebuild history up to this point
          const newHistory: FolderNode[] = []
          let currentPath = ""
          for (let i = 0; i < targetPathParts.length; i++) {
            currentPath = currentPath ? `${currentPath}/${targetPathParts[i]}` : `/${targetPathParts[i]}`
            const folder = findFolderByPath(folders, currentPath)
            if (folder) {
              newHistory.push(folder)
            }
          }
          setNavigationHistory(newHistory)
          setSelectedFolder(foundFolder)
          setSelectedFolders([])
        }
      }
    }
  }

  const parentPath = selectedFolder?.path || ""

  const handleDownload = async (fileId: number) => {
    try {
      setIsDownloading(true)
      
      // Get token from store
      const authContext = store.get(authContextAtom);
      const token = authContext?.token;
      
      if (!token) {
        toast.error("Vui lòng đăng nhập lại");
        return;
      }

      // Download trực tiếp bằng fetch với headers đúng
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://20.205.246.175/api';
      const response = await fetch(
        `${BACKEND_URL}/v1/file-management/files/${fileId}/download`,
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
      let filename = `file_${fileId}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
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
      
      toast.success("Đã tải file thành công")
    } catch (err: unknown) {
      console.error("Download failed:", err)
      const errorMessage = getErrorMessage(err, "Không thể tải file. Vui lòng thử lại.")
      setFilesError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleBulkDownload = async () => {
    if (selectedFiles.length === 0) return
    
    try {
      setIsDownloading(true)
      
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
        a.download = `files_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success(`Đã tải ${selectedFiles.length} file thành công`);
        setSelectedFiles([]);
      }
    } catch (err: unknown) {
      // Ignore error - IDM có thể tự động tải file
      console.error("Bulk download failed:", err)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleOpenExport = () => {
    setIsExportOpen(true)
  }

  const handleDeleteFolders = async (folderPaths: string[]) => {
    if (folderPaths.length === 0) return
    
    try {
      setContentLoading(true)
      
      // Normalize paths for comparison
      const normalizedPaths = folderPaths.map(p => normalizePath(p))
      
      // Find folder IDs from paths by searching in contentFolders and full tree
      const folderIds: number[] = []
      const findFolderIds = (nodes: FolderNode[], targetPaths: string[]): void => {
        for (const node of nodes) {
          if (node.path) {
            const normalizedNodePath = normalizePath(node.path)
            // Compare normalized paths
            if (targetPaths.includes(normalizedNodePath)) {
              // Prefer folderId if available
              if (node.folderId !== undefined && node.folderId !== null && node.folderId > 0) {
                folderIds.push(node.folderId)
              } else {
                // Fallback: try to extract ID from id field (shouldn't happen if backend returns id)
                const id = typeof node.id === 'number' ? node.id : parseInt(String(node.id), 10)
                if (!isNaN(id) && id > 0) {
                  folderIds.push(id)
                }
              }
            }
          }
          if (node.children) {
            findFolderIds(node.children, targetPaths)
          }
        }
      }
      
      // Search in contentFolders first (current view), then full tree
      findFolderIds(contentFolders, normalizedPaths)
      if (folderIds.length < folderPaths.length) {
        findFolderIds(folders, normalizedPaths)
      }
      
      if (folderIds.length === 0) {
        toast.error("Không tìm thấy folder để xóa")
        return
      }
      
      // Delete folders sequentially
      let successCount = 0
      let failCount = 0
      const errors: string[] = []
      
      for (const folderId of folderIds) {
        try {
          const response = await deleteFolder(folderId)
          if (response.success) {
            successCount++
          } else {
            failCount++
            errors.push(response.error || response.message || "Lỗi không xác định")
          }
        } catch (err: unknown) {
          failCount++
          errors.push(getErrorMessage(err, "Lỗi không xác định"))
        }
      }
      
      // Show toast messages
      if (successCount > 0 && failCount === 0) {
        toast.success(successCount === 1 ? "Đã xóa folder thành công" : `Đã xóa ${successCount} folder thành công`)
      } else if (successCount > 0 && failCount > 0) {
        toast.error(`Đã xóa ${successCount}/${folderIds.length} folder. Một số folder không thể xóa.`)
      } else {
        toast.error(`Không thể xóa folder: ${errors[0] || "Lỗi không xác định"}`)
      }
      
      // Refresh tree and content
      await loadFullTree()
      await loadFolderContent(resolvedPath)
      setSelectedFolders([])
    } catch (err: unknown) {
      console.error("Delete folders failed:", err)
      const errorMessage = getErrorMessage(err, "Không thể xóa folder. Vui lòng thử lại.")
      toast.error(errorMessage)
    } finally {
      setContentLoading(false)
    }
  }

  const handleDelete = (fileId: number) => {
    handleDeleteMany([fileId])
  }

  const handleBulkDelete = async () => {
    const hasFiles = selectedFiles.length > 0
    const hasFolders = selectedFolders.length > 0
    
    if (!hasFiles && !hasFolders) return
    
    // Delete folders first, then files
    if (hasFolders) {
      await handleDeleteFolders(selectedFolders)
    }
    if (hasFiles) {
      await handleDeleteMany(selectedFiles)
    }
  }

  const handleMoveDocuments = () => {
    if (selectedFiles.length === 0) {
      toast.error("Vui lòng chọn ít nhất một file để di chuyển")
      return
    }
    setIsMoveModalOpen(true)
  }

  const handleMoveSuccess = async () => {
    // Refresh current folder content after successful move
    await loadFolderContent(resolvedPath)
    // Clear selection for successfully moved files
    setSelectedFiles([])
  }

  const handleDeleteMany = async (fileIds: number[]) => {
    if (fileIds.length === 0) return
    try {
      setFilesLoading(true)
      const response = await deleteFiles(fileIds)
      
      // Check if API returned success: false (even with 200 status)
      if (response.success === false) {
        const deletedCount = response.deleted_count || 0
        // Use message from API response if available, otherwise create default message
        const errorMessage = response.message || "Không thể xóa file. Vui lòng thử lại."
        
        if (deletedCount > 0) {
          // Partial success: some files deleted, some failed
          // If API provides message, use it; otherwise show count info
          const toastMessage = response.message 
            ? `${response.message} (Đã xóa ${deletedCount}/${fileIds.length} file)`
            : `Đã xóa ${deletedCount}/${fileIds.length} file. Một số file không thể xóa.`
          toast.error(toastMessage)
        } else {
          // Complete failure: no files deleted
          toast.error(errorMessage)
        }
        setFilesError(errorMessage)
        // Still refresh to show current state
        await loadFolderContent(resolvedPath)
      } else {
        // Success: all files deleted
        // Use message from API if available, otherwise create default
        const deletedCount = response.deleted_count || fileIds.length
        const successMessage = response.message || (deletedCount === 1 ? "Đã xóa file thành công" : `Đã xóa ${deletedCount} file thành công`)
        toast.success(successMessage)
        await loadFolderContent(resolvedPath)
      }
    } catch (err: unknown) {
      console.error("Delete files failed:", err)
      const errorMessage = getErrorMessage(err, "Không thể xóa file. Vui lòng thử lại.")
      setFilesError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setFilesLoading(false)
      setSelectedFiles([])
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Page Header */}
      <DocumentPageHeader
        onAddFolder={handleOpenCreate}
        onUploadFile={handleOpenUpload}
        onExport={handleOpenExport}
        selectedFilesCount={selectedFiles.length}
        selectedFoldersCount={selectedFolders.length}
        onBulkDelete={handleBulkDelete}
        onBulkDownload={handleBulkDownload}
        onMove={handleMoveDocuments}
        isDeleting={filesLoading || contentLoading}
        isDownloading={isDownloading}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        {loading ? (
          <div className="w-64 lg:w-72 bg-gray-50 border-r border-gray-200 flex items-center justify-center">
            <div className="text-sm text-gray-500">Đang tải...</div>
          </div>
        ) : error ? (
          <div className="w-64 lg:w-72 bg-gray-50 border-r border-gray-200 flex items-center justify-center p-4">
            <div className="text-sm text-red-500 text-center">{error}</div>
          </div>
        ) : (
          <DocumentSidebar
            folders={folders}
            selectedFolder={selectedFolder}
            onSelectFolder={(folder) => {
              // When selecting from sidebar, reset and rebuild path from root
              if (folder === null) {
                setSelectedFolder(null)
                setNavigationHistory([])
                setSelectedFolders([])
              } else {
                // Find path from root to selected folder
                const pathFromRoot = findPathToFolder(folders, folder)
                
                if (pathFromRoot && pathFromRoot.length > 0) {
                  // Reset history and set to path from root
                  setNavigationHistory(pathFromRoot)
                  setSelectedFolder(folder)
                } else {
                  // Fallback: if path not found, just set the folder directly
                  setNavigationHistory([folder])
                  setSelectedFolder(folder)
                }
                setSelectedFolders([])
              }
            }}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 pt-2">
          {/* Breadcrumb Header */}
          <DocumentHeader
            breadcrumbs={getBreadcrumbs()}
            onRefresh={handleRefresh}
            onUploadFile={handleOpenUpload}
            onAddFolder={handleOpenCreate}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onBreadcrumbClick={handleBreadcrumbClick}
          />

          {/* Content View - Folders and Files */}
          {(contentLoading || filesLoading) ? (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
              Đang tải...
            </div>
          ) : filesError ? (
            <div className="flex flex-1 items-center justify-center text-sm text-red-500 text-center px-4">
              {filesError}
            </div>
          ) : (
            <DocumentContentView
              folders={contentFolders}
              files={files}
              selectedFiles={selectedFiles}
              selectedFolders={selectedFolders}
              onSelectFiles={setSelectedFiles}
              onSelectFolders={setSelectedFolders}
              onToggleFolderSelect={toggleFolderSelect}
              onDoubleClickFolder={handleDoubleClickFolder}
              onDownload={handleDownload}
              onDelete={handleDelete}
              loading={contentLoading || filesLoading}
            />
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      <DocumentCreateFolderModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        parentPath={parentPath}
        onSuccess={handleCreateSuccess}
      />

      {/* Upload File Modal */}
      <DocumentUploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        selectedFolder={selectedFolder}
        parentPath={parentPath}
        onSuccess={handleUploadSuccess}
      />

      {/* Export Modal */}
      <DocumentExportModal
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        onSuccess={() => {
          // Optionally refresh data after export
        }}
      />

      {/* Move Documents Modal */}
      <DocumentMoveModal
        open={isMoveModalOpen}
        onOpenChange={setIsMoveModalOpen}
        documentIds={selectedFiles}
        currentPath={resolvedPath}
        onSuccess={handleMoveSuccess}
      />
    </div>
  )
}
