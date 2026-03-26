"use client"

import { useEffect, useState } from "react"
import { PageType, type TemplatePageContentDto } from "@/store/services/templatesApi"
import IncreasingImpactSection from "./IncreasingImpactSection"
import CertificationsSection from "./CertificationSection"
import CoverPageSection from "./CoverPageSection"
import AboutSustainabilitySection from "./AboutSustainabilitySection"
import UspSection from "./UspSection"
import ReceiptSection from "./ReceiptSection"
import CompiledReceiptSection from "./CompiledReceiptSection"

interface SustainabilitySectionProps {
  templateType: string
  pages?: TemplatePageContentDto[]
  onPageChange?: (templatePageId: string, contentJson: string) => void
}

export default function SustainabilitySection({
  templateType,
  pages = [],
  onPageChange,
}: SustainabilitySectionProps) {
  const isReceiptTemplate = templateType === "receipt"

  const [activeTab, setActiveTab] = useState(isReceiptTemplate ? "receipt" : "cover")

  const reportTabs = [
    { value: "cover", label: "Cover page" },
    { value: "about", label: "About sustainability" },
    { value: "usp", label: "Löfbergs USPs" },
    { value: "impact", label: "Increasing impact" },
    { value: "cert", label: "Certifications" },
  ]

  const receiptTabs = [
    { value: "receipt", label: "Receipt" },
    { value: "compiled", label: "Compiled receipt" },
  ]

  const tabs = isReceiptTemplate ? receiptTabs : reportTabs

  useEffect(() => {
    setActiveTab(isReceiptTemplate ? "receipt" : "cover")
  }, [isReceiptTemplate])

  const getPage = (pageType: PageType) => pages.find((p) => p.pageType === pageType)

  const makeSectionProps = (pageType: PageType) => {
    const page = getPage(pageType)
    if (!page || !onPageChange) return {}
    return {
      contentJson: page.contentJson,
      onChange: (json: string) => onPageChange(page.templatePageId, json),
    }
  }

  const receiptPages = [
    getPage(PageType.ReceiptOrganic),
    getPage(PageType.ReceiptFairtrade),
    getPage(PageType.ReceiptRAC),
    getPage(PageType.ReceiptCO2),
  ].filter((p): p is TemplatePageContentDto => p !== undefined)

  return (
    <div className="w-full rounded-[28px] border border-[#EDEDED] bg-white p-4 sm:p-6 lg:p-8 space-y-6 mt-[20px] min-w-0">
      <p className="text-[10px] text-[#747474]">
        Available placeholders: {"{Time period}"}, {"{Quantity}"}, {"{Area}"}, {"{CO2 in KG}"}, {"{CO2 in equivalent units}"}, {"{EUR FT Cooperative Premium}"}, {"{EUR FT Organic Income}"}, {"{NOK FT Cooperative Premium}"}, {"{NOK FT Organic Income}"}
      </p>
      <div className={`w-full ${isReceiptTemplate ? "overflow-x-hidden" : "overflow-x-auto"}`}>
        <div
          className={`${
            isReceiptTemplate
              ? "w-full grid grid-cols-2"
              : "min-w-max flex lg:min-w-0 lg:grid lg:grid-cols-5"
          } gap-3 bg-[#F6F1FB] p-[10px] rounded-xl ${
            isReceiptTemplate ? "lg:grid-cols-2" : ""
          }`}
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-2 rounded-md text-sm text-center whitespace-nowrap lg:min-w-0 lg:w-full ${
                isReceiptTemplate ? "w-full min-w-0" : "shrink-0 min-w-[140px]"
              } ${
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
        {/* Render all sections but hide inactive ones to preserve local state across tab switches */}
        {!isReceiptTemplate && (
          <>
            <div style={{ display: activeTab === "cover" ? "block" : "none" }}>
              <CoverPageSection {...makeSectionProps(PageType.CoverPage)} />
            </div>
            <div style={{ display: activeTab === "about" ? "block" : "none" }}>
              <AboutSustainabilitySection {...makeSectionProps(PageType.AboutSustainability)} />
            </div>
            <div style={{ display: activeTab === "usp" ? "block" : "none" }}>
              <UspSection {...makeSectionProps(PageType.LofbergsUSPs)} />
            </div>
            <div style={{ display: activeTab === "impact" ? "block" : "none" }}>
              <IncreasingImpactSection {...makeSectionProps(PageType.IncreasingPositiveImpact)} />
            </div>
            <div style={{ display: activeTab === "cert" ? "block" : "none" }}>
              <CertificationsSection {...makeSectionProps(PageType.CertificationsOverview)} />
            </div>
          </>
        )}
        {isReceiptTemplate && (
          <>
            <div style={{ display: activeTab === "receipt" ? "block" : "none" }}>
              <ReceiptSection pages={receiptPages} onPageChange={onPageChange} />
            </div>
            <div style={{ display: activeTab === "compiled" ? "block" : "none" }}>
              <CompiledReceiptSection {...makeSectionProps(PageType.CompiledReceiptSummary)} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
