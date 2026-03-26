"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAutoDismiss } from "@/hooks/useAutoDismiss"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import TranslationContent from "../components/TranslationContent"
import {
  useGetTemplatesQuery,
  useGetTemplateLanguagesQuery,
  useGetTranslationsQuery,
  useSaveTranslationsMutation,
  TemplateType,
  TemplateSize,
  type TemplatePageTranslationDto,
} from "@/store/services/templatesApi"
import styles from "../components/TemplateConfiguration.module.css"

export function TranslatorTemplatePage() {
  const [templateType, setTemplateType] = useState("report")
  const [selectedLanguageId, setSelectedLanguageId] = useState("")
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  useAutoDismiss(statusMessage?.text ?? null, () => setStatusMessage(null))

  const isReceipt = templateType === "receipt"

  // ── Fetch languages ────────────────────────────────────────────────
  const { data: languages = [] } = useGetTemplateLanguagesQuery()

  const nonEnglishLanguages = useMemo(
    () => languages.filter((l) => !l.isDefault),
    [languages]
  )

  // Auto-select first non-English language
  useEffect(() => {
    if (!selectedLanguageId && nonEnglishLanguages.length > 0) {
      setSelectedLanguageId(nonEnglishLanguages[0].id)
    }
  }, [nonEnglishLanguages, selectedLanguageId])

  // ── Fetch templates ────────────────────────────────────────────────
  const { data: templates, isLoading: isLoadingTemplates } = useGetTemplatesQuery()

  const selectedTemplate = useMemo(
    () =>
      templates?.find((t) =>
        isReceipt
          ? t.type === TemplateType.Receipt && t.size === TemplateSize.A4
          : t.type === TemplateType.Report && t.size === TemplateSize.A4
      ),
    [templates, isReceipt]
  )

  const compiledTemplate = useMemo(
    () =>
      isReceipt
        ? templates?.find((t) => t.type === TemplateType.CompiledReceipt && t.size === TemplateSize.A4)
        : undefined,
    [templates, isReceipt]
  )

  // ── Fetch translations ─────────────────────────────────────────────
  const { data: mainTranslations = [], isLoading: isLoadingMainTranslations } = useGetTranslationsQuery(
    { templateId: selectedTemplate?.id ?? "", languageId: selectedLanguageId },
    { skip: !selectedTemplate?.id || !selectedLanguageId }
  )

  const { data: compiledTranslations = [], isLoading: isLoadingCompiledTranslations } = useGetTranslationsQuery(
    { templateId: compiledTemplate?.id ?? "", languageId: selectedLanguageId },
    { skip: !compiledTemplate?.id || !selectedLanguageId }
  )

  const allApiPages = useMemo(
    () => [...mainTranslations, ...compiledTranslations],
    [mainTranslations, compiledTranslations]
  )

  // Reset local edits when language or template type changes
  useEffect(() => {
    setLocalEdits({})
  }, [selectedLanguageId, templateType])

  // ── Merge API data with local edits ────────────────────────────────
  const mergedPages: TemplatePageTranslationDto[] = useMemo(() => {
    if (allApiPages.length === 0) return []
    return allApiPages.map((page) => ({
      ...page,
      translationJson: localEdits[page.templatePageId] ?? page.translationJson,
    }))
  }, [allApiPages, localEdits])

  // ── Handlers ───────────────────────────────────────────────────────
  const handlePageChange = useCallback(
    (templatePageId: string, translationJson: string) => {
      setLocalEdits((prev) => ({ ...prev, [templatePageId]: translationJson }))
    },
    []
  )

  const [saveTranslations] = useSaveTranslationsMutation()

  const buildDirtyPages = useCallback(
    (sourcePages: TemplatePageTranslationDto[]) => {
      const pageIds = new Set(sourcePages.map((p) => p.templatePageId))
      return Object.entries(localEdits)
        .filter(([id]) => pageIds.has(id))
        .map(([templatePageId, translationJson]) => ({ templatePageId, translationJson }))
    },
    [localEdits]
  )

  const buildAllTranslatedPages = useCallback(
    (sourcePages: TemplatePageTranslationDto[]) => {
      const pageIds = new Set(sourcePages.map((p) => p.templatePageId))
      return mergedPages
        .filter((p) => pageIds.has(p.templatePageId) && p.translationJson)
        .map(({ templatePageId, translationJson }) => ({ templatePageId, translationJson }))
    },
    [mergedPages]
  )

  const handleSave = async (isDraft: boolean) => {
    if (!selectedTemplate?.id || !selectedLanguageId) return

    const builder = isDraft ? buildDirtyPages : buildAllTranslatedPages
    const mainPages = builder(mainTranslations)
    const compiledPages = builder(compiledTranslations)

    if (mainPages.length === 0 && compiledPages.length === 0) {
      setStatusMessage({ type: "error", text: "No changes to save." })
      return
    }

    setIsSaving(true)
    setStatusMessage(null)
    try {
      if (mainPages.length > 0) {
        await saveTranslations({
          templateId: selectedTemplate.id,
          body: { languageId: selectedLanguageId, isDraft, pages: mainPages },
        }).unwrap()
      }
      if (compiledPages.length > 0 && compiledTemplate?.id) {
        await saveTranslations({
          templateId: compiledTemplate.id,
          body: { languageId: selectedLanguageId, isDraft, pages: compiledPages },
        }).unwrap()
      }

      setLocalEdits({})
      setStatusMessage({
        type: "success",
        text: isDraft ? "Draft saved successfully." : "Translation submitted successfully.",
      })
    } catch (err) {
      console.error("Failed to save translations:", err)
      setStatusMessage({ type: "error", text: "Failed to save. Check console for details." })
    } finally {
      setIsSaving(false)
    }
  }

  const fieldClass =
    "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-sm"

  const isLoading = isLoadingTemplates || isLoadingMainTranslations || isLoadingCompiledTranslations

  return (
    <div className="min-h-screen bg-background py-10">
      {/* Header */}
      <div className="page-header-with-action">
        <div>
          <h1 className="page-header-with-action-title">
            Template translation
          </h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outlineBrand"
            className="page-header-with-action-button"
            onClick={() => handleSave(true)}
            disabled={isSaving || isLoading || !selectedLanguageId}
          >
            <Save className="page-header-with-action-icon" />
            Save as draft
          </Button>
          <Button
            variant="primary"
            className="page-header-with-action-button"
            onClick={() => handleSave(false)}
            disabled={isSaving || isLoading || !selectedLanguageId}
          >
            Submit
          </Button>
        </div>
      </div>

      {/* Status messages */}
      {statusMessage && (
        <div className="mt-4">
          <div
            className={`rounded-xl border p-4 text-sm ${
              statusMessage.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {statusMessage.text}
          </div>
        </div>
      )}

      {/* Template Configuration */}
      <div className={styles.card}>
        <div className={styles.grid}>
          {/* Template Type */}
          <div className={styles.field}>
            <label className={styles.label}>Template type</label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Report template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="receipt">Receipt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Translation Language */}
          <div className={styles.field}>
            <label className={styles.label}>Language</label>
            <Select value={selectedLanguageId} onValueChange={setSelectedLanguageId}>
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {nonEnglishLanguages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Translation Content */}
      {selectedLanguageId ? (
        <TranslationContent
          templateType={templateType}
          pages={mergedPages}
          onPageChange={handlePageChange}
        />
      ) : (
        <div className="w-full rounded-[28px] border border-[#EDEDED] bg-white p-8 mt-[20px] text-center text-sm text-[#9CA3AF]">
          Select a language to start translating.
        </div>
      )}
    </div>
  )
}
