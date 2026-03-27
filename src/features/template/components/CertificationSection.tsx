"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { parseContentJson, type CertificationsContent } from "../types"
import { RichTextEditor } from "./RichTextEditor"
import { FileDropZone } from "@/features/report-generation/components/FileDropZone"
import { useUploadTemplateImageMutation } from "@/store/services/templatesApi"

const CERT_BLOCKS = [
  { key: "general", label: "General" },
  { key: "rainforest", label: "Rainforest Alliance" },
  { key: "fairtrade", label: "Fairtrade" },
  { key: "organic", label: "Organic" },
] as const

type CertKey = (typeof CERT_BLOCKS)[number]["key"]
type ImageField = `cert_${CertKey}_image` | `cert_${CertKey}_logo`
type TextField = `cert_${CertKey}_header` | `cert_${CertKey}_text`

const DEFAULT_CONTENT: CertificationsContent = {
  headerText: "",
  cert_general_header: "",
  cert_general_text: "",
  cert_rainforest_header: "",
  cert_rainforest_text: "",
  cert_fairtrade_header: "",
  cert_fairtrade_text: "",
  cert_organic_header: "",
  cert_organic_text: "",
}

interface CertificationsSectionProps {
  contentJson?: string | null
  onChange?: (json: string) => void
}

export default function CertificationsSection({
  contentJson,
  onChange,
}: CertificationsSectionProps) {
  const [localContent, setLocalContent] = useState(DEFAULT_CONTENT)
  const [imageFiles, setImageFiles] = useState<Record<string, File | null>>({})
  const [uploadImage] = useUploadTemplateImageMutation()

  const parsed = useMemo(
    () => contentJson ? parseContentJson<CertificationsContent>(contentJson, DEFAULT_CONTENT) : localContent,
    [contentJson, localContent]
  )

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const parsedRef = useRef(parsed)
  parsedRef.current = parsed

  const emitChange = useCallback((data: CertificationsContent) => {
    if (onChangeRef.current) {
      onChangeRef.current(JSON.stringify(data))
    } else {
      setLocalContent(data)
    }
  }, [])

  const updateText = useCallback(
    (field: "headerText" | TextField, value: string) => {
      emitChange({ ...parsedRef.current, [field]: value })
    },
    [emitChange]
  )

  const handleImageChange = useCallback(
    async (field: ImageField, file: File | null) => {
      setImageFiles((prev) => ({ ...prev, [field]: file }))
      if (!file) {
        emitChange({ ...parsedRef.current, [field]: undefined })
        return
      }
      try {
        const result = await uploadImage({ file }).unwrap()
        emitChange({ ...parsedRef.current, [field]: result.url })
      } catch {
        setImageFiles((prev) => ({ ...prev, [field]: null }))
      }
    },
    [uploadImage, emitChange]
  )

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm mb-2">Header Text</p>
        <input
          type="text"
          placeholder="Enter header text"
          value={parsed.headerText}
          onChange={(e) => updateText("headerText", e.target.value)}
          className="w-full min-w-0 h-[44px] rounded-full border border-[#EDEDED] px-5 py-3"
        />
      </div>

      <div className="border-t border-[#EDEDED]" />

      <div className="space-y-6">
        {CERT_BLOCKS.map((cert) => {
          const headerField = `cert_${cert.key}_header` as TextField
          const textField = `cert_${cert.key}_text` as TextField
          const imageField = `cert_${cert.key}_image` as ImageField
          const logoField = `cert_${cert.key}_logo` as ImageField

          return (
            <div
              key={cert.key}
              className="border border-[#EADCF6] rounded-[24px] p-6 space-y-4"
            >
              <p className="text-sm font-medium">{cert.label}</p>

              <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
                <div className="min-w-0">
                  <p className="text-sm mb-2">Certification logo</p>
                  <FileDropZone
                    accept=".jpg,.jpeg,.png,.svg,.webp"
                    acceptLabel="JPG/PNG/SVG"                    file={imageFiles[logoField] ?? null}
                    previewUrl={parsed[logoField]}
                    onFileChange={(file) => handleImageChange(logoField, file)}
                    className="h-[110px]"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm mb-2">Background image</p>
                  <FileDropZone
                    accept=".jpg,.jpeg,.png,.svg,.webp"
                    acceptLabel="JPG/PNG/SVG"                    file={imageFiles[imageField] ?? null}
                    previewUrl={parsed[imageField]}
                    onFileChange={(file) => handleImageChange(imageField, file)}
                    className="h-[110px]"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm mb-2">Header text</p>
                <input
                  placeholder="Enter certification header"
                  value={parsed[headerField] ?? ""}
                  onChange={(e) => updateText(headerField, e.target.value)}
                  className="w-full min-w-0 h-[40px] rounded-full border border-[#EDEDED] px-4 text-sm"
                />
              </div>

              <div>
                <p className="text-sm mb-2">Description text</p>
                <RichTextEditor
                  value={parsed[textField] ?? ""}
                  onChange={(html) => updateText(textField, html)}
                  placeholder="Enter certification description"
                  className="h-[90px]"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
