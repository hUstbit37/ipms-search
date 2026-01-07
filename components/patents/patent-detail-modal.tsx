"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import moment from "moment";
import PriorityData from "@/components/patents/search/priority-data";
import AuthorsDetail from "@/components/patents/search/authors-detail";
import IpcDetail from "@/components/patents/search/ipc-detail";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import ImageShow from "@/components/common/image/image-show";
import { ImageSlideModal } from "@/components/common/image/image-slide-modal";
import OwnersDetail from "@/components/trademarks/search/owners-detail";
import AgenciesDetail from "@/components/trademarks/search/agencies-detail";
import NiceDetail from "@/components/trademarks/search/nice-detail";
import ViennaDetail from "@/components/trademarks/search/vienna-detail";
import WipoProcess from "@/components/trademarks/search/wipo-process";
import IpDocument from "@/components/trademarks/search/ip-document";

interface PatentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patent: any;
  companyMap: Record<string, string>;
  selectedCustomFields?: string[];
}

export default function PatentDetailModal({
  open,
  onOpenChange,
  patent,
  companyMap,
  selectedCustomFields = [],
}: PatentDetailModalProps) {
  const [showImageSlide, setShowImageSlide] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  if (!patent) return null;

  const imageUrls = patent.image_urls || [];

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
          <DialogTitle>{patent.name || "Chi tiết sáng chế"}</DialogTitle>
        </VisuallyHidden>
        <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-2 mt-0">
            <TabsTrigger value="info" className="cursor-pointer">Dữ liệu thư mục</TabsTrigger>
            <TabsTrigger value="images" className="cursor-pointer">Hình vẽ</TabsTrigger>
            <TabsTrigger value="process" className="cursor-pointer">Tiến trình</TabsTrigger>
            <TabsTrigger value="documents" className="cursor-pointer">Tài liệu</TabsTrigger>
            {/* {selectedCustomFields.length > 0 && (
              <TabsTrigger value="custom-fields" className="cursor-pointer">Trường nội bộ</TabsTrigger>
            )} */}
          </TabsList>

          <TabsContent value="info" className="flex-1 overflow-y-auto px-4 mt-1">
            {/* Logo Section */}
            {/* <div className="mb-2 pb-2">
              <div className="font-semibold text-sm text-gray-900">Hình ảnh</div>
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
            </div> */}

            {/* Two Column Grid */}
            <div className="grid grid-cols-2 gap-x-16 gap-y-0">
              {/* Left Column */}
              <div>
                <InfoField label="Tên sáng chế" value={patent.name || ""} />
                <InfoField
                  label="Số bằng và Ngày cấp"
                  value={
                    patent.certificate_number && patent.certificate_date
                      ? `${patent.certificate_number} ${moment(patent.certificate_date).format("YYYY.MM.DD")}`
                      : ""
                  }
                />
                <InfoField
                  label="Expiration Date"
                  value={patent.expiry_date ? moment(patent.expiry_date).format("YYYY.MM.DD") : ""}
                />  
                <InfoField
                  label="Số đơn và Ngày nộp đơn"
                  value={`${patent.application_number || ""} ${patent.application_date ? moment(patent.application_date).format("YYYY.MM.DD") : ""}`.trim()}
                />
                <PriorityData priority_data={patent.priority_data} />
              </div>

              {/* Right Column */}
              <div>
                <InfoField label="Loại đơn" value="Thông thường" />
                <InfoField label="Trạng thái" value={patent.wipo_status || (patent.certificate_number ? "Cấp bằng" : "Đang giải quyết")} />
                <InfoField
                  label="Số công bố và Ngày công bố"
                  value={`${patent.publication_number || ""} ${patent.publication_date ? moment(patent.publication_date).format("YYYY.MM.DD") : ""}`.trim()}
                />
              </div>
            </div>
            {/* Tóm tắt */}
            <div>
              <InfoField label="Tóm tắt" value={patent.summary || ""} />
            </div>

            {/* IPC class */}
            <div> 
              <IpcDetail ipc_list_raw={patent.ipc_list_raw} ipc_list={patent.ipc_list} />
            </div>

             {/* Tác giả */}
             <div>
               <AuthorsDetail
                 authors_raw={patent.authors_raw}
                 authors={patent.authors}
               />
             </div>

            {/* Applicant - Full Width */}
            <div>
              <OwnersDetail
                owners_raw={patent.owners_raw}
                owners={patent.owners}
                owner_name={patent.owner_name}
              />
            </div>

            <div>
              <AgenciesDetail
                agencies_raw={patent.agencies_raw}
                agencies={patent.agencies}
                agency_name={patent.agency_name || ""}
              />
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
                         alt={`${patent.name || "Patent image"} ${index + 1}`} 
                         size="xxxl"
                         disableHover={true}
                       />
                     </div>
                   ))
                 ) : (
                   <div className="flex-shrink-0">
                     <ImageShow src="" alt={patent.name || " image"} size="xxl" disableHover={true} />
                   </div>
                 )}
               </div>
             </div>
           </TabsContent>

          <TabsContent value="process" className="flex-1 overflow-y-auto px-4 mt-4">
            <WipoProcess wipo_process={patent.wipo_process} />
          </TabsContent>

          <TabsContent value="documents" className="flex-1 overflow-y-auto px-4 mt-4">
            <IpDocument documents={patent.documents} />
          </TabsContent>

          {/* {selectedCustomFields.length > 0 && (
            <TabsContent value="custom-fields" className="flex-1 overflow-y-auto px-4 mt-4">
              <div className="space-y-3">
                {selectedCustomFields.map((fieldName) => (
                  <div key={fieldName} className="border-b pb-3">
                    <InfoField 
                      label={fieldName} 
                      value={patent.custom_fields?.[fieldName] || "-"} 
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          )} */}
        </Tabs>
      </DialogContent>

      <ImageSlideModal
        open={showImageSlide}
        onOpenChange={setShowImageSlide}
        images={imageUrls}
        initialIndex={selectedImageIndex}
        title="Xem ảnh sáng chế"
      />
    </Dialog>
  );
}
