"use client"

import { useMemo } from "react"
import { parseContentJson, type CoverPageContent } from "../../types"
import { TranslationFieldPair } from "./TranslationFieldPair"

const DEFAULT: CoverPageContent = { headerText: "" }

interface CoverPageTranslationProps {
  contentJson?: string | null
  translationJson?: string | null
  onChange?: (json: string) => void
}

export default function CoverPageTranslation({
  contentJson,
  translationJson,
  onChange,
}: CoverPageTranslationProps) {
  const english = useMemo(() => parseContentJson(contentJson, DEFAULT), [contentJson])
  const translation = useMemo(() => parseContentJson(translationJson, DEFAULT), [translationJson])

  const update = (field: keyof CoverPageContent, html: string) => {
    onChange?.(JSON.stringify({ ...translation, [field]: html }))
  }

  return (
    <div className="space-y-6">
      <h3 className="font-sans font-normal text-[16px] leading-[24px]">
        Cover page translation
      </h3>
      <TranslationFieldPair
        label="Header text"
        englishHtml={english.headerText}
        translationHtml={translation.headerText}
        onChange={(html) => update("headerText", html)}
        fieldType="input"
      />
    </div>
  )
}
