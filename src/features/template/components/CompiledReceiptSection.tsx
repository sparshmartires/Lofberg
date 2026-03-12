"use client"

import { useMemo, useState } from "react"
import { Upload } from "lucide-react"
import { parseContentJson, type CompiledReceiptContent } from "../types"

const DEFAULT_CONTENT: CompiledReceiptContent = {
  headerText: "",
  introText: "",
  boxes: [
    { sectionName: "", text: "" },
    { sectionName: "", text: "" },
    { sectionName: "", text: "" },
  ],
}

interface CompiledReceiptSectionProps {
  contentJson?: string | null
  onChange?: (json: string) => void
}

export default function CompiledReceiptSection({
  contentJson,
  onChange,
}: CompiledReceiptSectionProps) {
  const [localContent, setLocalContent] = useState(DEFAULT_CONTENT)

  const parsed = useMemo(
    () => contentJson ? parseContentJson<CompiledReceiptContent>(contentJson, DEFAULT_CONTENT) : localContent,
    [contentJson, localContent]
  )

  // Ensure we always have at least 3 boxes
  const boxes = useMemo(() => {
    const b = parsed.boxes ?? []
    while (b.length < 3) b.push({ sectionName: "", text: "" })
    return b.slice(0, 3)
  }, [parsed.boxes])

  const emit = (data: CompiledReceiptContent) => {
    if (onChange) {
      onChange(JSON.stringify(data))
    } else {
      setLocalContent(data)
    }
  }

  const updateField = (field: "headerText" | "introText", value: string) => {
    emit({ ...parsed, [field]: value })
  }

  const updateBox = (index: number, field: "sectionName" | "text", value: string) => {
    const updated = boxes.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    emit({ ...parsed, boxes: updated })
  }

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

      {/* HEADER + INTRO */}
      <div className="grid lg:grid-cols-2 gap-8">

        <div className="min-w-0">
          <p className="text-sm mb-2">Header text</p>

          <input
            placeholder="Enter header text"
            value={parsed.headerText}
            onChange={(e) => updateField("headerText", e.target.value)}
            className="w-full min-w-0 h-[40px] rounded-full border border-[#EDEDED] px-4 text-sm"
          />
        </div>

        <div className="min-w-0">
          <p className="text-sm mb-2">Intro text</p>

          <input
            placeholder="Enter introduction text"
            value={parsed.introText}
            onChange={(e) => updateField("introText", e.target.value)}
            className="w-full min-w-0 h-[40px] rounded-full border border-[#EDEDED] px-4 text-sm"
          />
        </div>

      </div>

      {/* TEXT BOX SECTION */}
      <div>
        <p className="text-sm font-medium">
          Certification text boxes (1 min – 3 max)
        </p>

        <p className="text-xs text-[#8A8A8A] mb-4">
          Configure text boxes repeatable per certification type. Data based on retrieved values from conversion logic.
        </p>
      </div>

      {/* BOXES */}
      <div className="space-y-6">

        {boxes.map((box, index) => (
          <div
            key={index}
            className="border border-[#EADCF6] rounded-[24px] p-6 space-y-4"
          >

            <p className="text-sm font-medium">
              Certification text box {index + 1}
            </p>

            {/* SECTION NAME */}
            <div>
              <p className="text-sm mb-2">
                Section name (for report creation)
              </p>

              <input
                placeholder="Eg. Organic impact"
                value={box.sectionName}
                onChange={(e) => updateBox(index, "sectionName", e.target.value)}
                className="w-full min-w-0 h-[40px] rounded-full border border-[#EDEDED] px-4 text-sm"
              />
            </div>

            {/* IMAGE + TEXT */}
            <div className="grid lg:grid-cols-2 gap-8">

              {/* IMAGE */}
              <div className="min-w-0">
                <p className="text-sm mb-2">
                  Section image
                </p>

                <div className="w-full min-w-0 h-[110px] border-2 border-dashed border-[#D8B4F8] rounded-xl flex flex-col items-center justify-center gap-2">
                  <Upload className="text-[#5B2D91]" />

                  <p className="text-sm text-[#4E4E4E]">
                    Upload a file or drag and drop
                  </p>
                </div>
              </div>

              {/* TEXT */}
              <div className="min-w-0">
                <p className="text-sm mb-2">
                  Section text
                </p>

                <textarea
                  placeholder="Enter section text"
                  value={box.text}
                  onChange={(e) => updateBox(index, "text", e.target.value)}
                  className="w-full min-w-0 h-[110px] rounded-xl border border-[#EDEDED] p-3 resize-none"
                />
              </div>

            </div>

            {/* INFO TEXT */}
            <p className="text-xs text-[#7B3EBE]">
              Based on retrieved values. Keep placeholders like {"{Certification type}"}, {"{Quantity}"}, {"{Percentage}"} in the text
            </p>

          </div>
        ))}

      </div>

    </div>
  )
}
