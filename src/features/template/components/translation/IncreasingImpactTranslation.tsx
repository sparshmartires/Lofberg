"use client"

import { useMemo } from "react"
import { parseContentJson, type IncreasingImpactContent } from "../../types"
import { TranslationFieldPair } from "./TranslationFieldPair"

const DEFAULT: IncreasingImpactContent = {
  headerText: "",
  introText: "",
  wantMoreText: "",
  actionText1: "", actionText2: "", actionText3: "", actionText4: "", actionText5: "",
  actionText6: "", actionText7: "", actionText8: "", actionText9: "", actionText10: "",
}

interface Props {
  contentJson?: string | null
  translationJson?: string | null
  onChange?: (json: string) => void
}

export default function IncreasingImpactTranslation({ contentJson, translationJson, onChange }: Props) {
  const english = useMemo(() => parseContentJson(contentJson, DEFAULT), [contentJson])
  const translation = useMemo(() => parseContentJson(translationJson, DEFAULT), [translationJson])

  const update = (field: string, html: string) => {
    onChange?.(JSON.stringify({ ...translation, [field]: html }))
  }

  const fields: { key: keyof IncreasingImpactContent; label: string; fieldType?: "richtext" | "input" }[] = [
    { key: "headerText", label: "Header text", fieldType: "input" },
    { key: "introText", label: "Intro text" },
    { key: "wantMoreText", label: "Want more text" },
    { key: "actionText1", label: "Action text 1" },
    { key: "actionText2", label: "Action text 2" },
    { key: "actionText3", label: "Action text 3" },
    { key: "actionText4", label: "Action text 4" },
    { key: "actionText5", label: "Action text 5" },
    { key: "actionText6", label: "Action text 6" },
    { key: "actionText7", label: "Action text 7" },
    { key: "actionText8", label: "Action text 8" },
    { key: "actionText9", label: "Action text 9" },
    { key: "actionText10", label: "Action text 10" },
  ]

  return (
    <div className="space-y-6">
      <h3 className="font-sans font-normal text-[16px] leading-[24px]">
        Increasing impact translation
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
