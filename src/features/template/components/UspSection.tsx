"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { parseContentJson, type UspContent } from "../types"
import { RichTextEditor } from "./RichTextEditor"
import { FileDropZone } from "@/features/report-generation/components/FileDropZone"
import { useUploadTemplateImageMutation } from "@/store/services/templatesApi"

const DEFAULT_CONTENT: UspContent = {
  headerText: "",
  introText: "",
  sectionText1: "",
  sectionText2: "",
  sectionText3: "",
}

type TextFieldKey = "headerText" | "introText" | "sectionText1" | "sectionText2" | "sectionText3"
type ImageFieldKey = "sectionImage1" | "sectionImage2" | "sectionImage3"

interface UspSectionProps {
  contentJson?: string | null
  onChange?: (json: string) => void
}

export default function UspSection({ contentJson, onChange }: UspSectionProps) {
  const [localContent, setLocalContent] = useState(DEFAULT_CONTENT)
  const [imageFiles, setImageFiles] = useState<Record<ImageFieldKey, File | null>>({
    sectionImage1: null,
    sectionImage2: null,
    sectionImage3: null,
  })
  const [uploadImage] = useUploadTemplateImageMutation()

  const parsed = useMemo(
    () => contentJson ? parseContentJson<UspContent>(contentJson, DEFAULT_CONTENT) : localContent,
    [contentJson, localContent]
  )

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const parsedRef = useRef(parsed)
  parsedRef.current = parsed

  const emitChange = useCallback((data: UspContent) => {
    if (onChangeRef.current) {
      onChangeRef.current(JSON.stringify(data))
    } else {
      setLocalContent(data)
    }
  }, [])

  const updateField = useCallback(
    (field: TextFieldKey, value: string) => {
      emitChange({ ...parsedRef.current, [field]: value })
    },
    [emitChange]
  )

  const handleImageChange = useCallback(
    async (field: ImageFieldKey, file: File | null) => {
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

  const sections: { label: string; textKey: TextFieldKey; imageKey: ImageFieldKey }[] = [
    { label: "USP sections (up to 3)", textKey: "sectionText1", imageKey: "sectionImage1" },
    { label: "Section 2", textKey: "sectionText2", imageKey: "sectionImage2" },
    { label: "Section 3", textKey: "sectionText3", imageKey: "sectionImage3" },
  ]

  return (
    <div className="space-y-8">
      <h3 className="font-sans font-normal text-[16px] leading-[24px] tracking-[0]">
        Lofbers USP&apos;s section
      </h3>

      <div>
        <p className="text-sm mb-2">Header text</p>
        <textarea
          placeholder="Enter header text"
          value={parsed.headerText}
          onChange={(e) => updateField("headerText", e.target.value)}
          className="w-full min-w-0 h-[90px] rounded-xl border border-[#EDEDED] p-3 resize-none"
        />
      </div>

      <div>
        <p className="text-sm mb-2">Intro text</p>
        <RichTextEditor
          value={parsed.introText}
          onChange={(html) => updateField("introText", html)}
          placeholder="Enter introduction text"
          className="h-[110px]"
        />
      </div>

      <div className="border-t border-[#EDEDED]" />

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.textKey} className="border border-[#EDEDED] rounded-[24px] p-6 space-y-4">
            <p className="text-sm font-medium">{section.label}</p>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="min-w-0">
                <p className="text-sm mb-2">Section image</p>

                <FileDropZone
                  accept=".jpg,.jpeg,.png,.svg,.webp"
                  acceptLabel="Max 2MB, JPG/PNG/SVG"
                  file={imageFiles[section.imageKey]}
                  previewUrl={parsed[section.imageKey]}
                  onFileChange={(file) => handleImageChange(section.imageKey, file)}
                  className="h-[120px]"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm mb-2">Section text</p>

                <RichTextEditor
                  value={parsed[section.textKey]}
                  onChange={(html) => updateField(section.textKey, html)}
                  placeholder="Enter section text"
                  className="h-[120px]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
