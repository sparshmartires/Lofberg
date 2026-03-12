"use client"

import { useMemo, useState } from "react"
import { Upload } from "lucide-react"
import { parseContentJson, type UspContent } from "../types"

const DEFAULT_CONTENT: UspContent = {
  headerText: "",
  introText: "",
  sections: [{ text: "" }, { text: "" }, { text: "" }],
}

interface UspSectionProps {
  contentJson?: string | null
  onChange?: (json: string) => void
}

export default function UspSection({ contentJson, onChange }: UspSectionProps) {
  const [localContent, setLocalContent] = useState(DEFAULT_CONTENT)

  const parsed = useMemo(
    () => contentJson ? parseContentJson<UspContent>(contentJson, DEFAULT_CONTENT) : localContent,
    [contentJson, localContent]
  )

  // Ensure we always have 3 sections
  const sections = useMemo(() => {
    const s = parsed.sections ?? []
    while (s.length < 3) s.push({ text: "" })
    return s.slice(0, 3)
  }, [parsed.sections])

  const emit = (data: UspContent) => {
    if (onChange) {
      onChange(JSON.stringify(data))
    } else {
      setLocalContent(data)
    }
  }

  const updateField = (field: "headerText" | "introText", value: string) => {
    emit({ ...parsed, [field]: value })
  }

  const updateSection = (index: number, text: string) => {
    const updated = sections.map((s, i) => (i === index ? { ...s, text } : s))
    emit({ ...parsed, sections: updated })
  }

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
        <textarea
          placeholder="Enter introduction text"
          value={parsed.introText}
          onChange={(e) => updateField("introText", e.target.value)}
          className="w-full min-w-0 h-[110px] rounded-xl border border-[#EDEDED] p-3 resize-none"
        />
      </div>

      <div className="border-t border-[#EDEDED]" />

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="border border-[#EDEDED] rounded-[24px] p-6 space-y-4">
            <p className="text-sm font-medium">
              {index === 0 ? "USP sections (up to 3)" : `Section ${index + 1}`}
            </p>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="min-w-0">
                <p className="text-sm mb-2">Section image</p>

                <div className="w-full min-w-0 h-[120px] border-2 border-dashed border-[#D8B4F8] rounded-xl flex flex-col items-center justify-center gap-2">
                  <Upload className="text-[#5B2D91]" />

                  <p className="text-sm text-[#4E4E4E]">Upload a file or drag and drop</p>
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-sm mb-2">Section text</p>

                <textarea
                  placeholder="Enter section text"
                  value={section.text}
                  onChange={(e) => updateSection(index, e.target.value)}
                  className="w-full min-w-0 h-[120px] rounded-xl border border-[#EDEDED] p-3 resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
