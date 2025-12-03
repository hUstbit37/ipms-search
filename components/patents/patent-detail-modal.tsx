"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import moment from "moment";

interface PatentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patent: any;
  companyMap: Record<string, string>;
}

export default function PatentDetailModal({
  open,
  onOpenChange,
  patent,
  companyMap,
}: PatentDetailModalProps) {
  if (!patent) return null;

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
          <DialogTitle>{patent.name || "Chi tiết sáng chế"}</DialogTitle>
        </VisuallyHidden>
        <div className="space-y-4">
          {/* Image - full width row */}
          <div className="py-2 border-b border-gray-200 dark:border-gray-700 grid grid-cols-6 gap-4">
            <div className="font-bold text-xs col-span-1">Hình ảnh</div>
            <div className="text-xs text-gray-700 dark:text-gray-300 col-span-5">
              <div className="flex gap-2 flex-wrap">
                {(() => {
                  // Support both single image_url (string) and multiple images (array)
                  const images = Array.isArray(patent.image_url) 
                    ? patent.image_url 
                    : patent.image_url 
                      ? [patent.image_url] 
                      : [];
                  
                  if (images.length === 0) {
                    return <div className="text-gray-400 text-xs">No image</div>;
                  }
                  
                  return images.map((imageUrl: string, index: number) => (
                    <div key={index} className="w-24 h-24 border border-gray-300 flex items-center justify-center bg-white">
                      <img src={imageUrl} alt={`Image ${index + 1}`} className="max-w-full max-h-full object-contain p-1" />
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-0">
            {/* Left column */}
            <div>
              <InfoField label="Mã sáng chế" value={patent.code} />
              <InfoField label="Tên sáng chế" value={patent.name} />
              <InfoField label="Số đơn" value={patent.application_number} />
              <InfoField 
                label="Ngày nộp đơn" 
                value={patent.application_date ? moment(patent.application_date).format("DD/MM/YYYY") : ""}
              />
              <InfoField label="Số bằng" value={patent.certificate_number} />
              <InfoField 
                label="Ngày cấp bằng" 
                value={patent.certificate_date ? moment(patent.certificate_date).format("DD/MM/YYYY") : ""}
              />
              <InfoField 
                label="Ngày công bố" 
                value={patent.publication_date ? moment(patent.publication_date).format("DD/MM/YYYY") : ""}
              />
              <InfoField 
                label="Ngày hết hạn" 
                value={patent.expiry_date ? moment(patent.expiry_date).format("DD/MM/YYYY") : ""}
              />
              <InfoField 
                label="Chủ đơn" 
                value={patent.owner_id ? companyMap[patent.owner_id] : ""}
              />
            </div>

            {/* Right column */}
            <div>
              <InfoField 
                label="Trạng thái" 
                value={patent.wipo_status || (patent.certificate_number ? "Cấp bằng" : "Đang giải quyết")}
              />
              <InfoField label="Quốc gia" value={patent.country_code} />
              <InfoField 
                label="Phân loại IPC" 
                value={patent.ipc_list}
              />
              <InfoField label="Tóm tắt" value={patent.summary} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
