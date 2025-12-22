"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Cloud } from "lucide-react"
import { uploadFile, getRules, DocumentRule, previewDocument, PreviewResponse, ApplicationSearchResult } from "@/lib/api/documentApi"
import { ApplicationNumberAutocomplete } from "@/components/document/ApplicationNumberAutocomplete"
import { CompanyNameAutocomplete } from "@/components/document/CompanyNameAutocomplete"
import { IP_TYPE_LABELS } from "@/constants/ip-type"
import { toast } from "react-toastify";


type FolderNode = {
  id: string | number
  name: string
  path?: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedFolder: FolderNode | null
  parentPath: string
  onSuccess?: () => void
}

export function DocumentUploadModal({ open, onOpenChange, selectedFolder, parentPath, onSuccess }: Props) {
  const [uploadLoading, setUploadLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadForm, setUploadForm] = useState({
    module_type: "trademark",
    module_id: "",
    document_code: "",
    application_no: "",
    company_short_name: "",
    brand_name: "",
    shape_type: "",
    product_type: "",
    design_name: "",
    document_date: "",
  })
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [documentRules, setDocumentRules] = useState<DocumentRule[]>([])
  const [documentCodes, setDocumentCodes] = useState<Array<{ value: string; label: string }>>([])
  const [selectedRule, setSelectedRule] = useState<DocumentRule | null>(null)
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadRules()
      resetForm()
    }
  }, [open])

  const loadRules = async () => {
    try {
      const rulesData = await getRules()
      setDocumentRules(rulesData.rules)
      setDocumentCodes(rulesData.document_codes)
    } catch (err) {
      console.error("Failed to load rules:", err)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setUploadForm({
      module_type: "trademark",
      module_id: "",
      document_code: "",
      application_no: "",
      company_short_name: "",
      brand_name: "",
      shape_type: "",
      product_type: "",
      design_name: "",
      document_date: "",
    })
    setUploadError(null)
    setSelectedRule(null)
    setPreviewData(null)
  }

  const handleClose = () => {
    onOpenChange(false)
    resetForm()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (20MB max)
      const maxSize = 20 * 1024 * 1024
      if (file.size > maxSize) {
        setUploadError("File không được vượt quá 20MB")
        return
      }
      // Validate file extension
      const allowedExtensions = ["pdf", "doc", "xlsx", "png", "jpeg"]
      const extension = file.name.split(".").pop()?.toLowerCase()
      if (!extension || !allowedExtensions.includes(extension)) {
        setUploadError("Chỉ cho phép các file: pdf, doc, xlsx, png, jpeg")
        return
      }
      setSelectedFile(file)
      setUploadError(null)
    }
  }

  const handleDocumentCodeChange = (value: string) => {
    setUploadForm({ ...uploadForm, document_code: value })
    const rule = documentRules.find(r => r.document_code === value)
    setSelectedRule(rule || null)
    loadPreview()
  }

  const loadPreview = useCallback(async () => {
    if (!uploadForm.document_code || !uploadForm.application_no || !uploadForm.module_type) {
      setPreviewData(null)
      return
    }

    try {
      setPreviewLoading(true)
      const preview = await previewDocument({
        document_code: uploadForm.document_code,
        module_type: uploadForm.module_type,
        application_no: uploadForm.application_no,
        module_id: uploadForm.module_id ? Number(uploadForm.module_id) : undefined,
        company_short_name: uploadForm.company_short_name || undefined,
        brand_name: uploadForm.brand_name || undefined,
        design_name: uploadForm.design_name || undefined,
        shape_type: uploadForm.shape_type || undefined,
        document_date: uploadForm.document_date || undefined,
        parent_path: parentPath || undefined,
      })
      setPreviewData(preview)
    } catch (err) {
      console.error("Preview failed:", err)
      setPreviewData(null)
    } finally {
      setPreviewLoading(false)
    }
  }, [uploadForm.document_code, uploadForm.application_no, uploadForm.module_type, uploadForm.module_id, uploadForm.company_short_name, uploadForm.brand_name, uploadForm.design_name, uploadForm.shape_type, uploadForm.document_date, parentPath])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPreview()
    }, 500)
    return () => clearTimeout(timer)
  }, [loadPreview])

  const getPreviewName = () => {
    if (previewLoading) return "Đang tải preview..."
    if (previewData?.preview_name) return previewData.preview_name
    if (!uploadForm.document_code) return "Chọn loại tài liệu để xem preview"
    if (!uploadForm.application_no) return "Nhập số đơn để xem preview"
    return "Không thể tạo preview"
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Vui lòng chọn file để tải lên")
      return
    }

    if (!parentPath) {
      setUploadError("Vui lòng chọn thư mục đích")
      return
    }

    if (!uploadForm.module_type) {
      setUploadError("Vui lòng chọn phân hệ")
      return
    }

    if (!uploadForm.document_code) {
      setUploadError("Vui lòng chọn loại tài liệu")
      return
    }

    if (!uploadForm.application_no) {
      setUploadError("Vui lòng nhập số đơn")
      return
    }

    try {
      setUploadLoading(true)
      setUploadError(null)

      const today = new Date()
      const defaultDate = `${String(today.getFullYear()).slice(-2)}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`

      const payload = {
        file: selectedFile,
        parent_path: parentPath,
        naming_mode: "AUTO" as const,
        module_type: uploadForm.module_type,
        module_id: uploadForm.module_id ? Number(uploadForm.module_id) : undefined,
        document_code: uploadForm.document_code,
        application_no: uploadForm.application_no || undefined,
        company_short_name: uploadForm.company_short_name || undefined,
        brand_name: uploadForm.brand_name || undefined,
        shape_type: uploadForm.shape_type || undefined,
        product_type: uploadForm.product_type || undefined,
        design_name: uploadForm.design_name || undefined,
        document_date: uploadForm.document_date || defaultDate,
      }

      const response = await uploadFile(payload)
      
      // Check if API returned success: false (even with 200 status)
      if (response.success === false) {
        const errorMessage = "Không thể tải file lên"
        setUploadError(errorMessage)
        toast.error(errorMessage)
        return
      }
      
      // Check validation status
      if (response.validation && !response.validation.is_valid && response.validation.errors && response.validation.errors.length > 0) {
        // File uploaded but has validation errors - show warning
        const validationErrors = response.validation.errors.join(", ")
        toast.error(`File đã tải lên nhưng có lỗi validation: ${validationErrors}`)
        handleClose()
        onSuccess?.()
        return
      }
      
      // Success: file uploaded and validated
      toast.success("Tải file lên thành công!")
      handleClose()
      onSuccess?.()
    } catch (err: any) {
      console.error("Upload failed:", err)
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || "Không thể tải file lên"
      setUploadError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setUploadLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tải lên File mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Parent Path */}
          <div className="space-y-1">
            <Label>Vị trí lưu trữ</Label>
            <Input 
              value={parentPath || "Chưa chọn"} 
              readOnly 
              className="bg-gray-50" 
            />
          </div>

          {/* Module Type and ID */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Phân hệ *</Label>
              <Select
                value={uploadForm.module_type}
                onValueChange={(value) => setUploadForm({ ...uploadForm, module_type: value })}
              >
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="Chọn phân hệ" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(IP_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Module ID *</Label>
              <Input
                type="number"
                value={uploadForm.module_id}
                onChange={(e) => setUploadForm({ ...uploadForm, module_id: e.target.value })}
                placeholder="Nhập Module ID"
              />
            </div>
          </div>

          {/* Document Code */}
          <div className="space-y-1">
            <Label>Loại tài liệu</Label>
            <Select
              value={uploadForm.document_code}
              onValueChange={handleDocumentCodeChange}
            >
              <SelectTrigger className="w-full ">
                <SelectValue placeholder="Chọn loại tài liệu" />
              </SelectTrigger>
              <SelectContent>
                {documentCodes.map((code) => (
                  <SelectItem key={code.value} value={code.value}>
                    {code.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Application No */}
          <ApplicationNumberAutocomplete
            label="Số đơn *"
            value={uploadForm.application_no}
            onChange={(value) => setUploadForm({ ...uploadForm, application_no: value })}
            onSelect={(application) => {
              // Auto-fill fields based on selected application
              setUploadForm((prev) => ({
                ...prev,
                application_no: application.application_number,
                module_id: String(application.module_id),
                module_type: application.module_type,
                company_short_name: application.company_short_name || prev.company_short_name,
                brand_name: application.module_type === "trademark"
                  ? application.module_name
                  : prev.brand_name,
                design_name: (application.module_type === "industrial_design" ||
                             application.module_type === "utility_solution")
                  ? application.module_name
                  : prev.design_name,
              }))
            }}
            placeholder="VD: 4-2025-12345"
            ipTypes={[uploadForm.module_type]}
          />

          {/* Company Short Name */}
          <CompanyNameAutocomplete
            label="Tên Công ty"
            value={uploadForm.company_short_name}
            onChange={(value) => setUploadForm({ ...uploadForm, company_short_name: value })}
            onSelect={(company) => {
              setUploadForm((prev) => ({
                ...prev,
                company_short_name: company.short_name || company.name,
              }))
            }}
            placeholder="VD: MCH"
          />

          {/* Fields based on module type */}
          {uploadForm.module_type === "trademark" && (
            <>
              <div className="space-y-1">
                <Label>Tên Nhãn hiệu</Label>
                <Input
                  value={uploadForm.brand_name}
                  onChange={(e) => setUploadForm({ ...uploadForm, brand_name: e.target.value })}
                  placeholder="VD: OMACHI"
                />
              </div>
              <div className="space-y-1">
                <Label>Loại hình</Label>
                <Select
                  value={uploadForm.shape_type}
                  onValueChange={(value) => setUploadForm({ ...uploadForm, shape_type: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn loại hình" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEXT">TEXT</SelectItem>
                    <SelectItem value="IMAGE">IMAGE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {(uploadForm.module_type === "utility_solution" || 
            uploadForm.module_type === "industrial_design" || 
            uploadForm.module_type === "patent") && (
            <>
              <div className="space-y-1">
                <Label>Loại sản phẩm</Label>
                <Input
                  value={uploadForm.product_type}
                  onChange={(e) => setUploadForm({ ...uploadForm, product_type: e.target.value })}
                  placeholder="Nhập loại sản phẩm"
                />
              </div>
              <div className="space-y-1">
                <Label>Tên KDCN/Thiết kế</Label>
                <Input
                  value={uploadForm.design_name}
                  onChange={(e) => setUploadForm({ ...uploadForm, design_name: e.target.value })}
                  placeholder="Nhập tên KDCN/thiết kế"
                />
              </div>
            </>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Tải file *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.xlsx,.png,.jpeg"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Cloud className="h-12 w-12 text-blue-500" />
                <span className="text-sm text-gray-600">
                  {selectedFile ? selectedFile.name : "Click để chọn file hoặc kéo thả file vào đây"}
                </span>
                <span className="text-xs text-gray-500">
                  Chỉ cho phép: PDF, DOC, XLSX, PNG, JPEG (tối đa 20MB)
                </span>
              </label>
            </div>
          </div>

          {/* Document Date */}
          <div className="space-y-1">
            <Label>Ngày tài liệu (YYMMDD)</Label>
            <Input
              value={uploadForm.document_date}
              onChange={(e) => setUploadForm({ ...uploadForm, document_date: e.target.value })}
              placeholder="YYMMDD (mặc định: hôm nay)"
              maxLength={6}
            />
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-xs text-gray-500 mb-1">Tên File kết quả (Preview):</p>
            <p className="text-sm font-semibold text-blue-600 break-all">{getPreviewName()}</p>
            {previewData && !previewData.is_valid && previewData.validation_errors && previewData.validation_errors.length > 0 && (
              <div className="mt-2 text-xs text-red-600">
                <p className="font-semibold">Lỗi validation:</p>
                <ul className="list-disc list-inside">
                  {previewData.validation_errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            {previewData && previewData.missing_fields && previewData.missing_fields.length > 0 && (
              <div className="mt-2 text-xs text-yellow-600">
                <p className="font-semibold">Thiếu trường:</p>
                <ul className="list-disc list-inside">
                  {previewData.missing_fields.map((field, idx) => (
                    <li key={idx}>{field}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {uploadError && <div className="text-sm text-red-600">{uploadError}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploadLoading}>
            Hủy bỏ
          </Button>
          <Button onClick={handleUpload} disabled={uploadLoading || !selectedFile}>
            {uploadLoading ? "Đang tải lên..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

