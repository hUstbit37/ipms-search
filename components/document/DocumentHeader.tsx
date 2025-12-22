"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Upload, FolderPlus, ChevronRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  breadcrumbs: string[]
  onRefresh?: () => void
  onUploadFile?: () => void
  onAddFolder?: () => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  onBreadcrumbClick?: (index: number) => void
}

export function DocumentHeader({ 
  breadcrumbs, 
  onRefresh, 
  onUploadFile, 
  onAddFolder,
  searchValue = "",
  onSearchChange,
  onBreadcrumbClick
}: Props) {
  return (
    <div className="bg-white border-b border-gray-200">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 px-4 pt-2 pb-1">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
            <button
              onClick={() => onBreadcrumbClick?.(index)}
              className={cn(
                "text-sm hover:text-blue-600 transition-colors",
                index === breadcrumbs.length - 1 ? "text-gray-900 font-medium" : "text-gray-600"
              )}
            >
              {crumb}
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex gap-4 px-4 pb-2 pt-0">
        <div className="relative flex-2 w-50">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={`Tìm kiếm trong '${breadcrumbs[breadcrumbs.length - 1]}'...`}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-8 pr-4 w-full"
            />
        </div>
        {/* Refresh Button */}
        {onRefresh && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              onClick={onRefresh}
              size="sm" 
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
