"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import moment from "moment"

interface TrademarkDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trademark: any
  companyMap: Record<string, string>
}

export default function TrademarkDetailModal({ open, onOpenChange, trademark, companyMap }: TrademarkDetailModalProps) {
  if (!trademark) return null

  const InfoRow = ({ label, value, leftCol = false }: { label: string; value?: string | null; leftCol?: boolean }) => (
    <div className="py-2 flex items-start gap-4">
      <div className="font-semibold text-sm text-gray-900 min-w-[250px]">{label}</div>
      <div className="text-sm text-gray-700 flex-1">{value || ""}</div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-base font-semibold">Chi tiết nhãn hiệu</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-4">
          {/* Logo Section */}
          <div className="mb-2 pb-2">
            <div className="font-semibold text-sm text-gray-900">(540) Hình ảnh</div>
            <div className="w-48 h-48 border flex items-center justify-center overflow-hidden bg-white">
              {trademark.image_url ? (
                <img
                  src={trademark.image_url || "/placeholder.svg"}
                  alt={trademark.name || "Logo"}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center">
                  <span className="text-white font-bold text-5xl">{trademark.name?.charAt(0) || "?"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-2 gap-x-16 gap-y-0">
            {/* Left Column */}
            <div>
              <InfoRow label="Loại" value="Nhãn hiệu" />
              <InfoRow
                label="(111) Số VB và Ngày cấp"
                value={
                  trademark.certificate_number && trademark.certificate_date
                    ? `${trademark.certificate_number} ${moment(trademark.certificate_date).format("YYYY.MM.DD")}`
                    : ""
                }
              />
              <InfoRow
                label="(181) Expiration Date"
                value={trademark.expiry_date ? moment(trademark.expiry_date).format("YYYY.MM.DD") : ""}
              />
              <InfoRow
                label="(200) Số đơn và Ngày nộp đơn"
                value={`${trademark.application_number || ""} ${trademark.application_date ? moment(trademark.application_date).format("YYYY.MM.DD") : ""}`.trim()}
              />
              <InfoRow label="(541) Mark" value={`${trademark.name || ""}`} />
              <InfoRow label="(300) Đơn ưu tiên" value="" />
            </div>

            {/* Right Column */}
            <div>
              <InfoRow label="Loại đơn" value="Thông thường" />
              <InfoRow label="Trạng thái" value={trademark.wipo_status || ""} />
              <InfoRow
                label="(400) Số công bố và Ngày công bố"
                value={`${trademark.publication_number || ""} ${trademark.publication_date ? moment(trademark.publication_date).format("YYYY.MM.DD") : ""}`.trim()}
              />
              <InfoRow label="(591) Màu sắc bảo hộ" value={trademark.color_claim || ""} />
            </div>
          </div>

          <div>
            <InfoRow label="(511) Lớp Nice" value={trademark.nice_class_text || ""} leftCol={true} />
          </div>

          <div>
            <InfoRow label="(531) Vienna Classes" value={trademark.vienna_class || ""} leftCol={true} />
          </div>

          {/* Applicant - Full Width */}
          <div>
            <InfoRow
              label="(730) Chủ đơn"
              value={trademark?.owner_name || ""}
              leftCol={true}
            />
          </div>

          <div>
            <InfoRow
              label="(740) Đại diện"
              value={trademark?.agency_name || ""}
              leftCol={true}
            />
          </div>

          <div>
            <InfoRow label="(550) Đặc điểm nhãn hiệu" value={"Combined"} leftCol={true} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
