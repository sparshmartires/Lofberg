"use client"

import { useCallback, useEffect, useState } from "react"
import { Trash2, Plus, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  useGetSegmentConversionTranslationsQuery,
  useSaveSegmentConversionTranslationsMutation,
  useGetCO2ConversionTranslationsQuery,
  useSaveCO2ConversionTranslationsMutation,
} from "@/store/services/conversionLogicApi"
import { useGetTemplateLanguagesQuery } from "@/store/services/templatesApi"

interface ConversionTranslationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversionId: string
  conversionType: "segment" | "co2"
  englishMetric: string
}

interface TranslationRow {
  languageId: string
  metricText: string
}

export default function ConversionTranslationDialog({
  open,
  onOpenChange,
  conversionId,
  conversionType,
  englishMetric,
}: ConversionTranslationDialogProps) {
  const [rows, setRows] = useState<TranslationRow[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Fetch languages
  const { data: languages = [] } = useGetTemplateLanguagesQuery()
  const nonDefaultLanguages = languages.filter((l) => !l.isDefault)

  // Fetch existing translations based on type
  const segmentTranslations = useGetSegmentConversionTranslationsQuery(conversionId, {
    skip: !open || conversionType !== "segment" || !conversionId,
  })
  const co2Translations = useGetCO2ConversionTranslationsQuery(conversionId, {
    skip: !open || conversionType !== "co2" || !conversionId,
  })

  const translations = conversionType === "segment" ? segmentTranslations : co2Translations
  const translationData = translations.data ?? []
  const isLoading = translations.isLoading

  // Save mutations
  const [saveSegment] = useSaveSegmentConversionTranslationsMutation()
  const [saveCO2] = useSaveCO2ConversionTranslationsMutation()

  // Initialize rows from fetched data
  useEffect(() => {
    if (open && translationData.length > 0) {
      setRows(translationData.map((t) => ({ languageId: t.languageId, metricText: t.metricText })))
    } else if (open && !isLoading && translationData.length === 0) {
      setRows([])
    }
  }, [open, translationData, isLoading])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setRows([])
      setStatusMessage(null)
    }
  }, [open])

  const usedLanguageIds = new Set(rows.map((r) => r.languageId))
  const availableLanguages = nonDefaultLanguages.filter((l) => !usedLanguageIds.has(l.id))

  const handleAddRow = useCallback(() => {
    if (availableLanguages.length === 0) return
    setRows((prev) => [...prev, { languageId: "", metricText: "" }])
  }, [availableLanguages.length])

  const handleRemoveRow = useCallback((index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleLanguageChange = useCallback((index: number, languageId: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, languageId } : r)))
  }, [])

  const handleMetricTextChange = useCallback((index: number, metricText: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, metricText } : r)))
  }, [])

  const handleSave = async () => {
    // Filter out rows without a language selected or empty text
    const validRows = rows.filter((r) => r.languageId && r.metricText.trim())

    setIsSaving(true)
    setStatusMessage(null)

    try {
      const body = { translations: validRows.map((r) => ({ languageId: r.languageId, metricText: r.metricText.trim() })) }

      if (conversionType === "segment") {
        await saveSegment({ id: conversionId, body }).unwrap()
      } else {
        await saveCO2({ id: conversionId, body }).unwrap()
      }

      setStatusMessage({ type: "success", text: "Translations saved successfully." })
      setTimeout(() => onOpenChange(false), 800)
    } catch (err) {
      console.error("Failed to save translations:", err)
      setStatusMessage({ type: "error", text: "Failed to save translations." })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            Translate: {englishMetric}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#7B3EBE]" />
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {/* Status message */}
            {statusMessage && (
              <div
                className={`rounded-xl border p-3 text-sm ${
                  statusMessage.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            {/* Translation rows */}
            {rows.map((row, index) => {
              // Available languages for this row = unused languages + current row's language
              const rowAvailableLanguages = nonDefaultLanguages.filter(
                (l) => l.id === row.languageId || !usedLanguageIds.has(l.id) || !rows.some((r, i) => i !== index && r.languageId === l.id)
              )

              return (
                <div key={index} className="flex items-center gap-3">
                  <Select
                    value={row.languageId}
                    onValueChange={(v) => handleLanguageChange(index, v)}
                  >
                    <SelectTrigger className="w-[180px] h-[40px] rounded-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {rowAvailableLanguages.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <input
                    value={row.metricText}
                    onChange={(e) => handleMetricTextChange(index, e.target.value)}
                    disabled={!row.languageId}
                    className="flex-1 h-[40px] rounded-full bg-[#F4F4F4] px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Translated metric"
                  />

                  <button
                    onClick={() => handleRemoveRow(index)}
                    className="w-[32px] h-[32px] rounded-lg bg-[#F4ECFB] flex items-center justify-center flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-[#5B2D91]" />
                  </button>
                </div>
              )
            })}

            {/* Add row button */}
            {availableLanguages.length > 0 && (
              <button
                onClick={handleAddRow}
                className="flex items-center gap-2 text-sm text-[#7B3EBE] hover:text-[#5B2D91]"
              >
                <Plus className="w-4 h-4" />
                Add translation
              </button>
            )}

            {/* Save button */}
            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-full px-6"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
