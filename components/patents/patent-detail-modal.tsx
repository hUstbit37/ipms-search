"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import moment from "moment";
import ImageShow from "../common/image/image-show";

interface PatentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patent: any;
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
            <div className="flex flex-wrap gap-2 mt-2">
              {patent.image_urls && patent.image_urls.length > 0 ? (
                patent.image_urls.map((imageUrl: string, index: number) => (
                  <ImageShow
                    key={index}
                    src={imageUrl || ""} 
                    alt={`${patent.name || "Patent image"} ${index + 1}`} 
                    size="xxl"
                  />
                ))
              ) : (
                <ImageShow
                  src="" 
                  alt={patent.name || "Patent image"} 
                  size="xxl"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-0">
            {/* Left column */}
            <div>
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
              value={(patent.publication_date ? moment(patent.publication_date).format("DD/MM/YYYY") : "") + (patent.publication_number ? `  ${patent.publication_number}` : "")}
              />
              <InfoField 
              label="Ngày hết hạn" 
              value={patent.expiry_date ? moment(patent.expiry_date).format("DD/MM/YYYY") : ""}
              />
              <div className="py-2 border-b border-gray-200 dark:border-gray-700 last:border-0 grid grid-cols-3 gap-4">
              <div className="font-bold text-xs col-span-1">Đơn ưu tiên</div>
              <div className="text-xs text-gray-700 dark:text-gray-300 col-span-2">
                {patent.priority_data && patent.priority_data.length > 0 ? (
                <div className="space-y-1">
                  {patent.priority_data.map((priority: any, index: number) => (
                  <div key={index}>
                    {priority.appNumber} - {priority.date ? moment(priority.date).format("DD/MM/YYYY") : "N/A"} - {priority.country}
                  </div>
                  ))}
                </div>
                ) : ""}
              </div>
              </div>
              <InfoField 
              label="Tác giả" 
              value={formatAuthorsRaw(patent?.authors_raw) || patent?.authors || ""}
              />
              <InfoField 
              label="Chủ đơn" 
              value={formatOwnersRaw(patent?.owners_raw) || patent?.owner_name || patent.owner || ""}
              />
              <InfoField 
              label="Đại diện" 
              value={formatAgenciesRaw(patent?.agencies_raw) || patent?.agency_name || ""}
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
