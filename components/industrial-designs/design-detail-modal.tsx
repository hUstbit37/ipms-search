"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import moment from "moment";
import PriorityData from "@/components/patents/search/priority-data";
import AuthorsDetail from "@/components/patents/search/authors-detail";
import IpcDetail from "@/components/patents/search/ipc-detail";
import LocarnoDetail from "@/components/industrial-designs/search/locarno-detail";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import ImageShow from "@/components/common/image/image-show";
import OwnersDetail from "@/components/trademarks/search/owners-detail";
import AgenciesDetail from "@/components/trademarks/search/agencies-detail";
import WipoProcess from "@/components/trademarks/search/wipo-process";
import IpDocument from "@/components/trademarks/search/ip-document";
import { ImageSlideModal } from "@/components/common/image/image-slide-modal";

interface DesignDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  design: any;
  companyMap: Record<string, string>;
  selectedCustomFields?: string[];
}

export default function DesignDetailModal({
  open,
  onOpenChange,
  design,
  companyMap,
  selectedCustomFields = [],
}: DesignDetailModalProps) {
  const [showImageSlide, setShowImageSlide] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!design) return null;

  const imageUrls: string[] = design.image_urls && Array.isArray(design.image_urls) 
    ? design.image_urls.filter((url: string) => url) 
    : [];

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageSlide(true);
  };

  const InfoField = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="py-2 flex items-start gap-4">
      <div className="font-semibold text-sm text-gray-900 min-w-[250px]">{label}</div>
      <div className="text-sm text-gray-700 flex-1">{value || ""}</div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[96vw] w-full max-h-[95vh] min-h-[95vh] overflow-y-auto p-8">
        <VisuallyHidden>
          <DialogTitle>{design.name || "Chi tiết kiểu dáng công nghiệp"}</DialogTitle>
        </VisuallyHidden>
        <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-2 mt-0">
            <TabsTrigger value="info" className="cursor-pointer">Thông tin</TabsTrigger>
            <TabsTrigger value="images" className="cursor-pointer">Hình vẽ</TabsTrigger>
            <TabsTrigger value="process" className="cursor-pointer">Tiến trình</TabsTrigger>
            <TabsTrigger value="documents" className="cursor-pointer">Tài liệu</TabsTrigger>
            {selectedCustomFields.length > 0 && (
              <TabsTrigger value="custom-fields" className="cursor-pointer">Trường nội bộ</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="info" className="flex-1 overflow-y-auto px-4 mt-1">
            {/* Two Column Grid */}
            <div className="grid grid-cols-2 gap-x-16 gap-y-0">
              {/* Left Column */}
              <div>
                <InfoField label="Tên sáng chế" value={design.name || ""} />
                <InfoField
                  label="Số bằng và Ngày cấp"
                  value={
                    design.certificate_number && design.certificate_date
                      ? `${design.certificate_number} ${moment(design.certificate_date).format("YYYY.MM.DD")}`
                      : ""
                  }
                />
                <InfoField
                  label="Expiration Date"
                  value={design.expiry_date ? moment(design.expiry_date).format("YYYY.MM.DD") : ""}
                />  
                <InfoField
                  label="Số đơn và Ngày nộp đơn"
                  value={`${design.application_number || ""} ${design.application_date ? moment(design.application_date).format("YYYY.MM.DD") : ""}`.trim()}
                />
                <PriorityData priority_data={design.priority_data} />
              </div>

              {/* Right Column */}
              <div>
                <InfoField label="Loại đơn" value="Thông thường" />
                <InfoField label="Trạng thái" value={design.wipo_status || (design.certificate_number ? "Cấp bằng" : "Đang giải quyết")} />
                <InfoField
                  label="Số công bố và Ngày công bố"
                  value={`${design.publication_number || ""} ${design.publication_date ? moment(design.publication_date).format("YYYY.MM.DD") : ""}`.trim()}
                />
              </div>
            </div>
            {/* Tóm tắt */}
            <div>
              <InfoField label="Tóm tắt" value={design.summary || ""} />
            </div>

            {/* Locarno class */}
            <div> 
              <LocarnoDetail 
                locarno_list={design.locarno_list}
                locarno_list_raw={design.locarno_list_raw}
              />
            </div>

             {/* Tác giả */}
             <div>
               <AuthorsDetail
                 authors_raw={design.authors_raw}
                 authors={design.authors}
               />
             </div>

            {/* Applicant - Full Width */}
            <div>
              <OwnersDetail
                owners_raw={design.owners_raw}
                owners={design.owners}
                owner_name={design.owner_name}
              />
            </div>

            <div>
              <AgenciesDetail
                agencies_raw={design.agencies_raw}
                agencies={design.agencies}
                agency_name={design.agency_name || ""}
              />
            </div>
            {/* Yêu cầu bảo hộ */}
            <div>
              <div className="font-semibold text-sm text-gray-900 mb-2">Yêu cầu bảo hộ</div>
              {design.request_protections && Array.isArray(design.request_protections) && design.request_protections.length > 0 ? (
                <div className="border rounded-lg overflow-hidden max-w-2xl">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Mô tả</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Yêu cầu bảo hộ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {design.request_protections.map((item: any, index: number) => (
                        <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-700">{item["Mô tả"] || ""}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{item["Yêu cầu bảo hộ"] || ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-gray-500"></div>
              )}
            </div>
          </TabsContent>

           {/* Hình vẽ */}
           <TabsContent value="images" className="flex-1 overflow-y-auto px-2 sm:px-4 mt-4">
             <div className="mb-2 pb-2">
               <div className="font-semibold text-sm text-gray-900 mb-2">Hình ảnh</div>
               <div className="flex flex-wrap gap-1">
                 {imageUrls.length > 0 ? (
                   imageUrls.map((imageUrl: string, index: number) => (
                     <div 
                       key={index} 
                       className="flex-shrink-0 cursor-pointer"
                       onClick={() => handleImageClick(index)}
                     >
                       <ImageShow 
                         src={imageUrl || ""} 
                         alt={`${design.name || "Design image"} ${index + 1}`} 
                         size="xxxl"
                         disableHover={true}
                       />
                     </div>
                   ))
                 ) : (
                   <div className="flex-shrink-0">
                     <ImageShow src="" alt={design.name || "Design image"} size="xxl" disableHover={true} />
                   </div>
                 )}
               </div>
             </div>
           </TabsContent>

          <TabsContent value="process" className="flex-1 overflow-y-auto px-4 mt-4">
            <WipoProcess wipo_process={design.wipo_process} />
          </TabsContent>

          <TabsContent value="documents" className="flex-1 overflow-y-auto px-4 mt-4">
            <IpDocument documents={design.documents} />
          </TabsContent>

          {selectedCustomFields.length > 0 && (
            <TabsContent value="custom-fields" className="flex-1 overflow-y-auto px-4 mt-4">
              <div className="space-y-3">
                {selectedCustomFields.map((fieldName) => (
                  <div key={fieldName} className="border-b pb-3">
                    <InfoField 
                      label={fieldName} 
                      value={design.custom_fields?.[fieldName] || "-"} 
                    />
                  </div>
                ))}
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
        alt={design.name || "Kiểu dáng công nghiệp"}
        title={design.name || "Kiểu dáng công nghiệp"}
      />
    </Dialog>
  );
}
