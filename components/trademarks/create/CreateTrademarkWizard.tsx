"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import Step1BasicInfo from "./Step1BasicInfo"
import Step2Documents from "./Step2Documents"
import Step3Complete from "./Step3Complete"

export type TrademarkFormData = {
  // Step 1: Basic Info
  name: string
  logo?: File
  logoPreview?: string
  description: string
  brandType: string
  color: string
  relatedProducts: string
  tags: string[]
  
  // Applicant Info
  applicantName: string
  applicantAddress: string
  applicantTaxCode: string
  applicantPhone: string
  
  // Step 2: Documents
  filePR?: File
  filePRPreview?: string
  filePRName?: string
  brandFiles?: File[]
  brandFilesPreview?: string[]
}

type CreateTrademarkWizardProps = {
  onCancel?: () => void
}

export default function CreateTrademarkWizard({ onCancel }: CreateTrademarkWizardProps = {}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<TrademarkFormData>({
    name: "",
    description: "",
    brandType: "",
    color: "",
    relatedProducts: "",
    tags: [],
    applicantName: "",
    applicantAddress: "",
    applicantTaxCode: "",
    applicantPhone: "",
  })

  const updateFormData = (data: Partial<TrademarkFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSave = () => {
    console.log("Save draft:", formData)
    // TODO: Call API to save draft
  }

  const handleSubmit = () => {
    console.log("Submit trademark:", formData)
    // TODO: Call API to submit
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold">Tạo mới IP - Nhãn hiệu</h2>
      
      <div className="flex gap-6">
        {/* Left Side - Steps Indicator */}
        <div className="w-64 flex-shrink-0">
          <div className="space-y-3">
            {[
              { step: 1, label: "Bước 1 - Thông tin nhãn hiệu" },
              { step: 2, label: "Bước 2 - Tài liệu đính kèm" },
              { step: 3, label: "Bước 3 - Hoàn thành" },
            ].map(({ step, label }) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step <= currentStep
                      ? "bg-black dark:bg-white"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  {step <= currentStep && (
                    <svg className="w-3 h-3 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    step <= currentStep
                      ? "text-black dark:text-white font-medium"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Step Content */}
        <div className="flex-1 min-h-[500px]">
          {currentStep === 1 && (
            <Step1BasicInfo
              data={formData}
              onChange={updateFormData}
            />
          )}
          {currentStep === 2 && (
            <Step2Documents
              data={formData}
              onChange={updateFormData}
            />
          )}
          {currentStep === 3 && (
            <Step3Complete
              data={formData}
              onEdit={(step) => setCurrentStep(step)}
            />
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div></div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              if (currentStep === 1 && onCancel) {
                onCancel()
              } else {
                handleBack()
              }
            }}
          >
            Quay lại
          </Button>
          
          <Button variant="outline" onClick={handleSave}>
            Lưu nháp
          </Button>
          
          {currentStep < 3 ? (
            <Button onClick={handleNext}>
              Tiếp tục
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              Xác nhận
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
