"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useAutoDismiss } from "@/hooks/useAutoDismiss"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { TemplateConfiguration } from "../components/TemplateConfiguration"
import TemplateContent from "../components/TemplateContent"
import VersionHistory from "../components/VersionHistory"
import {
  useGetTemplatesQuery,
  useGetTemplateVersionQuery,
  useGetTemplateLanguagesQuery,
  useGetTranslationsQuery,
  useSaveActiveChangesMutation,
  useSaveTranslationsMutation,
  useCreateDraftMutation,
  useUpdateDraftMutation,
  usePublishDraftMutation,
  TemplateType,
  TemplateSize,
  PageType,
  type TemplatePageContentDto,
  type UpdatePageContentRequest,
} from "@/store/services/templatesApi"

const PAGE_TYPE_LABELS: Record<number, string> = {
  [PageType.CoverPage]: "Cover page",
  [PageType.AboutSustainability]: "About sustainability",
  [PageType.LofbergsUSPs]: "Löfbergs USPs",
  [PageType.IncreasingPositiveImpact]: "Increasing impact",
  [PageType.CertificationsOverview]: "Certifications",
  [PageType.ReceiptRAC]: "Receipt RAC",
  [PageType.ReceiptCO2]: "Receipt CO2",
  [PageType.ReceiptFairtrade]: "Receipt Fairtrade",
  [PageType.ReceiptOrganic]: "Receipt Organic",
}

const SKIP_VALIDATION_PAGES = new Set([
  PageType.TableOfContents,
  PageType.CompiledReceiptSummary,
])

function validateEnglishContent(pages: TemplatePageContentDto[]): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  for (const page of pages) {
    if (SKIP_VALIDATION_PAGES.has(page.pageType)) continue

    const tabName = PAGE_TYPE_LABELS[page.pageType] ?? `Page ${page.pageType}`
    if (!page.contentJson) {
      missing.push(`${tabName}: all fields empty`)
      continue
    }

    let content: Record<string, unknown>
    try {
      content = JSON.parse(page.contentJson)
    } catch {
      continue
    }

    for (const [field, value] of Object.entries(content)) {
      if (value === null || value === undefined || (typeof value === "string" && !value.trim())) {
        missing.push(`${tabName}: ${field}`)
      }
    }
  }

  return { valid: missing.length === 0, missing }
}

export function TemplatePage() {
  const [templateType, setTemplateType] = useState("report")
  const [language, setLanguage] = useState("")
  const [templateName, setTemplateName] = useState("")
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  useAutoDismiss(statusMessage?.text ?? null, () => setStatusMessage(null))

  // Default language to English
  const { data: allLanguages = [] } = useGetTemplateLanguagesQuery()
  useEffect(() => {
    if (!language && allLanguages.length > 0) {
      const english = allLanguages.find(l => l.code === "en" || l.name === "English")
      if (english) setLanguage(english.id)
      else setLanguage(allLanguages[0].id)
    }
  }, [allLanguages, language])

  const isReceipt = templateType === "receipt"

  // ── Fetch templates ────────────────────────────────────────────────
  const { data: templates, isLoading: isLoadingTemplates, error: templatesError } = useGetTemplatesQuery()

  // Primary templates (always A4 for editing)
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

  // All 3 template entities (Report, Receipt, Compiled Receipt — all A4)
  const reportTemplate = useMemo(
    () => templates?.find((t) => t.type === TemplateType.Report && t.size === TemplateSize.A4),
    [templates]
  )
  const receiptTemplate = useMemo(
    () => templates?.find((t) => t.type === TemplateType.Receipt && t.size === TemplateSize.A4),
    [templates]
  )
  const compiledReceiptTemplate = useMemo(
    () => templates?.find((t) => t.type === TemplateType.CompiledReceipt && t.size === TemplateSize.A4),
    [templates]
  )

  // All template IDs for synced operations (draft, publish, delete)
  const allTemplateIds = useMemo(() => {
    const ids: string[] = []
    if (reportTemplate?.id) ids.push(reportTemplate.id)
    if (receiptTemplate?.id) ids.push(receiptTemplate.id)
    if (compiledReceiptTemplate?.id) ids.push(compiledReceiptTemplate.id)
    return ids
  }, [reportTemplate, receiptTemplate, compiledReceiptTemplate])

  // ── Fetch ALL 3 version data simultaneously (persists across type switch) ──
  const reportEffectiveVersionId = editingVersionId ?? reportTemplate?.activeVersion?.id ?? ""
  const { data: reportVersionData, isLoading: isLoadingReportVersion } = useGetTemplateVersionQuery(
    { templateId: reportTemplate?.id ?? "", versionId: reportEffectiveVersionId },
    { skip: !reportTemplate?.id || !reportEffectiveVersionId }
  )

  const receiptEffectiveVersionId = editingVersionId
    ? "" // When editing a specific version, only load from primary (report)
    : receiptTemplate?.activeVersion?.id ?? ""
  const { data: receiptVersionData, isLoading: isLoadingReceiptVersion } = useGetTemplateVersionQuery(
    { templateId: receiptTemplate?.id ?? "", versionId: receiptEffectiveVersionId },
    { skip: !receiptTemplate?.id || !receiptEffectiveVersionId }
  )

  const compiledEffectiveVersionId = editingVersionId
    ? ""
    : compiledReceiptTemplate?.activeVersion?.id ?? ""
  const { data: compiledVersionData, isLoading: isLoadingCompiledVersion } = useGetTemplateVersionQuery(
    { templateId: compiledReceiptTemplate?.id ?? "", versionId: compiledEffectiveVersionId },
    { skip: !compiledReceiptTemplate?.id || !compiledEffectiveVersionId }
  )

  // Alias for backward compat — selectedTemplate's version data
  const versionData = isReceipt ? receiptVersionData : reportVersionData
  const isLoadingVersion = isReceipt ? isLoadingReceiptVersion : isLoadingReportVersion

  // ── Sync templateName from loaded version ──────────────────────────
  useEffect(() => {
    if (reportVersionData?.versionName) {
      setTemplateName(reportVersionData.versionName)
    }
  }, [reportVersionData?.id, reportVersionData?.versionName])


  // ── Determine if editing translations (non-English language) ────────
  const isEditingTranslation = useMemo(() => {
    if (!language || allLanguages.length === 0) return false
    const selectedLang = allLanguages.find(l => l.id === language)
    return selectedLang ? !selectedLang.isDefault : false
  }, [language, allLanguages])

  // ── Fetch translations for non-English languages ──────────────────
  const { data: mainTranslations = [] } = useGetTranslationsQuery(
    { templateId: selectedTemplate?.id ?? "", languageId: language },
    { skip: !selectedTemplate?.id || !language || !isEditingTranslation }
  )

  const { data: compiledTranslations = [] } = useGetTranslationsQuery(
    { templateId: compiledTemplate?.id ?? "", languageId: language },
    { skip: !compiledTemplate?.id || !language || !isEditingTranslation }
  )

  // ── Merge pages from ALL 3 templates (persists across type switch) ─
  const allApiPages = useMemo(() => {
    const report = reportVersionData?.pages ?? []
    const receipt = receiptVersionData?.pages ?? []
    const compiled = compiledVersionData?.pages ?? []
    return [...report, ...receipt, ...compiled]
  }, [reportVersionData, receiptVersionData, compiledVersionData])

  // ── Initialize local edits — only on language/template change ──────
  const prevLangRef = useRef(language)
  const initializedRef = useRef(false)

  useEffect(() => {
    const langChanged = prevLangRef.current !== language
    prevLangRef.current = language

    // Only re-initialize on language change or first load (NOT on template type switch)
    if (!langChanged && initializedRef.current) return

    if (isEditingTranslation) {
      const allTranslations = [...mainTranslations, ...compiledTranslations]
      if (allTranslations.length === 0) {
        if (!langChanged) return
        setLocalEdits({})
        return
      }
      const initial: Record<string, string> = {}
      for (const page of allTranslations) {
        if (page.translationJson) {
          initial[page.templatePageId] = page.translationJson
        }
      }
      setLocalEdits(initial)
      initializedRef.current = true
    } else if (allApiPages.length > 0) {
      const initial: Record<string, string> = {}
      for (const page of allApiPages) {
        if (page.contentJson) {
          initial[page.templatePageId] = page.contentJson
        }
      }
      setLocalEdits(initial)
      initializedRef.current = true
    }
  }, [language, isEditingTranslation, allApiPages, mainTranslations, compiledTranslations])

  // ── Merge API pages with local edits ───────────────────────────────
  const mergedPages: TemplatePageContentDto[] = useMemo(() => {
    if (allApiPages.length === 0) return []
    if (isEditingTranslation) {
      // When editing translations, overlay translation content onto the page structure
      const allTranslations = [...mainTranslations, ...compiledTranslations]
      const translationMap = new Map(allTranslations.map(t => [t.templatePageId, t.translationJson]))
      return allApiPages.map((page) => ({
        ...page,
        contentJson: localEdits[page.templatePageId] ?? translationMap.get(page.templatePageId) ?? "",
      }))
    }
    return allApiPages.map((page) => ({
      ...page,
      contentJson: localEdits[page.templatePageId] ?? page.contentJson,
    }))
  }, [allApiPages, localEdits, isEditingTranslation, mainTranslations, compiledTranslations])

  // ── Page change handler ────────────────────────────────────────────
  const handlePageChange = useCallback(
    (templatePageId: string, contentJson: string) => {
      setLocalEdits((prev) => ({ ...prev, [templatePageId]: contentJson }))
    },
    []
  )

  // ── Build dirty pages for a specific template ──────────────────────
  const buildDirtyPagesForTemplate = useCallback(
    (templatePages: TemplatePageContentDto[] | undefined): UpdatePageContentRequest[] => {
      if (!templatePages) return []
      const pageIds = new Set(templatePages.map((p) => p.templatePageId))
      return Object.entries(localEdits)
        .filter(([id]) => pageIds.has(id))
        .map(([templatePageId, contentJson]) => ({ templatePageId, contentJson }))
    },
    [localEdits]
  )

  // ── Mutations ──────────────────────────────────────────────────────
  const [saveActiveChanges] = useSaveActiveChangesMutation()
  const [saveTranslations] = useSaveTranslationsMutation()
  const [createDraft] = useCreateDraftMutation()
  const [updateDraft] = useUpdateDraftMutation()
  const [publishDraft] = usePublishDraftMutation()

  const handleSaveTranslations = async () => {
    if (!selectedTemplate?.id || !language) return

    const mainPages = Object.entries(localEdits)
      .filter(([id]) => (versionData?.pages ?? []).some(p => p.templatePageId === id))
      .map(([templatePageId, translationJson]) => ({ templatePageId, translationJson }))

    const compiledPages = Object.entries(localEdits)
      .filter(([id]) => (compiledVersionData?.pages ?? []).some(p => p.templatePageId === id))
      .map(([templatePageId, translationJson]) => ({ templatePageId, translationJson }))

    if (mainPages.length === 0 && compiledPages.length === 0) {
      setStatusMessage({ type: "error", text: "No translation changes to save." })
      return
    }

    setIsSaving(true)
    setStatusMessage(null)
    try {
      if (mainPages.length > 0) {
        await saveTranslations({
          templateId: selectedTemplate.id,
          body: { languageId: language, isDraft: false, pages: mainPages },
        }).unwrap()
      }
      if (compiledPages.length > 0 && compiledTemplate?.id) {
        await saveTranslations({
          templateId: compiledTemplate.id,
          body: { languageId: language, isDraft: false, pages: compiledPages },
        }).unwrap()
      }
      setStatusMessage({ type: "success", text: "Translations saved successfully." })
    } catch (err) {
      console.error("Failed to save translations:", err)
      setStatusMessage({ type: "error", text: "Failed to save translations." })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!reportTemplate?.id) {
      setStatusMessage({ type: "error", text: "Not connected to API. Please log in first." })
      return
    }

    const reportPages = buildDirtyPagesForTemplate(reportVersionData?.pages)
    const receiptPages = buildDirtyPagesForTemplate(receiptVersionData?.pages)
    const compiledPages = buildDirtyPagesForTemplate(compiledVersionData?.pages)

    if (reportPages.length === 0 && receiptPages.length === 0 && compiledPages.length === 0) {
      setStatusMessage({ type: "error", text: "No changes to save." })
      return
    }

    setIsSaving(true)
    setStatusMessage(null)
    try {
      // Save to ALL 3 templates
      if (reportPages.length > 0 && reportTemplate?.id) {
        await saveActiveChanges({
          templateId: reportTemplate.id,
          body: { pages: reportPages },
        }).unwrap()
      }
      if (receiptPages.length > 0 && receiptTemplate?.id) {
        await saveActiveChanges({
          templateId: receiptTemplate.id,
          body: { pages: receiptPages },
        }).unwrap()
      }
      if (compiledPages.length > 0 && compiledReceiptTemplate?.id) {
        await saveActiveChanges({
          templateId: compiledReceiptTemplate.id,
          body: { pages: compiledPages },
        }).unwrap()
      }


      setStatusMessage({ type: "success", text: "Changes saved successfully." })
    } catch (err) {
      console.error("Failed to save changes:", err)
      setStatusMessage({ type: "error", text: "Failed to save changes. Check console for details." })
    } finally {
      setIsSaving(false)
    }
  }

  // Helper: create draft if one doesn't already exist (ignore 409 Conflict)
  const ensureDraft = async (templateId: string) => {
    try {
      await createDraft({ templateId, body: { versionName: templateName || undefined } }).unwrap()
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status !== 409) throw err
      // Draft already exists — proceed with update
    }
  }

  const handleSaveAsDraft = async () => {
    if (!reportTemplate?.id) {
      setStatusMessage({ type: "error", text: "Not connected to API. Please log in first." })
      return
    }

    const reportPages = buildDirtyPagesForTemplate(reportVersionData?.pages)
    const receiptPages = buildDirtyPagesForTemplate(receiptVersionData?.pages)
    const compiledPages = buildDirtyPagesForTemplate(compiledVersionData?.pages)

    if (reportPages.length === 0 && receiptPages.length === 0 && compiledPages.length === 0) {
      setStatusMessage({ type: "error", text: "No changes to save as draft." })
      return
    }

    setIsSaving(true)
    setStatusMessage(null)
    try {
      // Create drafts for ALL 3 templates (synced versions)
      for (const id of allTemplateIds) {
        await ensureDraft(id)
      }

      // Save page changes to ALL template drafts
      if (reportPages.length > 0 && reportTemplate?.id) {
        await updateDraft({
          templateId: reportTemplate.id,
          body: { pages: reportPages, versionName: templateName || undefined },
        }).unwrap()
      }
      if (receiptPages.length > 0 && receiptTemplate?.id) {
        await updateDraft({
          templateId: receiptTemplate.id,
          body: { pages: receiptPages, versionName: templateName || undefined },
        }).unwrap()
      }
      if (compiledPages.length > 0 && compiledReceiptTemplate?.id) {
        await updateDraft({
          templateId: compiledReceiptTemplate.id,
          body: { pages: compiledPages, versionName: templateName || undefined },
        }).unwrap()
      }

      setStatusMessage({ type: "success", text: "Draft saved successfully." })
    } catch (err) {
      console.error("Failed to save as draft:", err)
      setStatusMessage({ type: "error", text: "Failed to save draft. Check console for details." })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!reportTemplate?.id) return

    // FE validation: check all English fields are filled before publishing
    if (!isEditingTranslation) {
      const { valid, missing } = validateEnglishContent(mergedPages)
      if (!valid) {
        const fieldList = missing.slice(0, 5).join(", ")
        const suffix = missing.length > 5 ? ` and ${missing.length - 5} more` : ""
        setStatusMessage({
          type: "error",
          text: `Cannot publish: missing content in ${missing.length} field(s). ${fieldList}${suffix}`,
        })
        return
      }
    }

    setIsPublishing(true)
    setStatusMessage(null)
    try {
      // Save current content as draft first, then publish ALL 3 templates
      for (const id of allTemplateIds) {
        await ensureDraft(id)
      }

      // Update drafts with current page changes (split per template)
      const reportPages = buildDirtyPagesForTemplate(reportVersionData?.pages)
      const receiptPages = buildDirtyPagesForTemplate(receiptVersionData?.pages)
      const compiledPages = buildDirtyPagesForTemplate(compiledVersionData?.pages)

      if (reportPages.length > 0 && reportTemplate?.id) {
        await updateDraft({ templateId: reportTemplate.id, body: { pages: reportPages, versionName: templateName || undefined } }).unwrap()
      }
      if (receiptPages.length > 0 && receiptTemplate?.id) {
        await updateDraft({ templateId: receiptTemplate.id, body: { pages: receiptPages, versionName: templateName || undefined } }).unwrap()
      }
      if (compiledPages.length > 0 && compiledReceiptTemplate?.id) {
        await updateDraft({ templateId: compiledReceiptTemplate.id, body: { pages: compiledPages, versionName: templateName || undefined } }).unwrap()
      }

      // Publish ALL 3 templates (synced versions)
      for (const id of allTemplateIds) {
        await publishDraft({ templateId: id, body: { versionName: templateName || undefined } }).unwrap()
      }

      setLocalEdits({})
      setEditingVersionId(null)
      setStatusMessage({ type: "success", text: "Published successfully!" })
    } catch (err: unknown) {
      console.error("Failed to publish:", err)
      const apiError = err as { data?: { error?: string } }
      const message = apiError?.data?.error || "Failed to publish. Please try again."
      setStatusMessage({ type: "error", text: message })
    } finally {
      setIsPublishing(false)
    }
  }

  const isLoading = isLoadingTemplates || isLoadingVersion || isLoadingCompiledVersion

  return (
    <div className="min-h-screen bg-background py-10">
      {/* Header */}
      <div className="page-header-with-action">
        <div>
          <h1 className="page-header-with-action-title">
            Report + receipt templates
          </h1>
        </div>
        <div className="flex gap-3">
          {!isEditingTranslation && (
            <Button
              variant="outlineBrand"
              className="page-header-with-action-button"
              onClick={handleSaveAsDraft}
              disabled={isSaving || isLoading}
            >
              <Save className="page-header-with-action-icon" />
              Save as draft
            </Button>
          )}
          <Button
            variant="primary"
            className="page-header-with-action-button"
            onClick={isEditingTranslation ? handleSaveTranslations : handleSaveChanges}
            disabled={isSaving || isLoading}
          >
            {isEditingTranslation ? "Save translations" : "Save changes"}
          </Button>
        </div>
      </div>

      {/* Status messages */}
      {templatesError && (
        <div className="mx-auto max-w-screen-xl px-4 mt-4">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load templates. Please make sure you are logged in as an admin.
          </div>
        </div>
      )}
      {statusMessage && (
        <div className="mx-auto max-w-screen-xl px-4 mt-4">
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

      <TemplateConfiguration
        templateType={templateType}
        language={language}
        templateName={templateName}
        onTemplateTypeChange={setTemplateType}
        onLanguageChange={setLanguage}
        onTemplateNameChange={setTemplateName}
        onPublish={handlePublish}
        isPublishing={isPublishing}
      />

      <TemplateContent
        templateType={templateType}
        pages={mergedPages}
        onPageChange={handlePageChange}
      />

      {reportTemplate && (
        <VersionHistory
          templateIds={allTemplateIds}
          onOpenVersion={(versionId) => {
            setEditingVersionId(versionId)
            setLocalEdits({})
            setStatusMessage({ type: "success", text: "Version loaded into editor." })
          }}
        />
      )}
    </div>
  )
}
