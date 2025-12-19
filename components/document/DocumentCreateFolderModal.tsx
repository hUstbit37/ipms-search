"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createFolderApi, ApplicationSearchResult } from "@/lib/api/documentApi"
import { ApplicationNumberAutocomplete } from "@/components/document/ApplicationNumberAutocomplete"
import { CompanyNameAutocomplete } from "@/components/document/CompanyNameAutocomplete"
import { IP_TYPE_LABELS } from "@/constants/ip-type"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import toast from "react-hot-toast"
import { toast } from "react-toastify";

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentPath: string
  onSuccess?: (createdPath?: string) => void
}

export function DocumentCreateFolderModal({ open, onOpenChange, parentPath, onSuccess }: Props) {
  const [createLoading, setCreateLoading] = useState(false)
  const [namingMode, setNamingMode] = useState<"manual" | "auto">("manual")
  const [manualName, setManualName] = useState("")
  const [autoForm, setAutoForm] = useState({
    module_type: "",
    module_id: "",
    company_name: "",
    brand_name: "",
    serial_no: "",
  })
  const [formError, setFormError] = useState<string | null>(null)

  const resetForm = () => {
    setManualName("")
    setAutoForm({
      module_type: "",
      module_id: "",
      company_name: "",
      brand_name: "",
      serial_no: "",
    })
    setFormError(null)
    setNamingMode("manual")
  }

  const handleClose = () => {
    onOpenChange(false)
    resetForm()
  }

  const autoPreview = [autoForm.company_name, autoForm.brand_name, autoForm.serial_no]
    .filter(Boolean)
    .join("_") || "Xem trước tên folder sẽ hiển thị ở đây"

  const handleCreateFolder = async () => {
    // Empty string "" is valid for root folder, so only check for undefined/null
    if (parentPath === undefined || parentPath === null) {
      setFormError("Vui lòng chọn thư mục cha trước khi tạo mới.")
      return
    }

    if (namingMode === "manual") {
      const trimmed = manualName.trim()
      if (!trimmed) {
        setFormError("Tên thư mục không được để trống.")
        return
      }
      if (/[\\\/:\*\?"<>\|]/.test(trimmed)) {
        setFormError("Tên không chứa các ký tự đặc biệt: \\ / : * ? \" < > |")
        return
      }
    }

    try {
      setCreateLoading(true)
      setFormError(null)
      const payload =
        namingMode === "manual"
          ? {
              mode: "manual" as const,
              parent_path: parentPath,
              name: manualName.trim(),
            }
          : {
              mode: "auto" as const,
              parent_path: parentPath,
              module_type: autoForm.module_type || undefined,
              module_id: autoForm.module_id ? Number(autoForm.module_id) : undefined,
              company_name: autoForm.company_name,
              brand_name: autoForm.brand_name,
              serial_no: autoForm.serial_no,
            }

      const res = await createFolderApi(payload)
      
      // Check if API returned success: false (even with 200 status)
      if (res.success === false) {
        const errorMessage = "Không thể tạo thư mục"
        setFormError(errorMessage)
        toast.error(errorMessage)
        return
      }
      
      // Success: folder created
      const createdPath = res.path || parentPath
      toast.success("Tạo thư mục thành công!")
      handleClose()
      onSuccess?.(createdPath)
    } catch (err: any) {
      console.error("Create folder failed:", err)
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || "Không thể tạo thư mục"
      setFormError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo Thư mục Mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Vị trí lưu trữ (Parent Folder)</Label>
            <Input value={parentPath === "" ? "Root" : (parentPath || "Chưa chọn")} readOnly className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label>Chế độ đặt tên</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={namingMode === "manual"}
                  onChange={() => setNamingMode("manual")}
                />
                <span>Đặt tên thủ công</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={namingMode === "auto"}
                  onChange={() => setNamingMode("auto")}
                />
                <span>Tự động theo quy chuẩn</span>
              </label>
            </div>
          </div>

          {namingMode === "manual" ? (
            <div className="space-y-1">
              <Label>Tên thư mục mới *</Label>
              <Input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Nhập tên thư mục..."
              />
              <p className="text-xs text-gray-500">Không chứa các ký tự đặc biệt: \ / : * ? \" &lt; &gt; |</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Phân hệ</Label>
                  <Select
                    value={autoForm.module_type}
                    onValueChange={(value: string) => setAutoForm({ ...autoForm, module_type: value })}
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
                  <Label>Module ID</Label>
                  <Input
                    type="number"
                    value={autoForm.module_id}
                    onChange={(e) => setAutoForm({ ...autoForm, module_id: e.target.value })}
                    placeholder="Nhập Module ID"
                  />
                </div>
                <CompanyNameAutocomplete
                  label="Tên Công ty"
                  value={autoForm.company_name}
                  onChange={(value) => setAutoForm({ ...autoForm, company_name: value })}
                  onSelect={(company) => {
                    setAutoForm((prev) => ({
                      ...prev,
                      company_name: company.short_name || company.name,
                    }))
                  }}
                  placeholder="VD: MCH"
                />
                <div className="space-y-1">
                  <Label>Tên Nhãn hiệu</Label>
                  <Input
                    value={autoForm.brand_name}
                    onChange={(e) => setAutoForm({ ...autoForm, brand_name: e.target.value })}
                    placeholder="VD: OMACHI"
                  />
                </div>
                <ApplicationNumberAutocomplete
                  label="Số đơn"
                  value={autoForm.serial_no}
                  onChange={(value) => setAutoForm({ ...autoForm, serial_no: value })}
                  onSelect={(application) => {
                    // Auto-fill fields based on selected application
                    setAutoForm((prev) => ({
                      ...prev,
                      serial_no: application.application_number,
                      module_id: String(application.module_id),
                      module_type: application.module_type,
                      company_name: application.company_short_name || application.company_name || prev.company_name,
                      brand_name: application.module_type === "trademark" 
                        ? application.module_name 
                        : prev.brand_name,
                    }))
                  }}
                  placeholder="VD: 4-2025-12345"
                  ipTypes={autoForm.module_type ? [autoForm.module_type] : undefined}
                />
              </div>
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-xs text-gray-500 mb-1">Tên Folder kết quả (Preview):</p>
                <p className="text-sm font-semibold text-blue-600 break-all">{autoPreview}</p>
              </div>
            </div>
          )}

          {formError && <div className="text-sm text-red-600">{formError}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy bỏ
          </Button>
          <Button onClick={handleCreateFolder} disabled={createLoading}>
            {createLoading ? "Đang tạo..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

