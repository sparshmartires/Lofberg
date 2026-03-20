"use client"

import { useMemo } from "react"
import { parseContentJson, type AboutSustainabilityContent } from "../../types"
import { TranslationFieldPair } from "./TranslationFieldPair"

const DEFAULT: AboutSustainabilityContent = {
  headerText: "",
  introText: "",
  intro_textblock_1: "",
  intro_textblock_2: "",
  intro_textblock_3: "",
  intro_textblock_4: "",
}

interface Props {
  contentJson?: string | null
  translationJson?: string | null
  onChange?: (json: string) => void
}

export default function AboutSustainabilityTranslation({ contentJson, translationJson, onChange }: Props) {
  const english = useMemo(() => parseContentJson(contentJson, DEFAULT), [contentJson])
  const translation = useMemo(() => parseContentJson(translationJson, DEFAULT), [translationJson])

  const update = (field: string, html: string) => {
    onChange?.(JSON.stringify({ ...translation, [field]: html }))
  }

  const fields: { key: keyof AboutSustainabilityContent; label: string; fieldType?: "richtext" | "textarea" | "input" }[] = [
    { key: "headerText", label: "Header text", fieldType: "textarea" },
    { key: "introText", label: "Intro text" },
    { key: "intro_textblock_1", label: "Textblock 1" },
    { key: "intro_textblock_2", label: "Textblock 2" },
    { key: "intro_textblock_3", label: "Textblock 3" },
    { key: "intro_textblock_4", label: "Textblock 4" },
  ]

  return (
    <div className="space-y-6">
      <h3 className="font-sans font-normal text-[16px] leading-[24px]">
        About sustainability translation
      </h3>
      {fields.map(({ key, label, fieldType }) => (
        <TranslationFieldPair
          key={key}
          label={label}
          englishHtml={english[key] ?? ""}
          translationHtml={translation[key] ?? ""}
          onChange={(html) => update(key, html)}
          fieldType={fieldType}
        />
      ))}
    </div>
  )
}
