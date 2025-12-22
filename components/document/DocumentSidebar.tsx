"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

type FolderNode = {
  id: string | number
  name: string
  children?: FolderNode[]
  fileCount?: number
  year?: string
  path?: string
  folderId?: number
}

type Props = {
  folders: FolderNode[]
  selectedFolder: FolderNode | null
  onSelectFolder: (folder: FolderNode | null) => void
}

export function DocumentSidebar({ folders, selectedFolder, onSelectFolder }: Props) {
  const [expandedIds, setExpandedIds] = useState<(string | number)[]>([])

  // Auto-expand root folders when folders change
  useEffect(() => {
    if (folders.length > 0) {
      const rootIds = folders.map(f => f.id)
      setExpandedIds(prev => {
        const newIds = [...prev]
        rootIds.forEach(id => {
          if (!newIds.includes(id)) {
            newIds.push(id)
          }
        })
        return newIds
      })
    }
  }, [folders])

  const toggleExpand = (id: string | number) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Generate unique key for folder to avoid React duplicate key warnings
  // Uses index as fallback to ensure uniqueness even when path/id are duplicated
  const getFolderKey = (folder: FolderNode, level: number, index: number): string => {
    // Use folderId if available (most unique)
    if (folder.folderId) {
      return `folder-${folder.folderId}`
    }
    // Combine path + index if path available
    if (folder.path) {
      return `path-${folder.path}-${index}`
    }
    // Combine id + index as last resort
    return `id-${folder.id}-${index}`
  }

  const FolderItem = ({ folder, level = 0, index = 0 }: { folder: FolderNode; level?: number; index?: number }) => {
    const hasChildren = folder.children && folder.children.length > 0
    const isExpanded = expandedIds.includes(folder.id)
    const isSelected = selectedFolder?.id === folder.id

    return (
      <div>
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded transition-colors",
            isSelected && "bg-blue-100 hover:bg-blue-100",
            level === 0 && "font-medium"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleExpand(folder.id)
            }
            onSelectFolder(folder)
          }}
        >
          {hasChildren ? (
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
          ) : (
            <div className="w-4 flex-shrink-0" />
          )}
          
          {isExpanded && hasChildren ? (
            <FolderOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
          ) : (
            <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
          )}
          
          <span className={cn("flex-1 text-sm", isSelected && "text-blue-700 font-medium")}>
            {folder.name}
            {folder.fileCount !== undefined && folder.fileCount > 0 && (
              <span className="ml-2 text-xs text-gray-500">({folder.fileCount})</span>
            )}
          </span>
        </div>

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
    <div className="w-64 lg:w-72 bg-gray-50 border-r border-gray-200 overflow-y-auto h-full">      
      <div className="py-3 px-2">
        {/* Root option */}
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded transition-colors",
            selectedFolder === null && "bg-blue-100 hover:bg-blue-100",
            "font-medium"
          )}
          onClick={() => onSelectFolder(null)}
        >
          <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span className={cn("flex-1 text-sm", selectedFolder === null && "text-blue-700 font-medium")}>
            Kho Tài liệu
          </span>
        </div>
        
        {folders.map((folder, index) => (
          <FolderItem key={getFolderKey(folder, 0, index)} folder={folder} index={index} />
        ))}
      </div>
    </div>
  )
}
