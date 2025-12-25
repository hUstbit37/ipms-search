"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { searchByApplicationNumber, ApplicationSearchResult } from "@/lib/api/documentApi"
import { Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
// import toast from "react-hot-toast"
import { toast } from "react-toastify";

type Props = {
  value: string
  onChange: (value: string) => void
  onSelect: (application: ApplicationSearchResult) => void
  placeholder?: string
  disabled?: boolean
  label?: string
  ipTypes?: string[]
}

export function ApplicationNumberAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "VD: 4-2025-12345",
  disabled = false,
  label,
  ipTypes,
}: Props) {
  const [suggestions, setSuggestions] = useState<ApplicationSearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Search function with debouncing
  const performSearch = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm || searchTerm.trim().length < 2) {
        setSuggestions([])
        setIsOpen(false)
        return
      }

      try {
        setIsLoading(true)
        const results = await searchByApplicationNumber(searchTerm.trim(), ipTypes)
        console.log('Search results:', results)
        console.log('Results type:', Array.isArray(results) ? 'array' : typeof results)
        console.log('Results length:', results?.length)
        if (results && results.length > 0) {
          console.log('First result:', results[0])
        }
        setSuggestions(results)
        setIsOpen(results && results.length > 0)
        setSelectedIndex(-1)
      } catch (err: unknown) {
        console.error("Search failed:", err)
        toast.error("Không thể tìm kiếm. Vui lòng thử lại.")
        setSuggestions([])
        setIsOpen(false)
      } finally {
        setIsLoading(false)
      }
    },
    [ipTypes]
  )

  // Debounced search - only when input is focused
  useEffect(() => {
    if (!isFocused) {
      // Clear suggestions if not focused
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      return
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(value)
    }, 500)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [value, isFocused, performSearch])

  const handleSelect = (application: ApplicationSearchResult) => {
    const applicationNumber = application.application_number || value
    onChange(applicationNumber)
    onSelect(application)
    setIsOpen(false)
    setSelectedIndex(-1)
    setSuggestions([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const getApplicationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      trademark: "Nhãn hiệu",
      patent: "Sáng chế",
      industrial_design: "Kiểu dáng công nghiệp",
      utility_solution: "Giải pháp hữu ích",
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-1" ref={containerRef}>
      {label && <Label>{label}</Label>}
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true)
            if (suggestions.length > 0 && value.trim().length >= 2) {
              setIsOpen(true)
            }
          }}
          onBlur={() => {
            setIsFocused(false)
            // Delay closing to allow click on suggestion
            setTimeout(() => {
              setIsOpen(false)
              setSelectedIndex(-1)
            }, 200)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}

        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[300px] overflow-y-auto">
            {suggestions.map((app, index) => {
              const applicationNumber = app.application_number || (app as any).ip_application_number || (app as any).application_no || value
              const moduleName = app.module_name || (app as any).ip_name || (app as any).name || ''
              const companyShortName = app.company_short_name || app.company_name || app.company?.short_name || app.company?.name || ''
              const applicationType = app.module_type || app.application_type || 'trademark'
              const keyId = app.module_id || app.application_id || (app as any).id || index
              
              return (
                <div
                  key={keyId}
                  className={cn(
                    "px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors",
                    index === selectedIndex && "bg-blue-50 hover:bg-blue-50"
                  )}
                  onClick={() => handleSelect(app)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">
                          {applicationNumber}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {getApplicationTypeLabel(applicationType)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mb-1">{moduleName}</div>
                      {companyShortName && (
                        <div className="text-xs text-gray-500">{companyShortName}</div>
                      )}
                    </div>
                    {index === selectedIndex && (
                      <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

