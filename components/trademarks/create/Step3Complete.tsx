"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil } from "lucide-react"
import { TrademarkFormData } from "./CreateTrademarkWizard"

type Step3CompleteProps = {
  data: TrademarkFormData
  onEdit: (step: number) => void
}

export default function Step3Complete({ data, onEdit }: Step3CompleteProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Bước 3/3: Hoàn thành</h3>
      
      <div className="space-y-6">
        {/* 1. Nhãn hiệu */}
        <div className="border rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <h4 className="font-semibold text-base">1. Nhãn hiệu</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(1)}
              className="gap-2"
            >
              <Pencil className="w-4 h-4" />
              Sửa
            </Button>
          </div>

          {!data.name && !data.logoPreview ? (
            <p className="text-sm text-gray-500 italic">Chưa có dữ liệu</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Logo Preview */}
              <div>
                {data.logoPreview && (
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                    <img
                      src={data.logoPreview}
                      alt="Trademark logo"
                      className="w-full h-48 object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Trademark Info */}
              <div className="space-y-3">
                {data.name && (
                  <div>
                    <p className="text-sm font-semibold mb-1">Tên nhãn hiệu: {data.name}</p>
                    {data.brandType && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Kiểu mẫu nhãn: {data.brandType}
                      </p>
                    )}
                  </div>
                )}
                
                {data.color && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Màu sắc: {data.color}
                    </p>
                  </div>
                )}

                {data.description && (
                  <div>
                    <p className="text-sm font-medium mb-1">Mô tả:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {data.description}
                    </p>
                  </div>
                )}

                {data.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Tag:</p>
                    <div className="flex flex-wrap gap-2">
                      {data.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {data.relatedProducts && (
                  <div>
                    <p className="text-sm font-medium mb-1">Sản phẩm liên quan:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {data.relatedProducts}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. Người Yêu Cầu */}
        <div className="border rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <h4 className="font-semibold text-base">2. Người Yêu Cầu</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(1)}
              className="gap-2"
            >
              <Pencil className="w-4 h-4" />
              Sửa
            </Button>
          </div>

          {!data.applicantName && !data.applicantAddress && !data.applicantTaxCode ? (
            <p className="text-sm text-gray-500 italic">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-3">
              {data.applicantName && (
                <div>
                  <p className="text-sm font-semibold">
                    {data.applicantName}
                  </p>
                </div>
              )}
              
              {data.applicantAddress && (
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Địa chỉ:</span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      {data.applicantAddress}
                    </span>
                  </p>
                </div>
              )}

              {data.applicantTaxCode && (
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Mã số thuế:</span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      {data.applicantTaxCode}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Tài liệu */}
        <div className="border rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <h4 className="font-semibold text-base">3. Tài liệu</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(2)}
              className="gap-2"
            >
              <Pencil className="w-4 h-4" />
              Sửa
            </Button>
          </div>

          {!data.filePR && (!data.brandFiles || data.brandFiles.length === 0) ? (
            <p className="text-sm text-gray-500 italic">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-4">
              {/* File PR */}
              {data.filePR && (
                <div>
                  <p className="text-sm font-medium mb-2">1. File PR:</p>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" />
                    </svg>
                    <a
                      href="#"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      {data.filePRName}
                    </a>
                  </div>
                </div>
              )}

              {/* Brand Files */}
              {data.brandFiles && data.brandFiles.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">2. Mẫu nhãn/ Bộ ảnh:</p>
                  <div className="space-y-2">
                    {data.brandFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {file.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
