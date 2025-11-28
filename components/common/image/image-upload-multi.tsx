"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ImagePlus, X, GripVertical } from "lucide-react"

type ImageUploadMultiProps = {
  value?: File[] | string[] // Files cho create, string[] URLs cho edit
  onChange?: (data: {
    newFiles: File[]
    existingUrls: string[]
    removedUrls: string[]
    order: Array<{ type: "file" | "url"; index: number; originalUrl?: string }>
  }) => void
  existingUrls?: string[] // URLs ảnh đã lưu (cho edit mode)
  accept?: string[]
  maxFiles?: number
  cardTitle?: string
}

type GalleryItem = {
  id: string
  type: "file" | "url"
  file?: File
  url: string // object URL cho file, hoặc server URL cho existing
  originalUrl?: string // server URL gốc (cho existing images)
}

export default function ImageUploadMulti({
  value = [],
  onChange,
  existingUrls = [],
  accept = ["image/png", "image/jpeg", "image/jpg", "image/webp"],
  maxFiles,
}: ImageUploadMultiProps) {
  const [items, setItems] = React.useState<GalleryItem[]>([])
  const [removedUrls, setRemovedUrls] = React.useState<string[]>([])
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const initializedRef = React.useRef(false)
  const prevExistingUrlsRef = React.useRef<string[]>([])
  const prevValueRef = React.useRef<File[] | string[]>([])

  // Sync internal items from props only when props actually change
  React.useEffect(() => {
    const existingUrlsChanged = JSON.stringify(prevExistingUrlsRef.current) !== JSON.stringify(existingUrls)
    const valueChanged = prevValueRef.current.length !== value.length

    // Only sync if not initialized yet OR if props actually changed
    if (!initializedRef.current || existingUrlsChanged || valueChanged) {
      // Cleanup old object URLs
      setItems((prev) => {
        prev.forEach((i) => {
          if (i.type === "file" && i.url.startsWith("blob:")) {
            URL.revokeObjectURL(i.url)
          }
        })
        return []
      })

      const newItems: GalleryItem[] = []

      // Add existing URLs (for edit mode)
      if (existingUrls && existingUrls.length > 0) {
        existingUrls.forEach((url, idx) => {
          if (!removedUrls.includes(url)) {
            newItems.push({
              id: `existing_${idx}_${url}`,
              type: "url",
              url: url,
              originalUrl: url,
            })
          }
        })
      }

      // Add new files
      if (Array.isArray(value) && value.length > 0) {
        // Detect if value contains Files or URLs
        const hasFiles = value.some((item) => item instanceof File)

        if (hasFiles) {
          // Create mode: value is File[]
          ; (value as File[]).forEach((file, idx) => {
            newItems.push({
              id: `file_${Date.now()}_${idx}_${file.name}`,
              type: "file",
              file,
              url: URL.createObjectURL(file),
            })
          })
        }
      }

      setItems(newItems)

      initializedRef.current = true
      prevExistingUrlsRef.current = existingUrls
      prevValueRef.current = value

      // Cleanup on unmount
      return () => {
        newItems.forEach((i) => {
          if (i.type === "file" && i.url.startsWith("blob:")) {
            URL.revokeObjectURL(i.url)
          }
        })
      }
    }
  }, [value, existingUrls, removedUrls])

  const emitChangeFromList = React.useCallback(
    (list: GalleryItem[], removed: string[] = removedUrls) => {
      const newFiles = list
        .filter((i) => i.type === "file")
        .map((i) => i.file!)
        .filter(Boolean)
      const existUrls = list
        .filter((i) => i.type === "url")
        .map((i) => i.originalUrl!)
        .filter(Boolean)

      // Build order array with type and index mapping
      const order = list.map((item, index) => {
        if (item.type === "file") {
          // Find index in newFiles array
          const fileIndex = newFiles.findIndex((f) => f === item.file)
          return { type: "file" as const, index: fileIndex }
        } else {
          // Find index in existUrls array
          const urlIndex = existUrls.findIndex((u) => u === item.originalUrl)
          return { type: "url" as const, index: urlIndex, originalUrl: item.originalUrl }
        }
      })

      onChange?.({
        newFiles,
        existingUrls: existUrls,
        removedUrls: removed,
        order,
      })
    },
    [onChange, removedUrls],
  )

  // Emit onChange whenever items or removedUrls change (after state updates)
  React.useEffect(() => {
    // Skip if not initialized yet (prevents firing on initial mount)
    if (!initializedRef.current) return
    
    emitChangeFromList(items, removedUrls)
  }, [items, removedUrls, emitChangeFromList])

  const addFiles = React.useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      const incoming = Array.from(files).filter((f) => accept.includes(f.type))
      const currentCount = items.length
      const limited =
        typeof maxFiles === "number" && maxFiles > 0
          ? incoming.slice(0, Math.max(0, maxFiles - currentCount))
          : incoming
      if (limited.length === 0) return

      const newItems: GalleryItem[] = limited.map((file, idx) => ({
        id: `file_${Date.now()}_${idx}_${file.name}`,
        type: "file",
        file,
        url: URL.createObjectURL(file),
      }))

      setItems((prev) => [...prev, ...newItems])
    },
    [accept, maxFiles, items.length],
  )

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files)
    e.currentTarget.value = ""
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    addFiles(e.dataTransfer.files)
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const removeAt = (idx: number) => {
    const item = items[idx]
    if (!item) return

    setItems((prev) => {
      const clone = [...prev]
      const [removed] = clone.splice(idx, 1)

      // Cleanup object URL if it's a file
      if (removed && removed.type === "file" && removed.url.startsWith("blob:")) {
        URL.revokeObjectURL(removed.url)
      }

      // Track removed existing URLs
      if (removed && removed.type === "url" && removed.originalUrl) {
        setRemovedUrls((prevRemoved) => [...prevRemoved, removed.originalUrl!])
      }

      return clone
    })
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", e.currentTarget.innerHTML)
    // Add slight opacity to dragged element
    e.currentTarget.style.opacity = "0.5"
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = "1"
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragOverItem = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedIndex === null || draggedIndex === index) return

    setDragOverIndex(index)
  }

  const handleDropOnItem = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragOverIndex(null)
      return
    }

    setItems((prev) => {
      const newItems = [...prev]
      const [draggedItem] = newItems.splice(draggedIndex, 1)
      newItems.splice(dropIndex, 0, draggedItem)
      return newItems
    })

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {/* Add Tile */}
      <div
        className={cn(
          "flex items-center justify-center aspect-square rounded-md border-2 border-dashed",
          "text-muted-foreground hover:bg-accent/40 cursor-pointer select-none",
        )}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        role="button"
        aria-label="Add images"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <ImagePlus className="w-6 h-6" />
          <span className="text-sm font-medium">Add Image</span>
          <span className="text-xs">png, jpeg, jpg</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(",")}
          multiple
          onChange={onInputChange}
          className="hidden"
        />
      </div>

      {/* Image Tiles - Added draggable functionality */}
      {items.map((it, idx) => (
        <div
          key={it.id}
          className={cn(
            "relative group aspect-square overflow-hidden rounded-md border cursor-move transition-all",
            dragOverIndex === idx && "ring-2 ring-primary scale-105",
            draggedIndex === idx && "opacity-50",
          )}
          draggable
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOverItem(e, idx)}
          onDrop={(e) => handleDropOnItem(e, idx)}
        >
          <img src={it.url || "/placeholder.svg"} alt={`gallery-${idx}`} className="w-full h-full object-cover" />

          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/50 rounded p-1">
              <GripVertical className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Badge hiển thị loại ảnh */}
          <div className="absolute top-1 left-1">
            <span
              className={cn(
                "text-xs px-1 py-0.5 rounded text-white font-medium",
                it.type === "file" ? "bg-green-600" : "bg-blue-600",
              )}
            >
              {it.type === "file" ? "NEW" : "SAVED"}
            </span>
          </div>

          <div className="absolute inset-0 flex items-start justify-end gap-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="destructive"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation()
                removeAt(idx)
              }}
              title="Remove"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
