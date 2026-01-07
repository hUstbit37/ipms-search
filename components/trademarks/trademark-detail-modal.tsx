"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import moment from "moment"
import ImageShow from "@/components/common/image/image-show";
import { ImageSlideModal } from "@/components/common/image/image-slide-modal";
import OwnersDetail from "@/components/trademarks/search/owners-detail";
import AgenciesDetail from "@/components/trademarks/search/agencies-detail";
import NiceDetail from "@/components/trademarks/search/nice-detail";
import ViennaDetail from "@/components/trademarks/search/vienna-detail";
import WipoProcess from "@/components/trademarks/search/wipo-process";
import IpDocument from "@/components/trademarks/search/ip-document";
import { InternalProcessingStatusTable } from "@/components/common/InternalProcessingStatusTable";

interface TrademarkDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trademark: any
  companyMap: Record<string, string>
  selectedCustomFields?: string[]
}
const formatAuthorsRaw = (authorsRaw: unknown): string => {
  if (Array.isArray(authorsRaw)) {
    return authorsRaw.filter(Boolean).join("; ");
  }
  if (typeof authorsRaw === "string") return authorsRaw;
  return "";
};

const formatOwnersRaw = (ownersRaw: unknown): string => {
  if (Array.isArray(ownersRaw)) {
    return ownersRaw
      .map((entry) => {
        if (typeof entry !== "string") return "";
        return entry.trim();
      })
      .filter(Boolean)
      .join("; ");
  }
  if (typeof ownersRaw === "string") {
    return ownersRaw.trim();
  }
  return "";
};

const formatAgenciesRaw = (agenciesRaw: unknown): string => {
  if (Array.isArray(agenciesRaw)) {
    return agenciesRaw
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter(Boolean)
      .join("; ");
  }
  if (typeof agenciesRaw === "string") {
    return agenciesRaw.trim();
  }
  return "";
};

export default function TrademarkDetailModal({ open, onOpenChange, trademark, companyMap, selectedCustomFields = [] }: TrademarkDetailModalProps) {
  const [showImageSlide, setShowImageSlide] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  if (!trademark) return null

  const imageUrls = trademark.image_urls || [];

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageSlide(true);
  };

  const InfoRow = ({ label, value, leftCol = false }: { label: string; value?: string | null; leftCol?: boolean }) => (
    <div className="py-2 flex items-start gap-4">
      <div className="font-semibold text-sm text-gray-900 min-w-[250px]">{label}</div>
      <div className="text-sm text-gray-700 flex-1">{value || ""}</div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-7xl min-h-[95vh] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-1">
          <DialogTitle className="text-base font-semibold">Chi tiết nhãn hiệu</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-2 mt-0">
            <TabsTrigger value="info" className="cursor-pointer">Thông tin</TabsTrigger>
            <TabsTrigger value="process" className="cursor-pointer">Tiến trình</TabsTrigger>
            <TabsTrigger value="documents" className="cursor-pointer">Tài liệu</TabsTrigger>
            {selectedCustomFields.length > 0 && (
              <TabsTrigger value="custom-fields" className="cursor-pointer">Trường nội bộ</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="info" className="flex-1 overflow-y-auto px-4 mt-1">
            {/* Logo Section */}
            <div className="mb-2 pb-2">
              <div className="font-semibold text-sm text-gray-900">Hình ảnh</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {imageUrls.length > 0 ? (
                  imageUrls.map((imageUrl: string, index: number) => (
                    <div 
                      key={index} 
                      className="cursor-pointer" 
                      onClick={() => handleImageClick(index)}
                    >
                      <ImageShow
                        src={imageUrl || ""} 
                        alt={`${trademark.name || "Trademark image"} ${index + 1}`} 
                        size="xxl"
                        disableHover={true}
                      />
                    </div>
                  ))
                ) : (
                  <ImageShow
                    src="" 
                    alt={trademark.name || "Trademark image"} 
                    size="xxl"
                    disableHover={true}
                  />
                )}
              </div>
            </div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-2 gap-x-16 gap-y-0">
              {/* Left Column */}
              <div>
                <InfoRow label="Loại" value="Nhãn hiệu" />
                <InfoRow
                  label="Số bằng và Ngày cấp"
                  value={
                    trademark.certificate_number && trademark.certificate_date
                      ? `${trademark.certificate_number} ${moment(trademark.certificate_date).format("YYYY.MM.DD")}`
                      : ""
                  }
                />
                <InfoRow
                  label="Expiration Date"
                  value={trademark.expiry_date ? moment(trademark.expiry_date).format("YYYY.MM.DD") : ""}
                />
                <InfoRow
                  label="Số đơn và Ngày nộp đơn"
                  value={`${trademark.application_number || ""} ${trademark.application_date ? moment(trademark.application_date).format("YYYY.MM.DD") : ""}`.trim()}
                />
                <InfoRow label="Mark" value={`${trademark.name || ""}`} />
                <InfoRow label="Đơn ưu tiên" value="" />
              </div>

              {/* Right Column */}
              <div>
                <InfoRow label="Loại đơn" value="Thông thường" />
                <InfoRow label="Trạng thái" value={trademark.wipo_status || (trademark.certificate_number ? "Cấp bằng" : "Đang giải quyết")} />
                <InfoRow
                  label="Số công bố và Ngày công bố"
                  value={`${trademark.publication_number || ""} ${trademark.publication_date ? moment(trademark.publication_date).format("YYYY.MM.DD") : ""}`.trim()}
                />
                <InfoRow label="Màu sắc bảo hộ" value={trademark.color_claim || ""} />
              </div>
            </div>

            <div>
              <NiceDetail
                nice_class_list_raw={trademark.nice_class_list_raw}
                nice_class_list={trademark.nice_class_list}
                nice_class_text={trademark.nice_class_text}
              />
            </div>

            <div>
              <ViennaDetail
                vienna_class_list_raw={trademark.vienna_class_list_raw}
                vienna_class={trademark.vienna_class}
              />
            </div>

            {/* Applicant - Full Width */}
            <div>
              <OwnersDetail
                owners_raw={trademark.owners_raw}
                owners={trademark.owners}
                owner_name={trademark.owner_name}
              />
            </div>

            <div>
              <AgenciesDetail
                agencies_raw={trademark.agencies_raw}
                agencies={trademark.agencies}
                agency_name={trademark.agency_name}
              />
            </div>

            <div>
              <InfoRow label="Đặc điểm nhãn hiệu" value={"Combined"} leftCol={true} />
            </div>
          </TabsContent>

          <TabsContent value="process" className="flex-1 overflow-y-auto px-4 mt-4 space-y-6">
            <WipoProcess wipo_process={trademark.wipo_process} />
            {trademark.application_number && (
              <InternalProcessingStatusTable
                ipType="trademark"
                applicationNumber={trademark.application_number}
              />
            )}
          </TabsContent>

          <TabsContent value="documents" className="flex-1 overflow-y-auto px-4 mt-4">
            <IpDocument documents={trademark.documents} />
          </TabsContent>

          {selectedCustomFields.length > 0 && (
            <TabsContent value="custom-fields" className="flex-1 overflow-y-auto px-4 mt-4">
              <div className="space-y-3">
                {selectedCustomFields.map((fieldName) => (
                  <div key={fieldName} className="border-b pb-3">
                    <InfoRow 
                      label={fieldName} 
                      value={trademark.custom_fields?.[fieldName] || "-"} 
                    />
                  </div>
                ))}
                {selectedCustomFields.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Chưa có trường nội bộ nào được chọn hiển thị
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>

      <ImageSlideModal
        open={showImageSlide}
        onOpenChange={setShowImageSlide}
        images={imageUrls}
        initialIndex={selectedImageIndex}
        title="Xem ảnh nhãn hiệu"
      />
    </Dialog>
  )
}
