"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import { Calendar, Building2, FileText, Tag, Globe, FileCheck } from "lucide-react";

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

  const InfoRow = ({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) => (
    <div className="bg-gray-100 dark:bg-zinc-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">{value || "-"}</div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[95vw] w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4 pr-12">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-2xl font-bold flex-1">{design.name || "Chi tiết kiểu dáng công nghiệp"}</DialogTitle>
            <Badge className="text-sm font-semibold flex-shrink-0">
              {design.wipo_status || (design.certificate_number ? "Cấp bằng" : "Đang giải quyết")}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 px-1 py-4 space-y-6">
          {/* Image & Basic Info */}
          <div className="flex gap-6">
            <div className="w-48 h-48 border-2 border-gray-200 rounded-lg flex items-center justify-center overflow-hidden bg-white shadow-sm flex-shrink-0">
              {design.image_url ? (
                <img src={design.image_url} alt={design.name || "Design"} className="w-full h-full object-contain p-2" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-6xl">{design.name?.charAt(0) || "?"}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-3">
              <InfoRow 
                icon={<FileText className="w-4 h-4 text-blue-600" />}
                label="Số đơn" 
                value={design.application_number}
              />
              <InfoRow 
                icon={<Calendar className="w-4 h-4 text-blue-600" />}
                label="Ngày nộp đơn" 
                value={design.application_date ? moment(design.application_date).format("DD/MM/YYYY") : ""}
              />
              <InfoRow 
                icon={<FileCheck className="w-4 h-4 text-green-600" />}
                label="Số bằng" 
                value={design.certificate_number}
              />
              <InfoRow 
                icon={<Calendar className="w-4 h-4 text-green-600" />}
                label="Ngày cấp bằng" 
                value={design.certificate_date ? moment(design.certificate_date).format("DD/MM/YYYY") : ""}
              />
            </div>
          </div>

          {/* Main Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            <InfoRow 
              icon={<Calendar className="w-4 h-4 text-purple-600" />}
              label="Ngày công bố" 
              value={design.publication_date ? moment(design.publication_date).format("DD/MM/YYYY") : ""}
            />
            <InfoRow 
              icon={<FileText className="w-4 h-4 text-purple-600" />}
              label="Số công bố" 
              value={design.publication_number}
            />
            <InfoRow 
              icon={<Calendar className="w-4 h-4 text-red-600" />}
              label="Ngày hết hạn" 
              value={design.expiry_date ? moment(design.expiry_date).format("DD/MM/YYYY") : ""}
            />
            <InfoRow 
              icon={<Globe className="w-4 h-4 text-blue-600" />}
              label="Quốc gia" 
              value={design.country_code}
            />
          </div>

          {/* Owner */}
          <InfoRow 
            icon={<Building2 className="w-4 h-4 text-blue-600" />}
            label="Chủ đơn/Chủ bằng" 
            value={design.owner_id ? companyMap[design.owner_id] : ""}
          />

          {/* Description */}
          {design.description && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-2">Mô tả</div>
              <div className="text-sm text-gray-900 dark:text-gray-100">{design.description}</div>
            </div>
          )}

          {/* Summary */}
          {design.summary && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-2">Tóm tắt</div>
              <div className="text-sm text-gray-900 dark:text-gray-100">{design.summary}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
