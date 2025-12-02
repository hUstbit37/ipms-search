"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import { Calendar, Building2, FileText, Tag, Globe } from "lucide-react";

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

  const InfoRow = ({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) => (
    <div className="bg-gray-100 dark:bg-zinc-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">{value || "-"}</div>
    </div>
  );

  // Parse nice classes
  const niceClasses = trademark.nice_class_text 
    // ? trademark.nice_class_text.split(';').map((item: string) => {
    //     const match = item.trim().match(/^(\d+)\s+(.+)$/);
    //     if (match) {
    //       return { number: match[1], description: match[2] };
    //     }
    //     return null;
    //   }).filter(Boolean)
    // : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[95vw] w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4 pr-12">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-2xl font-bold flex-1">{trademark.name || "Chi tiết nhãn hiệu"}</DialogTitle>
            <Badge className="text-sm font-semibold flex-shrink-0">
              {trademark.wipo_status || (trademark.certificate_number ? "Cấp bằng" : "Đang giải quyết")}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 px-1 py-4 space-y-6">
          {/* Logo & Basic Info */}
          <div className="flex gap-6">
            <div className="w-48 h-48 border-2 border-gray-200 rounded-lg flex items-center justify-center overflow-hidden bg-white shadow-sm flex-shrink-0">
              {trademark.image_url ? (
                <img src={trademark.image_url} alt={trademark.name || "Logo"} className="w-full h-full object-contain p-2" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-6xl">{trademark.name?.charAt(0) || "?"}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-3">
              <InfoRow 
                icon={<FileText className="w-4 h-4 text-blue-600" />}
                label="Số đơn" 
                value={trademark.application_number}
              />
              <InfoRow 
                icon={<Calendar className="w-4 h-4 text-blue-600" />}
                label="Ngày nộp đơn" 
                value={trademark.application_date ? moment(trademark.application_date).format("DD/MM/YYYY") : ""}
              />
              <InfoRow 
                icon={<FileText className="w-4 h-4 text-green-600" />}
                label="Số bằng" 
                value={trademark.certificate_number}
              />
              <InfoRow 
                icon={<Calendar className="w-4 h-4 text-green-600" />}
                label="Ngày cấp bằng" 
                value={trademark.certificate_date ? moment(trademark.certificate_date).format("DD/MM/YYYY") : ""}
              />
            </div>
          </div>

          {/* Main Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            <InfoRow 
              icon={<Calendar className="w-4 h-4 text-purple-600" />}
              label="Ngày công bố" 
              value={trademark.publication_date ? moment(trademark.publication_date).format("DD/MM/YYYY") : ""}
            />
            <InfoRow 
              icon={<Calendar className="w-4 h-4 text-red-600" />}
              label="Ngày hết hạn" 
              value={trademark.expiry_date ? moment(trademark.expiry_date).format("DD/MM/YYYY") : ""}
            />
            <InfoRow 
              icon={<Globe className="w-4 h-4 text-blue-600" />}
              label="Quốc gia" 
              value={trademark.country_code}
            />
            <InfoRow 
              icon={<Tag className="w-4 h-4 text-orange-600" />}
              label="Loại nhãn hiệu" 
              value="Thông thường"
            />
          </div>

          {/* Nice Classes */}
          <InfoRow 
            icon={<Tag className="w-4 h-4 text-indigo-600" />}
            label="Lớp Nice" 
            value={trademark.nice_class_text}
          />

          {/* Owner & Representative */}
          <div className="grid grid-cols-1 gap-4">
            <InfoRow 
              icon={<Building2 className="w-4 h-4 text-blue-600" />}
              label="Chủ đơn/Chủ bằng" 
              value={trademark.owner_id ? companyMap[trademark.owner_id] : ""}
            />
            <InfoRow 
              icon={<Building2 className="w-4 h-4 text-green-600" />}
              label="Đại diện" 
              value={trademark.agency_id ? companyMap[trademark.agency_id] : ""}
            />
          </div>

          {/* Description */}
          {trademark.description && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-2">Mô tả</div>
              <div className="text-sm text-gray-900 dark:text-gray-100">{trademark.description}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
