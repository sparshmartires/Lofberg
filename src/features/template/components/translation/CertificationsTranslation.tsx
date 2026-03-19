"use client"

import { useMemo } from "react"
import { parseContentJson, type CertificationsContent } from "../../types"
import { TranslationFieldPair } from "./TranslationFieldPair"

const DEFAULT: CertificationsContent = {
  headerText: "",
  cert_general_header: "",
  cert_general_text: "",
  cert_rainforest_header: "",
  cert_rainforest_text: "",
  cert_fairtrade_header: "",
  cert_fairtrade_text: "",
  cert_organic_header: "",
  cert_organic_text: "",
}

interface Props {
  contentJson?: string | null
  translationJson?: string | null
  onChange?: (json: string) => void
}

export default function CertificationsTranslation({ contentJson, translationJson, onChange }: Props) {
  const english = useMemo(() => parseContentJson(contentJson, DEFAULT), [contentJson])
  const translation = useMemo(() => parseContentJson(translationJson, DEFAULT), [translationJson])

  const update = (field: string, html: string) => {
    onChange?.(JSON.stringify({ ...translation, [field]: html }))
  }

  const fields: { key: keyof CertificationsContent; label: string; fieldType?: "richtext" | "textarea" | "input" }[] = [
    { key: "headerText", label: "Header text", fieldType: "textarea" },
    { key: "cert_general_header", label: "General certification header", fieldType: "input" },
    { key: "cert_general_text", label: "General certification text" },
    { key: "cert_rainforest_header", label: "Rainforest Alliance header", fieldType: "input" },
    { key: "cert_rainforest_text", label: "Rainforest Alliance text" },
    { key: "cert_fairtrade_header", label: "Fairtrade header", fieldType: "input" },
    { key: "cert_fairtrade_text", label: "Fairtrade text" },
    { key: "cert_organic_header", label: "Organic header", fieldType: "input" },
    { key: "cert_organic_text", label: "Organic text" },
  ]

  return (
    <div className="space-y-6">
      <h3 className="font-sans font-normal text-[16px] leading-[24px]">
        Certifications translation
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
