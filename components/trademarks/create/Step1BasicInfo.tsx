"use client"

import React, { useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Upload, Image as ImageIcon } from "lucide-react"
import { TrademarkFormData } from "./CreateTrademarkWizard"

type Step1BasicInfoProps = {
  data: TrademarkFormData
  onChange: (data: Partial<TrademarkFormData>) => void
}

export default function Step1BasicInfo({ data, onChange }: Step1BasicInfoProps) {
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [tagInput, setTagInput] = React.useState("")

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onChange({
          logo: file,
          logoPreview: reader.result as string,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
      onChange({
        tags: [...data.tags, tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({
      tags: data.tags.filter(tag => tag !== tagToRemove),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Bước 1/3: Thông tin nhãn hiệu</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <h4 className="font-bold mb-4 text-sm">THÔNG TIN NHÃN HIỆU</h4>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">
                  Tên nhãn hiệu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Nhập tên nhãn hiệu"
                  value={data.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>
                  Mẫu nhãn hiệu (Logo) <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2">
                  {data.logoPreview ? (
                    <div className="relative border-2 border-dashed rounded-lg p-4 flex flex-col items-center">
                      <img
                        src={data.logoPreview}
                        alt="Logo preview"
                        className="max-w-full h-40 object-contain mb-2"
                      />
                      <p className="text-sm text-gray-500 mb-2">Tải lên hình ảnh</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        Thay đổi
                      </Button>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-1">Tải lên hình ảnh</p>
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Chọn file
                      </Button>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Mô tả nhãn hiệu</Label>
                <textarea
                  id="description"
                  placeholder="Mô tả nhãn hiệu"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none mt-2"
                  value={data.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="brandType">Kiểu mẫu nhãn</Label>
                <Select
                  value={data.brandType}
                  onValueChange={(value) => onChange({ brandType: value })}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Chọn kiểu mẫu nhãn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Chữ</SelectItem>
                    <SelectItem value="image">Hình ảnh</SelectItem>
                    <SelectItem value="combined">Kết hợp</SelectItem>
                    <SelectItem value="3d">3D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color">Màu sắc</Label>
                <Input
                  id="color"
                  placeholder="Nhập màu sắc"
                  value={data.color}
                  onChange={(e) => onChange({ color: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="relatedProducts">Các sản phẩm liên quan</Label>
                <Select
                  value={data.relatedProducts}
                  onValueChange={(value) => onChange({ relatedProducts: value })}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Chọn sản phẩm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Thực phẩm</SelectItem>
                    <SelectItem value="beverage">Đồ uống</SelectItem>
                    <SelectItem value="cosmetics">Mỹ phẩm</SelectItem>
                    <SelectItem value="clothing">Quần áo</SelectItem>
                    <SelectItem value="technology">Công nghệ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div>
            <h4 className="font-bold mb-4 text-sm">GẮN TAG TÌM KIẾM</h4>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="tags">
                  Tag <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={tagInput}
                  onValueChange={(value) => {
                    if (value && !data.tags.includes(value)) {
                      onChange({ tags: [...data.tags, value] })
                    }
                    setTagInput("")
                  }}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Chọn tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#omachi">#omachi</SelectItem>
                    <SelectItem value="#sao">#sao</SelectItem>
                    <SelectItem value="#food">#food</SelectItem>
                    <SelectItem value="#beverage">#beverage</SelectItem>
                    <SelectItem value="#product">#product</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {data.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {data.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm">THÔNG TIN NGƯỜI YÊU CẦU</h4>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="applicantName">
                  Tên công ty <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={data.applicantName}
                  onValueChange={(value) => onChange({ applicantName: value })}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Chọn công ty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company1">Công ty TNHH ABC</SelectItem>
                    <SelectItem value="company2">Công ty CP XYZ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="applicantAddress">Địa chỉ</Label>
                <Input
                  id="applicantAddress"
                  placeholder="Địa chỉ"
                  value={data.applicantAddress}
                  onChange={(e) => onChange({ applicantAddress: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="applicantTaxCode">Mã số thuế</Label>
                <Input
                  id="applicantTaxCode"
                  placeholder="Mã số thuế"
                  value={data.applicantTaxCode}
                  onChange={(e) => onChange({ applicantTaxCode: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="applicantPhone">
                  Số PR <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="applicantPhone"
                  placeholder="Nhập số PR"
                  value={data.applicantPhone}
                  onChange={(e) => onChange({ applicantPhone: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
