"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { parseContentJson, type IncreasingImpactContent } from "../types"
import { FileDropZone } from "@/features/report-generation/components/FileDropZone"
import { useUploadTemplateImageMutation } from "@/store/services/templatesApi"

const ACTION_BLOCKS = [
  { index: 1, label: "Water conservation" },
  { index: 2, label: "Fair wages" },
  { index: 3, label: "Biodiversity protection" },
  { index: 4, label: "Community development" },
  { index: 5, label: "Sustainable farming" },
  { index: 6, label: "Climate action" },
  { index: 7, label: "Educational programs" },
  { index: 8, label: "Health & safety" },
  { index: 9, label: "Women empowerment" },
  { index: 10, label: "Forest protection" },
] as const

type ActionIndex = (typeof ACTION_BLOCKS)[number]["index"]
type TextFieldKey = "headerText" | "introText" | "wantMoreText" | `actionText${ActionIndex}`
type ImageFieldKey = `actionImage${ActionIndex}`

const DEFAULT_CONTENT: IncreasingImpactContent = {
  headerText: "",
  introText: "",
  wantMoreText: "",
  actionText1: "",
  actionText2: "",
  actionText3: "",
  actionText4: "",
  actionText5: "",
  actionText6: "",
  actionText7: "",
  actionText8: "",
  actionText9: "",
  actionText10: "",
}

interface IncreasingImpactSectionProps {
  contentJson?: string | null
  onChange?: (json: string) => void
}

export default function IncreasingImpactSection({
  contentJson,
  onChange,
}: IncreasingImpactSectionProps) {
  const [localContent, setLocalContent] = useState(DEFAULT_CONTENT)
  const [imageFiles, setImageFiles] = useState<Record<string, File | null>>({})
  const [uploadImage] = useUploadTemplateImageMutation()

  const parsed = useMemo(
    () => contentJson ? parseContentJson<IncreasingImpactContent>(contentJson, DEFAULT_CONTENT) : localContent,
    [contentJson, localContent]
  )

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const parsedRef = useRef(parsed)
  parsedRef.current = parsed

  const emitChange = useCallback((data: IncreasingImpactContent) => {
    if (onChangeRef.current) {
      onChangeRef.current(JSON.stringify(data))
    } else {
      setLocalContent(data)
    }
  }, [])

  const updateText = useCallback(
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

  return (
    <div className="space-y-8">
      <h3 className="font-sans font-normal text-[16px] leading-[24px] tracking-[0]">
        Increasing positive impact section
      </h3>

      <div>
        <p className="text-sm mb-2">Header text</p>
        <textarea
          placeholder="Enter header text"
          value={parsed.headerText}
          onChange={(e) => updateText("headerText", e.target.value)}
          className="w-full min-w-0 h-[90px] rounded-xl border border-[#EDEDED] p-3 resize-none"
        />
      </div>

      <div>
        <p className="text-sm mb-2">Intro text</p>
        <textarea
          placeholder="Enter introduction text"
          value={parsed.introText}
          onChange={(e) => updateText("introText", e.target.value)}
          className="w-full min-w-0 h-[110px] rounded-xl border border-[#EDEDED] p-3 resize-none"
        />
      </div>

      <div className="border-t border-[#EDEDED]" />

      <div>
        <p className="text-sm font-medium">
          Report / Receipt template
        </p>
        <p className="text-xs text-[#8A8A8A]">
          Configure the 10 impact action blocks. Users select up to 3 during report generation.
        </p>
      </div>

      <div className="space-y-6">
        {ACTION_BLOCKS.map((block) => {
          const textField = `actionText${block.index}` as TextFieldKey
          const imageField = `actionImage${block.index}` as ImageFieldKey

          return (
            <div
              key={block.index}
              className="border border-[#EDEDED] rounded-[24px] p-6 space-y-4"
            >
              <p className="text-sm font-medium">
                {block.index}. {block.label}
              </p>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="min-w-0">
                  <p className="text-sm mb-2">Section image</p>
                  <FileDropZone
                    accept=".jpg,.jpeg,.png,.svg,.webp"
                    acceptLabel="Max 2MB, JPG/PNG/SVG"
                    file={imageFiles[imageField] ?? null}
                    previewUrl={parsed[imageField]}
                    onFileChange={(file) => handleImageChange(imageField, file)}
                    className="h-[110px]"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm mb-2">Section text</p>
                  <textarea
                    placeholder="Enter section text"
                    value={parsed[textField] ?? ""}
                    onChange={(e) => updateText(textField, e.target.value)}
                    className="w-full min-w-0 h-[110px] rounded-xl border border-[#EDEDED] p-3 resize-none"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-[#EDEDED]" />

      <div>
        <p className="text-sm mb-2">Want to know more text</p>
        <textarea
          placeholder="Enter 'want to know more' text"
          value={parsed.wantMoreText}
          onChange={(e) => updateText("wantMoreText", e.target.value)}
          className="w-full min-w-0 h-[90px] rounded-xl border border-[#EDEDED] p-3 resize-none"
        />
      </div>
    </div>
  )
}
