"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import moment from "moment";
import ImageShow from "../common/image/image-show";

interface DesignDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  design: any;
  companyMap: Record<string, string>;
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

export default function DesignDetailModal({
  open,
  onOpenChange,
  design,
  companyMap,
}: DesignDetailModalProps) {
  if (!design) return null;

  const InfoField = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="py-2 border-b border-gray-200 dark:border-gray-700 last:border-0 grid grid-cols-3 gap-4">
      <div className="font-bold text-xs col-span-1">{label}</div>
      <div className="text-xs text-gray-700 dark:text-gray-300 col-span-2">{value || ""}</div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[96vw] w-full max-h-[90vh] overflow-y-auto p-8">
        <VisuallyHidden>
          <DialogTitle>{design.name || "Chi tiết kiểu dáng công nghiệp"}</DialogTitle>
        </VisuallyHidden>
        <div className="space-y-4">
          {/* Image - full width row */}
          <div className="py-2 border-b border-gray-200 dark:border-gray-700 grid grid-cols-6 gap-4">
            <div className="font-bold text-xs col-span-1">Hình ảnh</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {design.image_urls && design.image_urls.length > 0 ? (
                design.image_urls.map((imageUrl: string, index: number) => (
                  <ImageShow
                    key={index}
                    src={imageUrl || ""} 
                    alt={`${design.name || "Industrial design image"} ${index + 1}`} 
                    size="xxl"
                  />
                ))
              ) : (
                <ImageShow
                  src="" 
                  alt={design.name || "Industrial design image"} 
                  size="xxl"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-0">
            {/* Left column */}
            <div>
              <InfoField label="Mã kiểu dáng" value={design.code} />
              <InfoField label="Tên kiểu dáng" value={design.name} />
              <InfoField label="Số đơn" value={design.application_number} />
              <InfoField 
                label="Ngày nộp đơn" 
                value={design.application_date ? moment(design.application_date).format("DD/MM/YYYY") : ""}
              />
              <InfoField label="Số bằng" value={design.certificate_number} />
              <InfoField 
                label="Ngày cấp bằng" 
                value={design.certificate_date ? moment(design.certificate_date).format("DD/MM/YYYY") : ""}
              />
              <InfoField 
                label="Số công bố/Ngày công bố" 
                value={design.publication_number || "" + (design.publication_date ? `  ${moment(design.publication_date).format("DD/MM/YYYY")}` : "")}
              />
              <InfoField 
                label="Ngày hết hạn" 
                value={design.expiry_date ? moment(design.expiry_date).format("DD/MM/YYYY") : ""}
              />
              <InfoField 
                label="Phân loại Locarno" 
                value={Array.isArray(design.locarno_list) ? design.locarno_list.join(', ') : (design.locarno_list || '-')}
              />
              <InfoField 
                label="Tác giả" 
                value={formatAuthorsRaw(design?.authors_raw) || design?.authors || ""}
              />
              <InfoField 
                label="Chủ đơn/Chủ bằng" 
                value={formatOwnersRaw(design?.owners_raw) || design.owner_name || ""}
              />
              <InfoField 
                label="Đại diện" 
                value={formatAgenciesRaw(design?.agencies_raw) || design?.agency_name || ""}
              />
            </div>

            {/* Right column */}
            <div>
              <InfoField 
                label="Trạng thái" 
                value={design.wipo_status || (design.certificate_number ? "Cấp bằng" : "Đang giải quyết")}
              />
              <InfoField label="Quốc gia" value={design.country_code} />
              <InfoField label="Mô tả" value={design.description} />
              <InfoField label="Tóm tắt" value={design.summary} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
