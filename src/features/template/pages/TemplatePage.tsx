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
  useSaveActiveChangesMutation,
  useCreateDraftMutation,
  useUpdateDraftMutation,
  TemplateType,
  TemplateSize,
  type TemplatePageContentDto,
  type UpdatePageContentRequest,
} from "@/store/services/templatesApi"

export function TemplatePage() {
  const [templateType, setTemplateType] = useState("report-a4")
  const [language, setLanguage] = useState("en")
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // ── Fetch templates ────────────────────────────────────────────────
  const { data: templates, isLoading: isLoadingTemplates, error: templatesError } = useGetTemplatesQuery()

  const selectedTemplate = useMemo(
    () =>
      templates?.find((t) =>
        templateType === "report-a4"
          ? t.type === TemplateType.Report && t.size === TemplateSize.A4
          : t.type === TemplateType.Receipt && t.size === TemplateSize.A4
      ),
    [templates, templateType]
  )

  // ── Fetch active version with pages ────────────────────────────────
  const { data: versionData, isLoading: isLoadingVersion } = useGetTemplateVersionQuery(
    {
      templateId: selectedTemplate?.id ?? "",
      versionId: selectedTemplate?.activeVersion?.id ?? "",
    },
    { skip: !selectedTemplate?.id || !selectedTemplate?.activeVersion?.id }
  )

  // ── Initialize local edits from fetched version ────────────────────
  useEffect(() => {
    if (versionData?.pages) {
      const initial: Record<string, string> = {}
      for (const page of versionData.pages) {
        if (page.contentJson) {
          initial[page.templatePageId] = page.contentJson
        }
      }
      setLocalEdits(initial)
    }
  }, [versionData])

  // ── Merge API pages with local edits ───────────────────────────────
  const mergedPages: TemplatePageContentDto[] = useMemo(() => {
    if (!versionData?.pages) return []
    return versionData.pages.map((page) => ({
      ...page,
      contentJson: localEdits[page.templatePageId] ?? page.contentJson,
    }))
  }, [versionData, localEdits])

  // ── Page change handler ────────────────────────────────────────────
  const handlePageChange = useCallback(
    (templatePageId: string, contentJson: string) => {
      setLocalEdits((prev) => ({ ...prev, [templatePageId]: contentJson }))
    },
    []
  )

  // ── Build dirty pages for API ──────────────────────────────────────
  const buildDirtyPages = useCallback((): UpdatePageContentRequest[] => {
    return Object.entries(localEdits).map(([templatePageId, contentJson]) => ({
      templatePageId,
      contentJson,
    }))
  }, [localEdits])

  // ── Mutations ──────────────────────────────────────────────────────
  const [saveActiveChanges] = useSaveActiveChangesMutation()
  const [createDraft] = useCreateDraftMutation()
  const [updateDraft] = useUpdateDraftMutation()

  const handleSaveChanges = async () => {
    if (!selectedTemplate?.id) {
      setStatusMessage({ type: "error", text: "Not connected to API. Please log in first." })
      return
    }
    const pages = buildDirtyPages()
    if (pages.length === 0) {
      setStatusMessage({ type: "error", text: "No changes to save." })
      return
    }

    setIsSaving(true)
    setStatusMessage(null)
    try {
      await saveActiveChanges({
        templateId: selectedTemplate.id,
        body: { pages },
      }).unwrap()
      setStatusMessage({ type: "success", text: "Changes saved successfully." })
    } catch (err) {
      console.error("Failed to save changes:", err)
      setStatusMessage({ type: "error", text: "Failed to save changes. Check console for details." })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAsDraft = async () => {
    if (!selectedTemplate?.id) {
      setStatusMessage({ type: "error", text: "Not connected to API. Please log in first." })
      return
    }
    const pages = buildDirtyPages()
    if (pages.length === 0) {
      setStatusMessage({ type: "error", text: "No changes to save as draft." })
      return
    }

    setIsSaving(true)
    setStatusMessage(null)
    try {
      await createDraft({ templateId: selectedTemplate.id }).unwrap()
      await updateDraft({
        templateId: selectedTemplate.id,
        body: { pages },
      }).unwrap()
      setStatusMessage({ type: "success", text: "Draft saved successfully." })
    } catch (err) {
      console.error("Failed to save as draft:", err)
      setStatusMessage({ type: "error", text: "Failed to save draft. Check console for details." })
    } finally {
      setIsSaving(false)
    }
  }

  const isLoading = isLoadingTemplates || isLoadingVersion

  return (
    <div className="min-h-screen bg-background py-10">
      {/* Header */}
      <div className="page-header-with-action">
        <div>
          <h1 className="page-header-with-action-title">
            Report / Receipt template
          </h1>
          <p className="page-header-with-action-description">
            Configure and customize report and receipt templates
          </p>
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
        onTemplateTypeChange={setTemplateType}
        onLanguageChange={setLanguage}
      />

      <TemplateContent
        templateType={templateType}
        pages={mergedPages}
        onPageChange={handlePageChange}
      />

      {selectedTemplate && <VersionHistory templateId={selectedTemplate.id} />}
    </div>
  )
}
