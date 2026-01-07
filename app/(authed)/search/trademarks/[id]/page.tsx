"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { trademarkService } from "@/services/trademark.service";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import moment from "moment";
import ImageShow from "@/components/common/image/image-show";
import { ImageSlideModal } from "@/components/common/image/image-slide-modal";
import OwnersDetail from "@/components/trademarks/search/owners-detail";
import AgenciesDetail from "@/components/trademarks/search/agencies-detail";
import NiceDetail from "@/components/trademarks/search/nice-detail";
import ViennaDetail from "@/components/trademarks/search/vienna-detail";
import WipoProcess from "@/components/trademarks/search/wipo-process";
import IpDocument from "@/components/trademarks/search/ip-document";
import { useAuth } from "@/providers/auth/AuthProvider";

export default function TrademarkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const trademarkId = params.id as string;
  const [showImageSlide, setShowImageSlide] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { authContext } = useAuth();

  // Lấy dữ liệu nhãn hiệu từ API
  const { data: trademark, isLoading, error } = useQuery({
    queryFn: async () => await trademarkService.getById(trademarkId),
    queryKey: ["trademark-detail", trademarkId],
    enabled: !!trademarkId && !!authContext?.token,
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

  if (error || !trademark) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-lg text-gray-600">Không tìm thấy nhãn hiệu</div>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  const imageUrls = trademark.image_urls || [];

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageSlide(true);
  };

  const InfoRow = ({ label, value, leftCol = false }: { label: string; value?: string | null; leftCol?: boolean }) => (
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
          <h1 className="text-lg font-semibold">Chi tiết nhãn hiệu</h1>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-zinc-900 border rounded-lg overflow-hidden">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mx-2 mt-2">
            <TabsTrigger value="info" className="cursor-pointer">Thông tin</TabsTrigger>
            <TabsTrigger value="process" className="cursor-pointer">Tiến trình</TabsTrigger>
            <TabsTrigger value="documents" className="cursor-pointer">Tài liệu</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="px-4 mt-4 pb-4">
            {/* Logo Section */}
            <div className="mb-4 pb-4 border-b">
              <div className="font-semibold text-sm text-gray-900 mb-2">Hình ảnh</div>
              <div className="flex flex-wrap gap-2">
                {imageUrls.length > 0 ? (
                  imageUrls.map((imageUrl: string, index: number) => (
                    <div 
                      key={index} 
                      className="cursor-pointer" 
                      onClick={() => handleImageClick(index)}
                    >
                      <ImageShow
                        src={imageUrl || ""} 
                        alt={`${trademark.name || "Trademark image"} ${index + 1}`} 
                        size="xxl"
                        disableHover={true}
                      />
                    </div>
                  ))
                ) : (
                  <ImageShow
                    src="" 
                    alt={trademark.name || "Trademark image"} 
                    size="xxl"
                    disableHover={true}
                  />
                )}
              </div>
            </div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-0">
              {/* Left Column */}
              <div>
                <InfoRow label="Loại" value="Nhãn hiệu" />
                <InfoRow
                  label="Số bằng và Ngày cấp"
                  value={
                    trademark.certificate_number && trademark.certificate_date
                      ? `${trademark.certificate_number} ${moment(trademark.certificate_date).format("YYYY.MM.DD")}`
                      : ""
                  }
                />
                <InfoRow
                  label="Expiration Date"
                  value={trademark.expiry_date ? moment(trademark.expiry_date).format("YYYY.MM.DD") : ""}
                />
                <InfoRow
                  label="Số đơn và Ngày nộp đơn"
                  value={`${trademark.application_number || ""} ${trademark.application_date ? moment(trademark.application_date).format("YYYY.MM.DD") : ""}`.trim()}
                />
                <InfoRow label="Mark" value={`${trademark.name || ""}`} />
                <InfoRow label="Đơn ưu tiên" value="" />
              </div>

              {/* Right Column */}
              <div>
                <InfoRow label="Loại đơn" value="Thông thường" />
                <InfoRow label="Trạng thái" value={trademark.wipo_status || (trademark.certificate_number ? "Cấp bằng" : "Đang giải quyết")} />
                <InfoRow
                  label="Số công bố và Ngày công bố"
                  value={`${trademark.publication_number || ""} ${trademark.publication_date ? moment(trademark.publication_date).format("YYYY.MM.DD") : ""}`.trim()}
                />
                <InfoRow label="Màu sắc bảo hộ" value={trademark.color_claim || ""} />
              </div>
            </div>

            <div className="mt-4">
              <NiceDetail
                nice_class_list_raw={trademark.nice_class_list_raw}
                nice_class_list={trademark.nice_class_list}
                nice_class_text={trademark.nice_class_text}
              />
            </div>

            <div className="mt-4">
              <ViennaDetail
                vienna_class_list_raw={trademark.vienna_class_list_raw}
                vienna_class={trademark.vienna_class}
              />
            </div>

            {/* Applicant - Full Width */}
            <div className="mt-4">
              <OwnersDetail
                owners_raw={trademark.owners_raw}
                owners={trademark.owners}
                owner_name={trademark.owner_name}
              />
            </div>

            <div className="mt-4">
              <AgenciesDetail
                agencies_raw={trademark.agencies_raw}
                agencies={trademark.agencies}
                agency_name={trademark.agency_name}
              />
            </div>

            <div className="mt-4">
              <InfoRow label="Đặc điểm nhãn hiệu" value={"Combined"} leftCol={true} />
            </div>
          </TabsContent>

          <TabsContent value="process" className="px-4 mt-4 pb-4">
            <WipoProcess wipo_process={trademark.wipo_process} />
          </TabsContent>

          <TabsContent value="documents" className="px-4 mt-4 pb-4">
            <IpDocument documents={trademark.documents} />
          </TabsContent>
        </Tabs>
      </div>

      <ImageSlideModal
        open={showImageSlide}
        onOpenChange={setShowImageSlide}
        images={imageUrls}
        initialIndex={selectedImageIndex}
        title="Xem ảnh nhãn hiệu"
      />
    </div>
  );
}
