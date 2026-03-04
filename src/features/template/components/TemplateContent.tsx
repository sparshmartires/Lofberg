"use client"

import { useEffect, useState } from "react"
import IncreasingImpactSection from "./IncreasingImpactSection"
import CertificationsSection from "./CertificationSection"
import CoverPageSection from "./CoverPageSection"
import AboutSustainabilitySection from "./AboutSustainabilitySection"
import UspSection from "./UspSection"
import ReceiptSection from "./ReceiptSection"
import CompiledReceiptSection from "./CompiledReceiptSection"

interface SustainabilitySectionProps {
  templateType: string
}

export default function SustainabilitySection({ templateType }: SustainabilitySectionProps) {
  const isReceiptTemplate = templateType === "receipt-a4"

  const [activeTab, setActiveTab] = useState(isReceiptTemplate ? "receipt" : "about")

  const reportTabs = [
    { value: "cover", label: "Cover page" },
    { value: "about", label: "About sustainability" },
    { value: "usp", label: "Lofbergs USP's" },
    { value: "impact", label: "Increasing impact" },
    { value: "cert", label: "Certifications" },
  ]

  const receiptTabs = [
    { value: "receipt", label: "Receipt" },
    { value: "compiled", label: "Compiled receipt" },
  ]

  const tabs = isReceiptTemplate ? receiptTabs : reportTabs

  useEffect(() => {
    setActiveTab(isReceiptTemplate ? "receipt" : "about")
  }, [isReceiptTemplate])

  return (
    <div className="w-full rounded-[28px] border border-[#EDEDED] bg-white p-4 sm:p-6 lg:p-8 space-y-6 mt-[20px] min-w-0">
      <div className="w-full overflow-x-auto">
        <div
          className={`min-w-max flex gap-3 bg-[#F6F1FB] p-[10px] rounded-xl lg:min-w-0 lg:grid ${
            isReceiptTemplate ? "lg:grid-cols-2" : "lg:grid-cols-5"
          }`}
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`shrink-0 min-w-[140px] px-3 py-2 rounded-md text-sm text-center lg:min-w-0 lg:w-full ${
                activeTab === tab.value
                  ? "bg-[#4A145F] text-white"
                  : "bg-transparent text-[#1F1F1F]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 sm:p-6 md:py-[32px] md:px-[24px] rounded-[28px] border border-[#EDEDED] min-w-0">
        {activeTab === "cover" && <CoverPageSection />}
        {activeTab === "compiled" && <CompiledReceiptSection />}
        {activeTab === "about" && <AboutSustainabilitySection />}
        {activeTab === "usp" && <UspSection />}
        {activeTab === "receipt" && <ReceiptSection />}
      {activeTab === "impact" && <IncreasingImpactSection />}
      {activeTab === "cert" && <CertificationsSection />}
      {activeTab === "receipt" && (
        <div className="text-sm text-[#747474]">Receipt content will be added here.</div>
      )}
      {activeTab === "compiled" && (
        <div className="text-sm text-[#747474]">Compiled receipt content will be added here.</div>
      )}
     </div>  
    </div>
  )
}