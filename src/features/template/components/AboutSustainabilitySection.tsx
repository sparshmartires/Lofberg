"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { parseContentJson, type AboutSustainabilityContent } from "../types"
import { FileDropZone } from "@/features/report-generation/components/FileDropZone"
import { useUploadTemplateImageMutation } from "@/store/services/templatesApi"

const DEFAULT_CONTENT: AboutSustainabilityContent = {
  headerText: "",
  introText: "",
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
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [chartFile, setChartFile] = useState<File | null>(null)
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

  const update = useCallback(
    (field: "headerText" | "introText", value: string) => {
      emitChange({ ...parsedRef.current, [field]: value })
    },
    [emitChange]
  )

  const handleBannerChange = useCallback(
    async (file: File | null) => {
      setBannerFile(file)
      if (!file) {
        emitChange({ ...parsedRef.current, intro_hero_image: undefined })
        return
      }
      try {
        const result = await uploadImage({ file }).unwrap()
        emitChange({ ...parsedRef.current, intro_hero_image: result.url })
      } catch {
        setBannerFile(null)
      }
    },
    [uploadImage, emitChange]
  )

  const handleChartChange = useCallback(
    async (file: File | null) => {
      setChartFile(file)
      if (!file) {
        emitChange({ ...parsedRef.current, intro_circle_image: undefined })
        return
      }
      try {
        const result = await uploadImage({ file }).unwrap()
        emitChange({ ...parsedRef.current, intro_circle_image: result.url })
      } catch {
        setChartFile(null)
      }
    },
    [uploadImage, emitChange]
  )

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">
        <p className="text-sm mb-2">Upload banner image</p>

        <FileDropZone
          accept=".jpg,.jpeg,.png,.svg,.webp"
          acceptLabel="Recommended size: 1920x1080px, Max 2MB, JPG/PNG/SVG"
          file={bannerFile}
          previewUrl={parsed.intro_hero_image}
          onFileChange={handleBannerChange}
          className="h-[125px]"
        />
      </div>

      <div className="min-w-0 lg:col-start-2 lg:row-start-1">
        <p className="text-sm mb-2">Header text</p>

        <textarea
          placeholder="Enter header text"
          value={parsed.headerText}
          onChange={(e) => update("headerText", e.target.value)}
          className="w-full min-w-0 h-[125px] rounded-xl border border-[#EDEDED] p-3 resize-none"
        />
      </div>

      <div className="min-w-0 lg:col-start-1 lg:row-start-2">
        <p className="text-sm mb-2">Graph/chart image</p>

        <FileDropZone
          accept=".jpg,.jpeg,.png,.svg,.webp"
          acceptLabel="Recommended size: 800x800px, Max 2MB, JPG/PNG/SVG"
          file={chartFile}
          previewUrl={parsed.intro_circle_image}
          onFileChange={handleChartChange}
          className="h-[125px]"
        />
      </div>

      <div className="min-w-0 lg:col-start-2 lg:row-start-2">
        <p className="text-sm mb-2">Intro text</p>

        <textarea
          placeholder="Enter introduction text"
          value={parsed.introText}
          onChange={(e) => update("introText", e.target.value)}
          className="w-full min-w-0 h-[125px] rounded-xl border border-[#EDEDED] p-3 resize-none"
        />
      </div>
    </div>
  )
}
