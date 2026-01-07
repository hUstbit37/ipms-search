"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { patentService } from "@/services/patent.service";
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
import IpcDetail from "@/components/patents/search/ipc-detail";
import WipoProcess from "@/components/trademarks/search/wipo-process";
import IpDocument from "@/components/trademarks/search/ip-document";
import { useAuth } from "@/providers/auth/AuthProvider";

export default function PatentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patentId = params.id as string;
  const [showImageSlide, setShowImageSlide] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { authContext } = useAuth();

  // Lấy dữ liệu sáng chế từ API
  const { data: patent, isLoading, error } = useQuery({
    queryFn: async () => await patentService.getById(patentId),
    queryKey: ["patent-detail", patentId],
    enabled: !!patentId && !!authContext?.token,
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

  if (error || !patent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-lg text-gray-600">Không tìm thấy sáng chế</div>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

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
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-lg font-semibold">Chi tiết sáng chế</h1>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-zinc-900 border rounded-lg overflow-hidden">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mx-2 mt-2">
            <TabsTrigger value="info" className="cursor-pointer">Dữ liệu thư mục</TabsTrigger>
            <TabsTrigger value="images" className="cursor-pointer">Hình vẽ</TabsTrigger>
            <TabsTrigger value="process" className="cursor-pointer">Tiến trình</TabsTrigger>
            <TabsTrigger value="documents" className="cursor-pointer">Tài liệu</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="px-4 mt-4 pb-4">
            {/* Two Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-0">
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
            <div className="mt-4">
              <InfoField label="Tóm tắt" value={patent.summary || ""} />
            </div>

            {/* IPC class */}
            <div className="mt-4"> 
              <IpcDetail ipc_list_raw={patent.ipc_list_raw} ipc_list={patent.ipc_list} />
            </div>

            {/* Tác giả */}
            <div className="mt-4">
              <AuthorsDetail
                authors_raw={patent.authors_raw}
                authors={patent.authors}
              />
            </div>

            {/* Applicant - Full Width */}
            <div className="mt-4">
              <OwnersDetail
                owners_raw={patent.owners_raw}
                owners={patent.owners}
                owner_name={patent.owner_name}
              />
            </div>

            <div className="mt-4">
              <AgenciesDetail
                agencies_raw={patent.agencies_raw}
                agencies={patent.agencies}
                agency_name={patent.agency_name || ""}
              />
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
                        alt={`${patent.name || "Patent image"} ${index + 1}`} 
                        size="xxxl"
                        disableHover={true}
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex-shrink-0">
                    <ImageShow src="" alt={patent.name || "Patent image"} size="xxl" disableHover={true} />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="process" className="px-4 mt-4 pb-4">
            <WipoProcess wipo_process={patent.wipo_process} />
          </TabsContent>

          <TabsContent value="documents" className="px-4 mt-4 pb-4">
            <IpDocument documents={patent.documents} />
          </TabsContent>
        </Tabs>
      </div>

      <ImageSlideModal
        open={showImageSlide}
        onOpenChange={setShowImageSlide}
        images={imageUrls}
        initialIndex={selectedImageIndex}
        title="Xem ảnh sáng chế"
      />
    </div>
  );
}

