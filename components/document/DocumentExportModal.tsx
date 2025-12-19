"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createExportJob, getExportStatus, ExportJobRequest } from "@/lib/api/documentApi"
import { IP_TYPE_LABELS } from "@/constants/ip-type"
// import toast from "react-hot-toast"
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DocumentExportModal({ open, onOpenChange, onSuccess }: Props) {
  const [exportLoading, setExportLoading] = useState(false)
  const [polling, setPolling] = useState(false)
  const [progress, setProgress] = useState(0)
  const [exportForm, setExportForm] = useState({
    ip_type: "",
    date_from: "",
    date_to: "",
  })
  const [exportError, setExportError] = useState<string | null>(null)
  const [jobId, setJobId] = useState<number | null>(null)

  const resetForm = () => {
    setExportForm({
      ip_type: "",
      date_from: "",
      date_to: "",
    })
    setExportError(null)
    setProgress(0)
    setJobId(null)
  }

  const handleClose = () => {
    onOpenChange(false)
    resetForm()
    setPolling(false)
  }

  const pollExportStatus = async (jobId: number) => {
    setPolling(true)
    const maxAttempts = 300 // 10 minutes max (300 * 2 seconds)
    let attempts = 0

    const checkStatus = async (): Promise<void> => {
      try {
        const status = await getExportStatus(jobId)
        setProgress(status.progress || 0)

        if (status.status === "completed") {
          setPolling(false)
          if (status.download_url) {
            // Download file
            window.open(status.download_url, "_blank")
            toast.success("Xuất dữ liệu thành công!")
            handleClose()
            onSuccess?.()
          } else {
            toast.error("Xuất dữ liệu thành công nhưng không có link tải xuống")
            setPolling(false)
          }
          return
        } else if (status.status === "failed") {
          setPolling(false)
          toast.error("Xuất dữ liệu thất bại")
          setExportError("Xuất dữ liệu thất bại")
          return
        } else {
          // Still processing
          attempts++
          if (attempts >= maxAttempts) {
            setPolling(false)
            toast.error("Xuất dữ liệu quá lâu, vui lòng thử lại")
            setExportError("Xuất dữ liệu quá lâu")
            return
          }
          // Check again after 2 seconds
          setTimeout(() => checkStatus(), 2000)
        }
      } catch (err: any) {
        console.error("Poll export status failed:", err)
        setPolling(false)
        const errorMessage = err.response?.data?.detail || err.message || "Không thể kiểm tra trạng thái xuất dữ liệu"
        toast.error(errorMessage)
        setExportError(errorMessage)
      }
    }

    await checkStatus()
  }

  const handleExport = async () => {
    try {
      setExportLoading(true)
      setExportError(null)

      // Validate: require date_from and date_to
      if (!exportForm.date_from || !exportForm.date_to) {
        setExportError("Vui lòng chọn từ ngày và đến ngày")
        toast.error("Vui lòng chọn từ ngày và đến ngày")
        return
      }

      // Prepare payload
      const payload: ExportJobRequest = {
        export_type: "full_package",
        date_from: exportForm.date_from,
        date_to: exportForm.date_to,
        include_files: true,
        include_metadata: true,
        format: "zip",
      }

      // Only include ip_type if not "all" or empty
      if (exportForm.ip_type && exportForm.ip_type !== "all") {
        payload.ip_type = exportForm.ip_type
      }

      const job = await createExportJob(payload)
      setJobId(job.id)
      toast.success(`Đã tạo job xuất dữ liệu: ${job.job_code}`)
      
      // Start polling
      await pollExportStatus(job.id)
    } catch (err: any) {
      console.error("Export failed:", err)
      const errorMessage = err.response?.data?.detail || err.message || "Không thể xuất dữ liệu"
      setExportError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Xuất dữ liệu</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* IP Type */}
          <div className="space-y-1">
            <Label>Loại IP</Label>
            <Select
              value={exportForm.ip_type || "all"}
              onValueChange={(value) => setExportForm({ ...exportForm, ip_type: value === "all" ? "" : value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn loại IP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {Object.entries(IP_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Từ ngày *</Label>
              <Input
                type="date"
                value={exportForm.date_from}
                onChange={(e) => setExportForm({ ...exportForm, date_from: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Đến ngày *</Label>
              <Input
                type="date"
                value={exportForm.date_to}
                onChange={(e) => setExportForm({ ...exportForm, date_to: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Progress */}
          {polling && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Đang xử lý...</span>
                <span>{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {exportError && <div className="text-sm text-red-600">{exportError}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={polling}>
            Hủy
          </Button>
          <Button onClick={handleExport} disabled={exportLoading || polling}>
            {polling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Xuất dữ liệu"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

