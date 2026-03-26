"use client"

import { useCallback, useMemo, useState } from "react"
import { parseContentJson, type CompiledReceiptContent } from "../types"
import { RichTextEditor } from "./RichTextEditor"
import { FileDropZone } from "@/features/report-generation/components/FileDropZone"
import { useUploadTemplateImageMutation } from "@/store/services/templatesApi"

const DEFAULT_CONTENT: CompiledReceiptContent = {
  receipt_comp_header: "",
  receipt_comp_desc_text: "",
}

const BOX_FIELDS = [
  { iconKey: "receipt_comp_icon_1" as const, nameKey: "receipt_comp_section_name_1" as const, label: "1" },
  { iconKey: "receipt_comp_icon_2" as const, nameKey: "receipt_comp_section_name_2" as const, label: "2" },
  { iconKey: "receipt_comp_icon_3" as const, nameKey: "receipt_comp_section_name_3" as const, label: "3" },
]

interface CompiledReceiptSectionProps {
  contentJson?: string | null
  onChange?: (json: string) => void
}

export default function CompiledReceiptSection({
  contentJson,
  onChange,
}: CompiledReceiptSectionProps) {
  const [localContent, setLocalContent] = useState(DEFAULT_CONTENT)
  const [imageFiles, setImageFiles] = useState<Record<string, File | null>>({})
  const [uploadImage] = useUploadTemplateImageMutation()

  const parsed = useMemo(
    () => contentJson ? parseContentJson<CompiledReceiptContent>(contentJson, DEFAULT_CONTENT) : localContent,
    [contentJson, localContent]
  )

  const emit = (data: CompiledReceiptContent) => {
    if (onChange) {
      onChange(JSON.stringify(data))
    } else {
      setLocalContent(data)
    }
  }

  const updateField = (field: keyof CompiledReceiptContent, value: string) => {
    emit({ ...parsed, [field]: value })
  }

  const handleImageChange = useCallback(
    async (iconKey: string, file: File | null) => {
      setImageFiles((prev) => ({ ...prev, [iconKey]: file }))
      if (!file) {
        emit({ ...parsed, [iconKey]: undefined })
        return
      }
      try {
        const result = await uploadImage({ file }).unwrap()
        emit({ ...parsed, [iconKey]: result.url })
      } catch {
        setImageFiles((prev) => ({ ...prev, [iconKey]: null }))
      }
    },
    [uploadImage, parsed, emit]
  )

  return (
    <div className="space-y-8 mt-6">

      {/* SECTION HEADER */}
      <div>
        <p className="text-sm font-medium">
          Compiled receipt section
        </p>

        <p className="text-xs text-[#8A8A8A]">
          Configure the compiled receipt that combines all certification data into one receipt page
        </p>
      </div>

      {/* HEADER + DESC TEXT */}
      <div className="grid lg:grid-cols-2 gap-8">

        <div className="min-w-0">
          <p className="text-sm mb-2">Header text</p>

          <input
            placeholder="Enter header text"
            value={parsed.receipt_comp_header}
            onChange={(e) => updateField("receipt_comp_header", e.target.value)}
            className="w-full min-w-0 h-[40px] rounded-full border border-[#EDEDED] px-4 text-sm"
          />
        </div>

        <div className="min-w-0">
          <p className="text-sm mb-2">Description text</p>

          <RichTextEditor
            value={parsed.receipt_comp_desc_text}
            onChange={(html) => updateField("receipt_comp_desc_text", html)}
            placeholder="Enter description text"
            className="h-[90px]"
          />

          <p className="text-xs text-[#9CA3AF] mt-1">
            Available placeholders: {"{Time period}"}, {"{Quantity}"}, {"{Area}"},{" "}
            {"{CO2 in KG}"}, {"{CO2 in equivalent units}"},{" "}
            {"{EUR FT Cooperative Premium}"}, {"{EUR FT Organic Income}"}
          </p>
        </div>

      </div>

      {/* CERTIFICATION BOXES */}
      <div>
        <p className="text-sm font-medium">
          Certification icon boxes (1 min – 3 max)
        </p>

        <p className="text-xs text-[#8A8A8A] mb-4">
          Configure icons for each certification row. Text values are populated dynamically during report generation.
        </p>
      </div>

      <div className="space-y-6">

        {BOX_FIELDS.map(({ iconKey, nameKey, label }) => (
          <div
            key={iconKey}
            className="border border-[#EADCF6] rounded-[24px] p-6 space-y-4"
          >

            <p className="text-sm font-medium">
              Certification row {label}
            </p>

            {/* SECTION NAME */}
            <div>
              <p className="text-sm mb-2">
                Section name (for report creation)
              </p>

              <input
                placeholder="Eg. Organic impact"
                value={parsed[nameKey] ?? ""}
                onChange={(e) => updateField(nameKey, e.target.value)}
                className="w-full min-w-0 h-[40px] rounded-full border border-[#EDEDED] px-4 text-sm"
              />
            </div>

            {/* ICON IMAGE */}
            <div className="min-w-0">
              <p className="text-sm mb-2">
                Section icon
              </p>

              <FileDropZone
                accept=".jpg,.jpeg,.png,.svg,.webp"
                acceptLabel="Recommended size: 1920x1080px, JPG/PNG/SVG"                file={imageFiles[iconKey] || null}
                previewUrl={parsed[iconKey]}
                onFileChange={(file) => handleImageChange(iconKey, file)}
                className="h-[110px]"
              />
            </div>

            {/* INFO TEXT */}
            <p className="text-xs text-[#7B3EBE]">
              Row text is populated dynamically from certification data during report generation
            </p>

          </div>
        ))}

      </div>

    </div>
  )
}
