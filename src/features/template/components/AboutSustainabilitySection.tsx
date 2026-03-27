"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { parseContentJson, type AboutSustainabilityContent } from "../types"
import { RichTextEditor } from "./RichTextEditor"
import { FileDropZone } from "@/features/report-generation/components/FileDropZone"
import { useUploadTemplateImageMutation } from "@/store/services/templatesApi"

const RIGHT_BLOCKS = [
  { index: 1, label: "Block 1 (Icon + Textblock1 (right))" },
  { index: 2, label: "Block 2 (Icon + Textblock 2 (right))" },
] as const

const BOTTOM_BLOCKS = [
  { index: 3, label: "Block 3 (Icon + Textblock3 (bottom left))" },
  { index: 4, label: "Block 4 (Icon + Textblock 4 (bottom right))" },
] as const

const ALL_BLOCKS = [...RIGHT_BLOCKS, ...BOTTOM_BLOCKS] as const

type BlockIndex = (typeof ALL_BLOCKS)[number]["index"]
type ImageField = "intro_hero_image" | "intro_circle_image" | `intro_icon_${BlockIndex}`
type TextField = "headerText" | "introText" | `intro_textblock_${BlockIndex}`

const DEFAULT_CONTENT: AboutSustainabilityContent = {
  headerText: "",
  introText: "",
  intro_textblock_1: "",
  intro_textblock_2: "",
  intro_textblock_3: "",
  intro_textblock_4: "",
}

interface AboutSustainabilitySectionProps {
  contentJson?: string | null
  onChange?: (json: string) => void
}

export default function AboutSustainabilitySection({
  contentJson,
  onChange,
}: AboutSustainabilitySectionProps) {
  const [localContent, setLocalContent] = useState(DEFAULT_CONTENT)
  const [imageFiles, setImageFiles] = useState<Record<string, File | null>>({})
  const [uploadImage] = useUploadTemplateImageMutation()

  const parsed = useMemo(
    () => contentJson ? parseContentJson<AboutSustainabilityContent>(contentJson, DEFAULT_CONTENT) : localContent,
    [contentJson, localContent]
  )

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const parsedRef = useRef(parsed)
  parsedRef.current = parsed

  const emitChange = useCallback((data: AboutSustainabilityContent) => {
    if (onChangeRef.current) {
      onChangeRef.current(JSON.stringify(data))
    } else {
      setLocalContent(data)
    }
  }, [])

  const updateText = useCallback(
    (field: TextField, value: string) => {
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
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
        <div className="min-w-0">
          <p className="text-sm mb-2">Banner image</p>
          <FileDropZone
            accept=".jpg,.jpeg,.png,.svg,.webp"
            acceptLabel="Recommended size: 1920x1080px, JPG/PNG/SVG"            file={imageFiles["intro_hero_image"] ?? null}
            previewUrl={parsed.intro_hero_image}
            onFileChange={(file) => handleImageChange("intro_hero_image", file)}
            className="h-[125px]"
          />
        </div>

        <div className="min-w-0">
          <p className="text-sm mb-2">Header text</p>
          <input
            type="text"
            placeholder="Enter header text"
            value={parsed.headerText}
            onChange={(e) => updateText("headerText", e.target.value)}
            className="w-full min-w-0 h-[44px] rounded-full border border-[#EDEDED] px-5 py-3"
          />
        </div>

        <div className="min-w-0">
          <p className="text-sm mb-2">Circle image</p>
          <FileDropZone
            accept=".jpg,.jpeg,.png,.svg,.webp"
            acceptLabel="Recommended size: 800x800px, JPG/PNG/SVG"            file={imageFiles["intro_circle_image"] ?? null}
            previewUrl={parsed.intro_circle_image}
            onFileChange={(file) => handleImageChange("intro_circle_image", file)}
            className="h-[125px]"
          />
        </div>

        <div className="min-w-0">
          <p className="text-sm mb-2">Intro text</p>
          <RichTextEditor
            value={parsed.introText}
            onChange={(html) => updateText("introText", html)}
            placeholder="Enter introduction text"
            className="h-[125px]"
          />
        </div>
      </div>

      <div className="border-t border-[#EDEDED]" />

      <p className="text-sm font-medium text-[#8A8A8A]">Right-side blocks</p>
      <div className="space-y-6">
        {RIGHT_BLOCKS.map((block) => {
          const iconField = `intro_icon_${block.index}` as ImageField
          const textField = `intro_textblock_${block.index}` as TextField

          return (
            <div
              key={block.index}
              className="border border-[#EDEDED] rounded-[24px] p-6 space-y-4"
            >
              <p className="text-sm font-medium">{block.label}</p>

              <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
                <div className="min-w-0">
                  <p className="text-sm mb-2">Image</p>
                  <FileDropZone
                    accept=".jpg,.jpeg,.png,.svg,.webp"
                    acceptLabel="JPG/PNG/SVG"                    file={imageFiles[iconField] ?? null}
                    previewUrl={parsed[iconField]}
                    onFileChange={(file) => handleImageChange(iconField, file)}
                    className="h-[110px]"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm mb-2">Text</p>
                  <RichTextEditor
                    value={parsed[textField] ?? ""}
                    onChange={(html) => updateText(textField, html)}
                    placeholder="Enter text content"
                    className="h-[110px]"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-[#EDEDED]" />

      <p className="text-sm font-medium text-[#8A8A8A]">Bottom blocks</p>
      <div className="space-y-6">
        {BOTTOM_BLOCKS.map((block) => {
          const iconField = `intro_icon_${block.index}` as ImageField
          const textField = `intro_textblock_${block.index}` as TextField

          return (
            <div
              key={block.index}
              className="border border-[#EDEDED] rounded-[24px] p-6 space-y-4"
            >
              <p className="text-sm font-medium">{block.label}</p>

              <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
                <div className="min-w-0">
                  <p className="text-sm mb-2">Image</p>
                  <FileDropZone
                    accept=".jpg,.jpeg,.png,.svg,.webp"
                    acceptLabel="JPG/PNG/SVG"                    file={imageFiles[iconField] ?? null}
                    previewUrl={parsed[iconField]}
                    onFileChange={(file) => handleImageChange(iconField, file)}
                    className="h-[110px]"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm mb-2">Text</p>
                  <RichTextEditor
                    value={parsed[textField] ?? ""}
                    onChange={(html) => updateText(textField, html)}
                    placeholder="Enter text content"
                    className="h-[110px]"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
