"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import moment from "moment";

interface DesignDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  design: any;
  companyMap: Record<string, string>;
}

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
            <div className="text-xs text-gray-700 dark:text-gray-300 col-span-5">
              <div className="flex gap-2 flex-wrap">
                {(() => {
                  // Support both single image_url (string) and multiple images (array)
                  const images = Array.isArray(design.image_url) 
                    ? design.image_url 
                    : design.image_url 
                      ? [design.image_url] 
                      : [];
                  
                  if (images.length === 0) {
                    return <div className="text-gray-400 text-xs">No image</div>;
                  }
                  
                  return images.map((imageUrl: string, index: number) => (
                    <div key={index} className="w-24 h-24 border border-gray-300 flex items-center justify-center bg-white">
                      <img src={imageUrl} alt={`Design ${index + 1}`} className="max-w-full max-h-full object-contain p-1" />
                    </div>
                  ));
                })()}
              </div>
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
                value={design?.authors || ""}
              />
              <InfoField 
                label="Chủ đơn/Chủ bằng" 
                value={design.owner_name || ""}
              />
              <InfoField 
                label="Đại diện" 
                value={design?.agency_name || ""}
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
