"use client"

import { useMemo, useState } from "react"
import { Upload } from "lucide-react"
import { parseContentJson, type AboutSustainabilityContent } from "../types"

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

  const parsed = useMemo(
    () => contentJson ? parseContentJson<AboutSustainabilityContent>(contentJson, DEFAULT_CONTENT) : localContent,
    [contentJson, localContent]
  )

  const update = (field: keyof AboutSustainabilityContent, value: string) => {
    const updated = { ...parsed, [field]: value }
    if (onChange) {
      onChange(JSON.stringify(updated))
    } else {
      setLocalContent(updated)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">
        <p className="text-sm mb-2">Upload banner image</p>

        <div className="w-full min-w-0 h-[125px] border-2 border-dashed border-[#D8B4F8] rounded-xl p-4 flex flex-col items-center justify-center gap-3">
          <Upload className="text-[#5B2D91]" />
          <p className="text-sm text-[#4E4E4E]">Upload a file or drag and drop</p>
        </div>
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

        <div className="w-full min-w-0 h-[125px] border-2 border-dashed border-[#D8B4F8] rounded-xl p-4 flex flex-col items-center justify-center gap-3">
          <Upload className="text-[#5B2D91]" />
          <p className="text-sm text-[#4E4E4E]">Upload a file or drag and drop</p>
        </div>
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
