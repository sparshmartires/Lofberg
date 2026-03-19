"use client"

import { useMemo } from "react"
import { parseContentJson, type UspContent } from "../../types"
import { TranslationFieldPair } from "./TranslationFieldPair"

const DEFAULT: UspContent = {
  headerText: "",
  introText: "",
  sectionText1: "",
  sectionText2: "",
  sectionText3: "",
}

interface Props {
  contentJson?: string | null
  translationJson?: string | null
  onChange?: (json: string) => void
}

export default function UspTranslation({ contentJson, translationJson, onChange }: Props) {
  const english = useMemo(() => parseContentJson(contentJson, DEFAULT), [contentJson])
  const translation = useMemo(() => parseContentJson(translationJson, DEFAULT), [translationJson])

  const update = (field: string, html: string) => {
    onChange?.(JSON.stringify({ ...translation, [field]: html }))
  }

  const fields: { key: keyof UspContent; label: string; fieldType?: "richtext" | "textarea" | "input" }[] = [
    { key: "headerText", label: "Header text", fieldType: "textarea" },
    { key: "introText", label: "Intro text" },
    { key: "sectionText1", label: "Section text 1" },
    { key: "sectionText2", label: "Section text 2" },
    { key: "sectionText3", label: "Section text 3" },
  ]

  return (
    <div className="space-y-6">
      <h3 className="font-sans font-normal text-[16px] leading-[24px]">
        Löfbergs USP&apos;s translation
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
