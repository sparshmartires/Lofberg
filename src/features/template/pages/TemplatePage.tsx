"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { TemplateConfiguration } from "../components/TemplateConfiguration"
import TemplateContent from "../components/TemplateContent"
import VersionHistory from "../components/VersionHistory"
import {
  useGetTemplatesQuery,
  useGetTemplateVersionQuery,
  useGetTemplateLanguagesQuery,
  useSaveActiveChangesMutation,
  useCreateDraftMutation,
  useUpdateDraftMutation,
  TemplateType,
  TemplateSize,
  type TemplatePageContentDto,
  type UpdatePageContentRequest,
} from "@/store/services/templatesApi"

// ── Helper: map A4 dirty pages to A3 counterparts by pageType ────────
function mapPagesToA3(
  dirtyPages: UpdatePageContentRequest[],
  a4Pages: TemplatePageContentDto[] | undefined,
  a3Pages: TemplatePageContentDto[] | undefined
): UpdatePageContentRequest[] {
  if (!a4Pages || !a3Pages) return []
  return dirtyPages.flatMap(({ templatePageId, contentJson }) => {
    const a4Page = a4Pages.find((p) => p.templatePageId === templatePageId)
    if (!a4Page) return []
    const a3Page = a3Pages.find((p) => p.pageType === a4Page.pageType)
    if (!a3Page) return []
    return [{ templatePageId: a3Page.templatePageId, contentJson }]
  })
}

export function TemplatePage() {
  const [templateType, setTemplateType] = useState("report")
  const [language, setLanguage] = useState("")
  const [templateName, setTemplateName] = useState("")
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

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

  // A3 counterparts (for mirroring saves)
  const a3ReceiptTemplate = useMemo(
    () =>
      isReceipt
        ? templates?.find((t) => t.type === TemplateType.Receipt && t.size === TemplateSize.A3)
        : undefined,
    [templates, isReceipt]
  )

  const a3CompiledTemplate = useMemo(
    () =>
      isReceipt
        ? templates?.find((t) => t.type === TemplateType.CompiledReceipt && t.size === TemplateSize.A3)
        : undefined,
    [templates, isReceipt]
  )

  // ── Fetch active versions (A4 primary) ─────────────────────────────
  const { data: versionData, isLoading: isLoadingVersion } = useGetTemplateVersionQuery(
    {
      templateId: selectedTemplate?.id ?? "",
      versionId: selectedTemplate?.activeVersion?.id ?? "",
    },
    { skip: !selectedTemplate?.id || !selectedTemplate?.activeVersion?.id }
  )

  const { data: compiledVersionData, isLoading: isLoadingCompiledVersion } = useGetTemplateVersionQuery(
    {
      templateId: compiledTemplate?.id ?? "",
      versionId: compiledTemplate?.activeVersion?.id ?? "",
    },
    { skip: !compiledTemplate?.id || !compiledTemplate?.activeVersion?.id }
  )

  // ── Fetch A3 versions (for page ID mapping during save mirroring) ──
  const { data: a3VersionData } = useGetTemplateVersionQuery(
    {
      templateId: a3ReceiptTemplate?.id ?? "",
      versionId: a3ReceiptTemplate?.activeVersion?.id ?? "",
    },
    { skip: !a3ReceiptTemplate?.id || !a3ReceiptTemplate?.activeVersion?.id }
  )

  const { data: a3CompiledVersionData } = useGetTemplateVersionQuery(
    {
      templateId: a3CompiledTemplate?.id ?? "",
      versionId: a3CompiledTemplate?.activeVersion?.id ?? "",
    },
    { skip: !a3CompiledTemplate?.id || !a3CompiledTemplate?.activeVersion?.id }
  )

  // ── Merge A4 pages from both sources ───────────────────────────────
  const allApiPages = useMemo(() => {
    const main = versionData?.pages ?? []
    const compiled = compiledVersionData?.pages ?? []
    return [...main, ...compiled]
  }, [versionData, compiledVersionData])

  // ── Initialize local edits from fetched versions ───────────────────
  useEffect(() => {
    if (allApiPages.length > 0) {
      const initial: Record<string, string> = {}
      for (const page of allApiPages) {
        if (page.contentJson) {
          initial[page.templatePageId] = page.contentJson
        }
      }
      setLocalEdits(initial)
    }
  }, [allApiPages])

  // ── Merge API pages with local edits ───────────────────────────────
  const mergedPages: TemplatePageContentDto[] = useMemo(() => {
    if (allApiPages.length === 0) return []
    return allApiPages.map((page) => ({
      ...page,
      contentJson: localEdits[page.templatePageId] ?? page.contentJson,
    }))
  }, [allApiPages, localEdits])

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
  const [createDraft] = useCreateDraftMutation()
  const [updateDraft] = useUpdateDraftMutation()

  const handleSaveChanges = async () => {
    if (!selectedTemplate?.id) {
      setStatusMessage({ type: "error", text: "Not connected to API. Please log in first." })
      return
    }

    const mainPages = buildDirtyPagesForTemplate(versionData?.pages)
    const compiledPages = buildDirtyPagesForTemplate(compiledVersionData?.pages)

    if (mainPages.length === 0 && compiledPages.length === 0) {
      setStatusMessage({ type: "error", text: "No changes to save." })
      return
    }

    setIsSaving(true)
    setStatusMessage(null)
    try {
      // Save to A4 templates (primary)
      if (mainPages.length > 0) {
        await saveActiveChanges({
          templateId: selectedTemplate.id,
          body: { pages: mainPages },
        }).unwrap()
      }
      if (compiledPages.length > 0 && compiledTemplate?.id) {
        await saveActiveChanges({
          templateId: compiledTemplate.id,
          body: { pages: compiledPages },
        }).unwrap()
      }

      // Mirror to A3 templates
      if (mainPages.length > 0 && a3ReceiptTemplate?.id) {
        const a3Pages = mapPagesToA3(mainPages, versionData?.pages, a3VersionData?.pages)
        if (a3Pages.length > 0) {
          await saveActiveChanges({
            templateId: a3ReceiptTemplate.id,
            body: { pages: a3Pages },
          }).unwrap()
        }
      }
      if (compiledPages.length > 0 && a3CompiledTemplate?.id) {
        const a3Pages = mapPagesToA3(compiledPages, compiledVersionData?.pages, a3CompiledVersionData?.pages)
        if (a3Pages.length > 0) {
          await saveActiveChanges({
            templateId: a3CompiledTemplate.id,
            body: { pages: a3Pages },
          }).unwrap()
        }
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
    if (!selectedTemplate?.id) {
      setStatusMessage({ type: "error", text: "Not connected to API. Please log in first." })
      return
    }

    const mainPages = buildDirtyPagesForTemplate(versionData?.pages)
    const compiledPages = buildDirtyPagesForTemplate(compiledVersionData?.pages)

    if (mainPages.length === 0 && compiledPages.length === 0) {
      setStatusMessage({ type: "error", text: "No changes to save as draft." })
      return
    }

    setIsSaving(true)
    setStatusMessage(null)
    try {
      // Drafts are only created for A4 templates; A3 is mirrored on publish/save
      if (mainPages.length > 0) {
        await ensureDraft(selectedTemplate.id)
        await updateDraft({
          templateId: selectedTemplate.id,
          body: { pages: mainPages },
        }).unwrap()
      }
      if (compiledPages.length > 0 && compiledTemplate?.id) {
        await ensureDraft(compiledTemplate.id)
        await updateDraft({
          templateId: compiledTemplate.id,
          body: { pages: compiledPages },
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
          <Button
            variant="outlineBrand"
            className="page-header-with-action-button"
            onClick={handleSaveAsDraft}
            disabled={isSaving || isLoading}
          >
            <Save className="page-header-with-action-icon" />
            Save as draft
          </Button>
          <Button
            variant="primary"
            className="page-header-with-action-button"
            onClick={handleSaveChanges}
            disabled={isSaving || isLoading}
          >
            Save changes
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
      />

      <TemplateContent
        templateType={templateType}
        pages={mergedPages}
        onPageChange={handlePageChange}
      />

      {selectedTemplate && (
        <VersionHistory
          templateIds={[
            selectedTemplate.id,
            ...(compiledTemplate ? [compiledTemplate.id] : []),
          ]}
        />
      )}
    </div>
  )
}
