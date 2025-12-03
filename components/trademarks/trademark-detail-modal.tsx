"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import moment from "moment";

interface TrademarkDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trademark: any;
  companyMap: Record<string, string>;
}

export default function TrademarkDetailModal({
  open,
  onOpenChange,
  trademark,
  companyMap,
}: TrademarkDetailModalProps) {
  if (!trademark) return null;

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
          <DialogTitle>{trademark.name || "Chi tiết nhãn hiệu"}</DialogTitle>
        </VisuallyHidden>
        <div className="space-y-4">
          {/* Logo - full width row */}
          <div className="py-2 border-b border-gray-200 dark:border-gray-700 grid grid-cols-6 gap-4">
            <div className="font-bold text-xs col-span-1">Logo</div>
            <div className="text-xs text-gray-700 dark:text-gray-300 col-span-5">
              <div className="flex gap-2 flex-wrap">
                {(() => {
                  // Support both single image_url (string) and multiple images (array)
                  const images = Array.isArray(trademark.image_url) 
                    ? trademark.image_url 
                    : trademark.image_url 
                      ? [trademark.image_url] 
                      : [];
                  
                  if (images.length === 0) {
                    return <div className="text-gray-400 text-xs">No image</div>;
                  }
                  
                  return images.map((imageUrl: string, index: number) => (
                    <div key={index} className="w-24 h-24 border border-gray-300 flex items-center justify-center bg-white">
                      <img src={imageUrl} alt={`Logo ${index + 1}`} className="max-w-full max-h-full object-contain p-1" />
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-0">
            {/* Left column */}
            <div>
              <InfoField label="Mã nhãn hiệu" value={trademark.code} />
              <InfoField label="Tên nhãn hiệu" value={trademark.name} />
              <InfoField label="Số đơn" value={trademark.application_number} />
              <InfoField 
                label="Ngày nộp đơn" 
                value={trademark.application_date ? moment(trademark.application_date).format("DD/MM/YYYY") : ""}
              />
              <InfoField label="Số bằng" value={trademark.certificate_number} />
              <InfoField 
                label="Ngày cấp bằng" 
                value={trademark.certificate_date ? moment(trademark.certificate_date).format("DD/MM/YYYY") : ""}
              />
              <InfoField 
                label="Ngày công bố" 
                value={trademark.publication_date ? moment(trademark.publication_date).format("DD/MM/YYYY") : ""}
              />
              <InfoField 
                label="Ngày hết hạn" 
                value={trademark.expiry_date ? moment(trademark.expiry_date).format("DD/MM/YYYY") : ""}
              />
              <InfoField 
                label="Chủ đơn/Chủ bằng" 
                value={trademark.owner_id ? companyMap[trademark.owner_id] : ""}
              />
            </div>

            {/* Right column */}
            <div>
              <InfoField 
                label="Trạng thái" 
                value={trademark.wipo_status || (trademark.certificate_number ? "Cấp bằng" : "Đang giải quyết")}
              />
              <InfoField label="Quốc gia" value={trademark.country_code} />
              <InfoField 
                label="Nhóm sản phẩm/Dịch vụ (Nice Classes)" 
                value={trademark.nice_class_text}
              />
              <InfoField label="Mô tả" value={trademark.description} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
