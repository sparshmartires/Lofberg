"use client"

import { useMemo } from "react"
import { parseContentJson, type ReceiptContent } from "../../types"
import { TranslationFieldPair } from "./TranslationFieldPair"
import type { TemplatePageTranslationDto } from "@/store/services/templatesApi"

const IMAGE_KEYS = /image|icon|logo|img/i

interface Props {
  pages: TemplatePageTranslationDto[]
  onPageChange?: (templatePageId: string, translationJson: string) => void
}

export default function ReceiptTranslation({ pages, onPageChange }: Props) {
  return (
    <div className="space-y-8">
      <h3 className="font-sans font-normal text-[16px] leading-[24px]">
        Receipt translation
      </h3>
      {pages.map((page) => (
        <ReceiptPageTranslation key={page.templatePageId} page={page} onPageChange={onPageChange} />
      ))}
    </div>
  )
}

function ReceiptPageTranslation({
  page,
  onPageChange,
}: {
  page: TemplatePageTranslationDto
  onPageChange?: (templatePageId: string, translationJson: string) => void
}) {
  const english = useMemo(() => parseContentJson<ReceiptContent>(page.contentJson, {}), [page.contentJson])
  const translation = useMemo(() => parseContentJson<ReceiptContent>(page.translationJson, {}), [page.translationJson])

  const textKeys = useMemo(
    () => Object.keys(english).filter((k) => !IMAGE_KEYS.test(k)),
    [english]
  )

  const update = (field: string, html: string) => {
    const updated = { ...translation, [field]: html }
    onPageChange?.(page.templatePageId, JSON.stringify(updated))
  }

  const getFieldType = (key: string): "richtext" | "input" =>
    key.endsWith("_header") || key === "receipt_header" ? "input" : "richtext"

  if (textKeys.length === 0) return null

  return (
    <div className="space-y-4">
      {textKeys.map((key) => (
        <TranslationFieldPair
          key={key}
          label={key.replace(/_/g, " ")}
          englishHtml={english[key] ?? ""}
          translationHtml={translation[key] ?? ""}
          onChange={(html) => update(key, html)}
          fieldType={getFieldType(key)}
        />
      ))}
    </div>
  )
}
