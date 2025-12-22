"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { searchCompanies, CompanySearchResult } from "@/lib/api/documentApi"
import { Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
// import toast from "react-hot-toast"
import { toast } from "react-toastify";

type Company = CompanySearchResult["items"][0]

type Props = {
  value: string
  onChange: (value: string) => void
  onSelect: (company: Company) => void
  placeholder?: string
  disabled?: boolean
  label?: string
}

export function CompanyNameAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "VD: MCH",
  disabled = false,
  label,
}: Props) {
  const [suggestions, setSuggestions] = useState<Company[]>([])
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
  const performSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    try {
      setIsLoading(true)
      const results = await searchCompanies(searchTerm.trim(), { page: 1, pageSize: 10 })
      setSuggestions(results.items)
      setIsOpen(results.items.length > 0)
      setSelectedIndex(-1)
    } catch (err: unknown) {
      console.error("Search failed:", err)
      toast.error("Không thể tìm kiếm. Vui lòng thử lại.")
      setSuggestions([])
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

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

  const handleSelect = (company: Company) => {
    onChange(company.short_name || company.name)
    onSelect(company)
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
            {suggestions.map((company, index) => (
              <div
                key={company.id}
                className={cn(
                  "px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors",
                  index === selectedIndex && "bg-blue-50 hover:bg-blue-50"
                )}
                onClick={() => handleSelect(company)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 mb-1">
                      {company.name}
                    </div>
                    {company.short_name && (
                      <div className="text-xs text-gray-500">{company.short_name}</div>
                    )}
                    {company.address && (
                      <div className="text-xs text-gray-400 mt-1 truncate">
                        {company.address}
                      </div>
                    )}
                  </div>
                  {index === selectedIndex && (
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

