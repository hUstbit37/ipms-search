"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { trademarkService } from "@/services/trademark.service";
import { companyService } from "@/services/company.service";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FORMAT_DATE } from "@/constants";
import moment from "moment";

export default function TrademarkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const trademarkId = params.id as string;

  const { data: trademarkData, isLoading } = useQuery({
    queryFn: async () => await trademarkService.getById(trademarkId),
    queryKey: ["trademark-detail", trademarkId],
    enabled: !!trademarkId,
  });

  const { data: companiesData } = useQuery({
    queryFn: async () => await companyService.getAll({ limit: 500, datasource: "ALL" }),
    queryKey: ["companies"],
  });

  const companyMap = companiesData?.items?.reduce((acc, company) => {
    acc[company.id] = company.name;
    return acc;
  }, {} as Record<string, string>) || {};

  const trademark = trademarkData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  if (!trademark) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-lg">Không tìm thấy nhãn hiệu</div>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  const DetailRow = ({ label, value, isLink = false }: { label: string; value: any; isLink?: boolean }) => (
    <div className="grid grid-cols-12 gap-4 py-3 border-b">
      <div className="col-span-4 font-semibold text-sm">{label}</div>
      <div className="col-span-8 text-sm">
        {isLink && value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
            {value}
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          value || "-"
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="w-48 h-48 border rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
              {trademark.image_url ? (
                <img 
                  src={trademark.image_url} 
                  alt={trademark.mark_verbal_element_text || "Trademark"} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-6xl font-bold text-gray-300">
                  {trademark.mark_verbal_element_text?.charAt(0) || "?"}
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">
              {trademark.mark_verbal_element_text || "Nhãn hiệu"}
            </h1>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Loại:</span>
                <span className="text-sm font-medium">{trademark.application_type || "Nhãn hiệu"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Phân loại:</span>
                <span className="text-sm font-medium">{trademark.application_subtype || "Thông thường"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Trạng thái:</span>
                <span className="text-sm px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                  {trademark.wipo_status || "ACTIVE"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Details */}
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">(100) Registration Number and Date</h2>
        <div className="space-y-1">
          <DetailRow label="Số đăng ký" value={trademark.registration_number} />
          <DetailRow 
            label="Ngày đăng ký" 
            value={trademark.registration_date ? moment(trademark.registration_date).format(FORMAT_DATE) : null} 
          />
        </div>
      </div>

      {/* Expiration Date */}
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">(180) Expiration Date</h2>
        <DetailRow 
          label="Ngày hết hạn" 
          value={trademark.expiration_date ? moment(trademark.expiration_date).format(FORMAT_DATE) : null} 
        />
      </div>

      {/* Filing Details */}
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">(200) Filing Number and Date</h2>
        <div className="space-y-1">
          <DetailRow label="Số đơn" value={trademark.application_number} />
          <DetailRow 
            label="Ngày nộp đơn" 
            value={trademark.application_date ? moment(trademark.application_date).format(FORMAT_DATE) : null} 
          />
        </div>
      </div>

      {/* Publication Details */}
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">(400) Publication Number and Date</h2>
        <div className="space-y-1">
          <DetailRow label="Số công bố" value={trademark.publication_number} />
          <DetailRow 
            label="Ngày công bố" 
            value={trademark.publication_date ? moment(trademark.publication_date).format(FORMAT_DATE) : null} 
          />
        </div>
      </div>

      {/* Mark Details */}
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">(541) Mark</h2>
        <DetailRow label="Nhãn hiệu" value={trademark.mark_verbal_element_text} />
      </div>

      {/* Mark Color */}
      {trademark.mark_color_claimed_text && (
        <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">(591) Mark Color</h2>
          <DetailRow label="Màu sắc" value={trademark.mark_color_claimed_text} />
        </div>
      )}

      {/* Priority Details */}
      {trademark.priority_country_code && (
        <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">(300) Priority Details</h2>
          <div className="space-y-1">
            <DetailRow label="Mã nước ưu tiên" value={trademark.priority_country_code} />
            <DetailRow label="Số ưu tiên" value={trademark.priority_number} />
            <DetailRow 
              label="Ngày ưu tiên" 
              value={trademark.priority_date ? moment(trademark.priority_date).format(FORMAT_DATE) : null} 
            />
          </div>
        </div>
      )}

      {/* Nice Classes */}
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">(511) Nice Classes</h2>
        <div className="space-y-4">
          {trademark.nice_classes?.map((niceClass: any, index: number) => (
            <div key={index} className="border-b pb-3 last:border-b-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600 font-semibold text-lg">
                  {niceClass.nice_class_code}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {niceClass.nice_class_description || "-"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Vienna Classes */}
      {trademark.vienna_classes && trademark.vienna_classes.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">(531) Vienna Classes</h2>
          <div className="space-y-2">
            {trademark.vienna_classes.map((vienna: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <span className="text-sm">
                  {vienna.vienna_class_code} {vienna.vienna_class_description && `(${vienna.vienna_class_description})`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applicant */}
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">(730) Applicant</h2>
        <div className="space-y-1">
          <DetailRow 
            label="Tên chủ đơn" 
            value={trademark.owner_id ? companyMap[trademark.owner_id] : null} 
          />
          <DetailRow label="Địa chỉ" value={trademark.applicant_address} />
          <DetailRow label="Mã nước" value={trademark.applicant_country_code} />
        </div>
      </div>

      {/* Representative */}
      {trademark.representative_name && (
        <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">(740) Representative</h2>
          <div className="space-y-1">
            <DetailRow label="Tên đại diện" value={trademark.representative_name} />
            <DetailRow label="Địa chỉ" value={trademark.representative_address} />
          </div>
        </div>
      )}

      {/* Mark Feature */}
      {trademark.mark_feature && (
        <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">(550) Mark Feature</h2>
          <DetailRow label="Đặc điểm" value={trademark.mark_feature} />
        </div>
      )}

      {/* Disclaimer */}
      {trademark.disclaimer_text && (
        <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">(526) Disclaimer</h2>
          <p className="text-sm">{trademark.disclaimer_text}</p>
        </div>
      )}
    </div>
  );
}
