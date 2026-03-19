"use client"

import { useMemo } from "react"
import { parseContentJson, type CompiledReceiptContent } from "../../types"
import { TranslationFieldPair } from "./TranslationFieldPair"

const DEFAULT: CompiledReceiptContent = {
  receipt_comp_header: "",
  receipt_comp_desc_text: "",
}

interface Props {
  contentJson?: string | null
  translationJson?: string | null
  onChange?: (json: string) => void
}

export default function CompiledReceiptTranslation({ contentJson, translationJson, onChange }: Props) {
  const english = useMemo(() => parseContentJson(contentJson, DEFAULT), [contentJson])
  const translation = useMemo(() => parseContentJson(translationJson, DEFAULT), [translationJson])

  const update = (field: string, html: string) => {
    onChange?.(JSON.stringify({ ...translation, [field]: html }))
  }

  const fields: { key: keyof CompiledReceiptContent; label: string; fieldType?: "richtext" | "textarea" | "input" }[] = [
    { key: "receipt_comp_header", label: "Compiled receipt header", fieldType: "input" },
    { key: "receipt_comp_desc_text", label: "Compiled receipt description" },
  ]

  return (
    <div className="space-y-6">
      <h3 className="font-sans font-normal text-[16px] leading-[24px]">
        Compiled receipt translation
      </h3>
      {fields.map(({ key, label, fieldType }) => (
        <TranslationFieldPair
          key={key}
          label={label}
          englishHtml={(english[key] as string) ?? ""}
          translationHtml={(translation[key] as string) ?? ""}
          onChange={(html) => update(key, html)}
          fieldType={fieldType}
        />
      ))}
    </div>
  )
}
