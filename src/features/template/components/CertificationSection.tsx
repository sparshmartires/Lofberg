"use client"

import { useMemo, useState } from "react"
import { Upload } from "lucide-react"
import { parseContentJson, type CertificationsContent } from "../types"

const CERTIFICATION_TYPES = [
  "Organic certification",
  "Fairtrade certification",
  "Rainforest alliance certification",
  "CO2 certification",
]

const DEFAULT_CONTENT: CertificationsContent = {
  headerText: "",
  certifications: CERTIFICATION_TYPES.map((type) => ({
    type,
    headerText: "",
    descriptionText: "",
  })),
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

  const parsed = useMemo(
    () => contentJson ? parseContentJson<CertificationsContent>(contentJson, DEFAULT_CONTENT) : localContent,
    [contentJson, localContent]
  )

  // Ensure we always have 4 certifications
  const certifications = useMemo(() => {
    return CERTIFICATION_TYPES.map((type, i) => {
      const existing = parsed.certifications?.[i]
      return existing ?? { type, headerText: "", descriptionText: "" }
    })
  }, [parsed.certifications])

  const emit = (data: CertificationsContent) => {
    if (onChange) {
      onChange(JSON.stringify(data))
    } else {
      setLocalContent(data)
    }
  }

  const updateHeaderText = (value: string) => {
    emit({ ...parsed, headerText: value })
  }

  const updateCert = (index: number, field: "headerText" | "descriptionText", value: string) => {
    const updated = certifications.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    )
    emit({ ...parsed, certifications: updated })
  }

  return (
    <div className="space-y-8">
      <h3 className="font-sans font-normal text-[16px] leading-[24px] tracking-[0]">
        Certifications report section
      </h3>

      {/* HEADER */}
      <div>
        <p className="text-sm mb-2">Header Text</p>

        <textarea
          placeholder="Enter header text"
          value={parsed.headerText}
          onChange={(e) => updateHeaderText(e.target.value)}
          className="w-full min-w-0 h-[90px] rounded-xl border border-[#EDEDED] p-3 resize-none"
        />
      </div>

      <div className="border-t border-[#EDEDED]" />

      {/* CERTIFICATION TYPES */}
      <div className="space-y-6">

        {certifications.map((cert, index) => (
          <div
            key={index}
            className="border border-[#EADCF6] rounded-[24px] p-6 space-y-4"
          >

            {/* TITLE */}
            <p className="text-sm font-medium">
              {CERTIFICATION_TYPES[index]}
            </p>

            {/* IMAGES */}
            <div className="grid lg:grid-cols-2 gap-8">

              {/* LOGO */}
              <div className="min-w-0">
                <p className="text-sm mb-2">
                  Certification logo
                </p>

                <div className="w-full min-w-0 h-[110px] border-2 border-dashed border-[#D8B4F8] rounded-xl flex flex-col items-center justify-center gap-2">
                  <Upload className="text-[#5B2D91]" />

                  <p className="text-sm text-[#4E4E4E]">
                    Upload a file or drag and drop
                  </p>
                </div>
              </div>

              {/* BACKGROUND */}
              <div className="min-w-0">
                <p className="text-sm mb-2">
                  Background image
                </p>

                <div className="w-full min-w-0 h-[110px] border-2 border-dashed border-[#D8B4F8] rounded-xl flex flex-col items-center justify-center gap-2">
                  <Upload className="text-[#5B2D91]" />

                  <p className="text-sm text-[#4E4E4E]">
                    Upload a file or drag and drop
                  </p>
                </div>
              </div>

            </div>

            {/* HEADER TEXT */}
            <div>
              <p className="text-sm mb-2">
                Header text
              </p>

              <input
                placeholder="Organic coffee"
                value={cert.headerText}
                onChange={(e) => updateCert(index, "headerText", e.target.value)}
                className="w-full min-w-0 h-[40px] rounded-full border border-[#EDEDED] px-4 text-sm"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <p className="text-sm mb-2">
                Description text
              </p>

              <textarea
                placeholder="Keep placeholders like {Quantity}, for dynamic values"
                value={cert.descriptionText}
                onChange={(e) => updateCert(index, "descriptionText", e.target.value)}
                className="w-full min-w-0 h-[90px] rounded-xl border border-[#EDEDED] p-3 resize-none"
              />
            </div>

            {/* WARNING */}
            <p className="text-xs text-[#7B3EBE]">
              ⚠ Keep placeholders like {"{Quantity}"}, {"{TimePeriod}"} in the text
            </p>

          </div>
        ))}

      </div>

    </div>
  )
}
