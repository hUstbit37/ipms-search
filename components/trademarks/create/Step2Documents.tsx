"use client"

import React, { useRef } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X } from "lucide-react"
import { TrademarkFormData } from "./CreateTrademarkWizard"

type Step2DocumentsProps = {
  data: TrademarkFormData
  onChange: (data: Partial<TrademarkFormData>) => void
}

export default function Step2Documents({ data, onChange }: Step2DocumentsProps) {
  const filePRInputRef = useRef<HTMLInputElement>(null)
  const brandFilesInputRef = useRef<HTMLInputElement>(null)

  const handleFilePRUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onChange({
          filePR: file,
          filePRName: file.name,
          filePRPreview: reader.result as string,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBrandFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const previews: string[] = []
      let loadedCount = 0

      files.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          previews.push(reader.result as string)
          loadedCount++
          
          if (loadedCount === files.length) {
            onChange({
              brandFiles: files,
              brandFilesPreview: previews,
            })
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveFilePR = () => {
    onChange({
      filePR: undefined,
      filePRName: undefined,
      filePRPreview: undefined,
    })
    if (filePRInputRef.current) {
      filePRInputRef.current.value = ""
    }
  }

  const handleRemoveBrandFile = (index: number) => {
    const newFiles = [...(data.brandFiles || [])]
    const newPreviews = [...(data.brandFilesPreview || [])]
    
    newFiles.splice(index, 1)
    newPreviews.splice(index, 1)
    
    onChange({
      brandFiles: newFiles,
      brandFilesPreview: newPreviews,
    })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Bước 2/3: Tài liệu đính kèm</h3>
      
      <div className="space-y-6">
        {/* File PR Upload */}
        <div>
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">
                1. File PR <span className="text-red-500">*</span>
              </Label>
              {data.filePR ? (
                <div className="mt-3 flex items-center gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                  <FileText className="w-10 h-10 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{data.filePRName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {data.filePR && (data.filePR.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFilePR}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="mt-3">
                  <div
                    className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => filePRInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-3">Kéo thả file hoặc click để chọn</p>
                    <Button type="button" variant="outline">
                      Tải lên
                    </Button>
                  </div>
                  <input
                    ref={filePRInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFilePRUpload}
                  />
                </div>
              )}
            </div>

            {data.filePR && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Tên File (Preview)</p>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <a
                    href="#"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    {data.filePRName}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Brand Files / Images Upload */}
        <div>
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">
                2. File Mẫu nhãn/Bộ ảnh <span className="text-red-500">*</span>
              </Label>
              
              <div className="mt-3">
                {(!data.brandFiles || data.brandFiles.length === 0) ? (
                  <div
                    className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => brandFilesInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-3">Kéo thả file hoặc click để chọn</p>
                    <Button type="button" variant="outline">
                      Tải lên
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {data.brandFilesPreview?.map((preview, index) => (
                        <div key={index} className="relative group border rounded-lg overflow-hidden">
                          <img
                            src={preview}
                            alt={`Brand file ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveBrandFile(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                            {data.brandFiles?.[index]?.name}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => brandFilesInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Thêm ảnh
                    </Button>
                  </div>
                )}
                <input
                  ref={brandFilesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleBrandFilesUpload}
                />
              </div>
            </div>

            {data.brandFiles && data.brandFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Tên File (Preview)</p>
                <div className="space-y-2">
                  {data.brandFiles.map((file, index) => (
                    <div
                      key={index}
                      className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800"
                    >
                      <p className="text-sm text-blue-600 dark:text-blue-400">{file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
