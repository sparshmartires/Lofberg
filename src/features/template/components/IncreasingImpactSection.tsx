"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { parseContentJson, type IncreasingImpactContent } from "../types"
import { RichTextEditor } from "./RichTextEditor"
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
type TextFieldKey = "headerText" | "introText" | "wantMoreText" | `actionText${ActionIndex}` | `actionName${ActionIndex}`
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
      <div>
        <p className="text-sm mb-2">Header text</p>
        <input
          type="text"
          placeholder="Enter header text"
          value={parsed.headerText}
          onChange={(e) => updateText("headerText", e.target.value)}
          className="w-full min-w-0 h-[44px] rounded-full border border-[#EDEDED] px-5 py-3"
        />
      </div>

      <div>
        <p className="text-sm mb-2">Intro text</p>
        <RichTextEditor
          value={parsed.introText}
          onChange={(html) => updateText("introText", html)}
          placeholder="Enter introduction text"
          className="h-[110px]"
        />
      </div>

      <div className="border-t border-[#EDEDED]" />

      <div className="space-y-6">
        {ACTION_BLOCKS.map((block) => {
          const textField = `actionText${block.index}` as TextFieldKey
          const imageField = `actionImage${block.index}` as ImageFieldKey
          const nameField = `actionName${block.index}` as TextFieldKey
          const currentName = (parsed as unknown as Record<string, string>)[nameField] || block.label

          return (
            <div
              key={block.index}
              className="border border-[#EDEDED] rounded-[24px] p-6 space-y-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{block.index}.</span>
                <input
                  type="text"
                  value={currentName}
                  onChange={(e) => updateText(nameField, e.target.value)}
                  placeholder={block.label}
                  required
                  className="flex-1 h-[36px] rounded-[99px] border border-[#F0F0F0] px-[16px] shadow-[0px_2px_4px_0px_#0000000A] text-sm font-medium"
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
                <div className="min-w-0">
                  <p className="text-sm mb-2">Image</p>
                  <FileDropZone
                    accept=".jpg,.jpeg,.png,.svg,.webp"
                    acceptLabel="JPG/PNG/SVG"                    file={imageFiles[imageField] ?? null}
                    previewUrl={parsed[imageField]}
                    onFileChange={(file) => handleImageChange(imageField, file)}
                    className="h-[110px]"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm mb-2">Text</p>
                  <RichTextEditor
                    value={parsed[textField] ?? ""}
                    onChange={(html) => updateText(textField, html)}
                    placeholder="Enter section text"
                    className="h-[110px]"
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
        <RichTextEditor
          value={parsed.wantMoreText}
          onChange={(html) => updateText("wantMoreText", html)}
          placeholder="Enter 'want to know more' text"
          className="h-[90px]"
        />
      </div>
    </div>
  )
}
