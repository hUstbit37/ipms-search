"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { industrialDesignsService } from "@/services/industrial-designs.service";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import moment from "moment";
import ImageShow from "@/components/common/image/image-show";
import { ImageSlideModal } from "@/components/common/image/image-slide-modal";
import OwnersDetail from "@/components/trademarks/search/owners-detail";
import AgenciesDetail from "@/components/trademarks/search/agencies-detail";
import PriorityData from "@/components/patents/search/priority-data";
import AuthorsDetail from "@/components/patents/search/authors-detail";
import LocarnoDetail from "@/components/industrial-designs/search/locarno-detail";
import WipoProcess from "@/components/trademarks/search/wipo-process";
import IpDocument from "@/components/trademarks/search/ip-document";
import { useAuth } from "@/providers/auth/AuthProvider";

export default function IndustrialDesignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const designId = params.id as string;
  const [showImageSlide, setShowImageSlide] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { authContext } = useAuth();

  // Lấy dữ liệu kiểu dáng công nghiệp từ API
  const { data: design, isLoading, error } = useQuery({
    queryFn: async () => await industrialDesignsService.getById(designId),
    queryKey: ["industrial-design-detail", designId],
    enabled: !!designId && !!authContext?.token,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-lg text-gray-600">Không tìm thấy kiểu dáng công nghiệp</div>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

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
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-lg font-semibold">Chi tiết kiểu dáng công nghiệp</h1>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-zinc-900 border rounded-lg overflow-hidden">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mx-2 mt-2">
            <TabsTrigger value="info" className="cursor-pointer">Thông tin</TabsTrigger>
            <TabsTrigger value="images" className="cursor-pointer">Hình vẽ</TabsTrigger>
            <TabsTrigger value="process" className="cursor-pointer">Tiến trình</TabsTrigger>
            <TabsTrigger value="documents" className="cursor-pointer">Tài liệu</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="px-4 mt-4 pb-4">
            {/* Two Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-0">
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
            <div className="mt-4">
              <InfoField label="Tóm tắt" value={design.summary || ""} />
            </div>

            {/* Locarno class */}
            <div className="mt-4"> 
              <LocarnoDetail 
                locarno_list={design.locarno_list}
                locarno_list_raw={design.locarno_list_raw}
              />
            </div>

            {/* Tác giả */}
            <div className="mt-4">
              <AuthorsDetail
                authors_raw={design.authors_raw}
                authors={design.authors}
              />
            </div>

            {/* Applicant - Full Width */}
            <div className="mt-4">
              <OwnersDetail
                owners_raw={design.owners_raw}
                owners={design.owners}
                owner_name={design.owner_name}
              />
            </div>

            <div className="mt-4">
              <AgenciesDetail
                agencies_raw={design.agencies_raw}
                agencies={design.agencies}
                agency_name={design.agency_name || ""}
              />
            </div>

            {/* Yêu cầu bảo hộ */}
            <div className="mt-4">
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
          <TabsContent value="images" className="px-2 sm:px-4 mt-4 pb-4">
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

          <TabsContent value="process" className="px-4 mt-4 pb-4">
            <WipoProcess wipo_process={design.wipo_process} />
          </TabsContent>

          <TabsContent value="documents" className="px-4 mt-4 pb-4">
            <IpDocument documents={design.documents} />
          </TabsContent>
        </Tabs>
      </div>

      <ImageSlideModal
        open={showImageSlide}
        onOpenChange={setShowImageSlide}
        images={imageUrls}
        initialIndex={selectedImageIndex}
        alt={design.name || "Kiểu dáng công nghiệp"}
        title={design.name || "Kiểu dáng công nghiệp"}
      />
    </div>
  );
}

