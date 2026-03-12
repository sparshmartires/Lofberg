"use client"

import { useMemo, useState } from "react"
import { Upload } from "lucide-react"
import { PageType, type TemplatePageContentDto } from "@/store/services/templatesApi"
import { parseContentJson, type ReceiptContent } from "../types"

const DEFAULT_CONTENT: ReceiptContent = {
  textBox1: "",
  textBox2: "",
}

const RECEIPT_TYPES: { label: string; pageType: PageType }[] = [
  { label: "Organic receipt", pageType: PageType.ReceiptOrganic },
  { label: "Fairtrade receipt", pageType: PageType.ReceiptFairtrade },
  { label: "Rainforest alliance receipt", pageType: PageType.ReceiptRAC },
  { label: "CO2 receipt", pageType: PageType.ReceiptCO2 },
]

interface ReceiptSectionProps {
  pages?: TemplatePageContentDto[]
  onPageChange?: (templatePageId: string, json: string) => void
}

export default function ReceiptSection({ pages = [], onPageChange }: ReceiptSectionProps) {
  const [localEdits, setLocalEdits] = useState<Record<number, ReceiptContent>>({})

  const receiptData = useMemo(
    () =>
      RECEIPT_TYPES.map(({ label, pageType }, idx) => {
        const page = pages.find((p) => p.pageType === pageType)
        const content = page
          ? parseContentJson<ReceiptContent>(page.contentJson, DEFAULT_CONTENT)
          : (localEdits[idx] ?? DEFAULT_CONTENT)
        return { label, pageType, page, content, idx }
      }),
    [pages, localEdits]
  )

  const updateReceipt = (
    page: TemplatePageContentDto | undefined,
    content: ReceiptContent,
    field: "textBox1" | "textBox2",
    value: string,
    idx: number
  ) => {
    const updated = { ...content, [field]: value }
    if (page && onPageChange) {
      onPageChange(page.templatePageId, JSON.stringify(updated))
    } else {
      setLocalEdits((prev) => ({ ...prev, [idx]: updated }))
    }
  }

  return (
    <div className="space-y-8">

      {/* SECTION HEADER */}
      <div>
        <p className="text-sm font-medium">
          Receipt section
        </p>

        <p className="text-xs text-[#8A8A8A]">
          Configure individual receipt pages for each certification type
        </p>
      </div>

      {/* RECEIPT TYPES */}
      <div className="space-y-6">

        {receiptData.map(({ label, content, page, idx }, index) => (
          <div
            key={index}
            className="border border-[#EADCF6] rounded-[24px] p-6 space-y-6"
          >

            {/* TITLE */}
            <p className="text-sm font-medium">
              {label}
            </p>

            {/* BACKGROUND IMAGE */}
            <div>
              <p className="text-sm mb-2">
                Background image
              </p>

              <div className="w-full min-w-0 h-[110px] border-2 border-dashed border-[#D8B4F8] rounded-xl flex flex-col items-center justify-center gap-2">
                <Upload className="text-[#5B2D91]" />

                <p className="text-sm text-[#4E4E4E]">
                  Upload a file or drag and drop
                </p>
              </div>
            </div>

            {/* TEXT BOXES */}
            <div className="grid lg:grid-cols-2 gap-8">

              <div className="min-w-0">
                <p className="text-sm mb-2">
                  Receipt text box 1
                </p>

                <textarea
                  placeholder="Enter section text"
                  value={content.textBox1}
                  onChange={(e) => updateReceipt(page, content, "textBox1", e.target.value, idx)}
                  className="w-full min-w-0 h-[110px] rounded-xl border border-[#EDEDED] p-3 resize-none"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm mb-2">
                  Receipt text box 2
                </p>

                <textarea
                  placeholder="Enter section text"
                  value={content.textBox2}
                  onChange={(e) => updateReceipt(page, content, "textBox2", e.target.value, idx)}
                  className="w-full min-w-0 h-[110px] rounded-xl border border-[#EDEDED] p-3 resize-none"
                />
              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}
