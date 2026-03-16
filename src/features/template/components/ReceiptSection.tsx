"use client"

import { useCallback, useMemo, useState } from "react"
import { PageType, type TemplatePageContentDto } from "@/store/services/templatesApi"
import { useUploadTemplateImageMutation } from "@/store/services/templatesApi"
import { FileDropZone } from "@/features/report-generation/components/FileDropZone"
import { parseContentJson, type ReceiptContent } from "../types"
import { RichTextEditor } from "./RichTextEditor"

interface ReceiptFieldMap {
  bgImage: string
  header: string
  descText: string
  text1?: string
  text2?: string
}

const RECEIPT_TYPES: { label: string; pageType: PageType; fields: ReceiptFieldMap }[] = [
  {
    label: "Rainforest alliance receipt",
    pageType: PageType.ReceiptRAC,
    fields: {
      bgImage: "receipt_bg_image",
      header: "receipt_header",
      descText: "receipt_desc_text",
      text1: "receipt_text_1",
      text2: "receipt_text_2",
    },
  },
  {
    label: "CO2 receipt",
    pageType: PageType.ReceiptCO2,
    fields: {
      bgImage: "receipt_co2_bg_image",
      header: "receipt_co2_header",
      descText: "receipt_co2_desc_text",
    },
  },
  {
    label: "Fairtrade receipt",
    pageType: PageType.ReceiptFairtrade,
    fields: {
      bgImage: "receipt_ft_bg_image",
      header: "receipt_ft_header",
      descText: "receipt_ft_desc_text",
    },
  },
  {
    label: "Organic receipt",
    pageType: PageType.ReceiptOrganic,
    fields: {
      bgImage: "receipt_org_bg_image",
      header: "receipt_org_header",
      descText: "receipt_org_desc_text",
    },
  },
]

const DEFAULT_CONTENT: ReceiptContent = {}

interface ReceiptSectionProps {
  pages?: TemplatePageContentDto[]
  onPageChange?: (templatePageId: string, json: string) => void
}

export default function ReceiptSection({ pages = [], onPageChange }: ReceiptSectionProps) {
  const [localEdits, setLocalEdits] = useState<Record<number, ReceiptContent>>({})
  const [imageFiles, setImageFiles] = useState<Record<number, File | null>>({})
  const [uploadImage] = useUploadTemplateImageMutation()

  const receiptData = useMemo(
    () =>
      RECEIPT_TYPES.map(({ label, pageType, fields }, idx) => {
        const page = pages.find((p) => p.pageType === pageType)
        const content = page
          ? parseContentJson<ReceiptContent>(page.contentJson, DEFAULT_CONTENT)
          : (localEdits[idx] ?? DEFAULT_CONTENT)
        return { label, pageType, fields, page, content, idx }
      }),
    [pages, localEdits]
  )

  const emitChange = useCallback(
    (page: TemplatePageContentDto | undefined, updated: ReceiptContent, idx: number) => {
      if (page && onPageChange) {
        onPageChange(page.templatePageId, JSON.stringify(updated))
      } else {
        setLocalEdits((prev) => ({ ...prev, [idx]: updated }))
      }
    },
    [onPageChange]
  )

  const updateField = (
    page: TemplatePageContentDto | undefined,
    content: ReceiptContent,
    fieldName: string,
    value: string,
    idx: number
  ) => {
    const updated = { ...content, [fieldName]: value }
    emitChange(page, updated, idx)
  }

  const handleImageChange = useCallback(
    async (idx: number, page: TemplatePageContentDto | undefined, content: ReceiptContent, bgField: string, file: File | null) => {
      setImageFiles((prev) => ({ ...prev, [idx]: file }))
      if (!file) {
        emitChange(page, { ...content, [bgField]: undefined }, idx)
        return
      }
      try {
        const result = await uploadImage({ file }).unwrap()
        emitChange(page, { ...content, [bgField]: result.url }, idx)
      } catch {
        setImageFiles((prev) => ({ ...prev, [idx]: null }))
      }
    },
    [uploadImage, emitChange]
  )

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

        {receiptData.map(({ label, fields, content, page, idx }) => (
          <div
            key={idx}
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

              <FileDropZone
                accept=".jpg,.jpeg,.png,.svg,.webp"
                acceptLabel="Recommended size: 1920x1080px, Max 2MB, JPG/PNG/SVG"
                file={imageFiles[idx] || null}
                previewUrl={content[fields.bgImage] as string | undefined}
                onFileChange={(file) => handleImageChange(idx, page, content, fields.bgImage, file)}
                className="h-[110px]"
              />
            </div>

            {/* HEADER */}
            <div>
              <p className="text-sm mb-2">
                Header text
              </p>

              <input
                placeholder="Enter header text"
                value={(content[fields.header] as string) ?? ""}
                onChange={(e) => updateField(page, content, fields.header, e.target.value, idx)}
                className="w-full min-w-0 h-[40px] rounded-full border border-[#EDEDED] px-4 text-sm"
              />
            </div>

            {/* DESC TEXT */}
            <div>
              <p className="text-sm mb-2">
                Description text
              </p>

              <RichTextEditor
                value={(content[fields.descText] as string) ?? ""}
                onChange={(html) => updateField(page, content, fields.descText, html, idx)}
                placeholder="Enter description text"
                className="h-[110px]"
              />
            </div>

            {/* ADDITIONAL TEXT BOXES (RAC only) */}
            {(fields.text1 || fields.text2) && (
              <div className="grid lg:grid-cols-2 gap-8">

                {fields.text1 && (
                  <div className="min-w-0">
                    <p className="text-sm mb-2">
                      Receipt text box 1
                    </p>

                    <RichTextEditor
                      value={(content[fields.text1] as string) ?? ""}
                      onChange={(html) => updateField(page, content, fields.text1!, html, idx)}
                      placeholder="Enter section text"
                      className="h-[110px]"
                    />
                  </div>
                )}

                {fields.text2 && (
                  <div className="min-w-0">
                    <p className="text-sm mb-2">
                      Receipt text box 2
                    </p>

                    <RichTextEditor
                      value={(content[fields.text2] as string) ?? ""}
                      onChange={(html) => updateField(page, content, fields.text2!, html, idx)}
                      placeholder="Enter section text"
                      className="h-[110px]"
                    />
                  </div>
                )}

              </div>
            )}

            {/* INFO TEXT */}
            <p className="text-xs text-[#7B3EBE]">
              Based on retrieved values. Keep placeholders like {"{Time period}"}, {"{Cups count}"} in the text
            </p>

          </div>
        ))}

      </div>

    </div>
  )
}
