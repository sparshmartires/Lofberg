"use client"

import { useState } from "react"
import { useAutoDismiss } from "@/hooks/useAutoDismiss"
import { ExternalLink, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserFeedbackDialog } from "@/components/ui/user-feedback-dialog"
import {
  useGetTemplateVersionsQuery,
  useDeleteDraftMutation,
  VersionStatus,
} from "@/store/services/templatesApi"

interface VersionHistoryProps {
  templateIds: string[]
  label?: string
  onOpenVersion?: (versionId: string) => void
}

const STATUS_BADGE: Record<VersionStatus, { label: string; classes: string }> = {
  [VersionStatus.Active]: {
    label: "Active",
    classes: "bg-green-100 text-green-800",
  },
  [VersionStatus.Draft]: {
    label: "Draft",
    classes: "bg-amber-100 text-amber-800",
  },
  [VersionStatus.Archived]: {
    label: "Archived",
    classes: "bg-gray-100 text-gray-600",
  },
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "—"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function VersionHistory({ templateIds, label, onOpenVersion }: VersionHistoryProps) {
  const primaryId = templateIds[0]
  const { data: versions = [], isLoading } = useGetTemplateVersionsQuery({ templateId: primaryId })

  const [deleteDraft] = useDeleteDraftMutation()
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  useAutoDismiss(errorMessage, () => setErrorMessage(null))

  const handleDeleteDraft = async () => {
    setDeleteConfirmOpen(false)
    setActionInProgress("delete")
    setErrorMessage(null)
    try {
      for (const id of templateIds) {
        await deleteDraft({ templateId: id }).unwrap()
      }
    } catch (err) {
      console.error("Failed to delete draft:", err)
      setErrorMessage("Failed to delete draft. Please try again.")
    } finally {
      setActionInProgress(null)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-[28px] border border-[#EDEDED] bg-white p-4 sm:p-6 lg:p-8 mt-[20px]">
        <div className="text-sm text-[#8A8A8A]">Loading version history...</div>
      </div>
    )
  }

  return (
    <div className="rounded-[28px] border border-[#EDEDED] bg-white p-4 sm:p-6 lg:p-8 mt-[20px]">
      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-[#1F1F1F]">{label ?? "Version history"}</h3>
      </div>

      {versions.length === 0 ? (
        <p className="text-sm text-[#8A8A8A]">No versions yet.</p>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => {
            const badge = STATUS_BADGE[version.status] ?? STATUS_BADGE[VersionStatus.Archived]
            const isDisabled = actionInProgress !== null

            return (
              <div
                key={version.id}
                data-testid="template-item"
                className="flex items-center justify-between p-4 rounded-xl border border-[#EDEDED] max-[799px]:flex-col max-[799px]:items-start max-[799px]:gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-wrap">
                  <span className="text-sm font-medium text-[#1F1F1F] break-all">
                    Version {version.versionNumber} — {version.versionName}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${badge.classes}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 max-[799px]:w-full max-[799px]:flex-wrap">
                  <span className="text-sm text-[#8A8A8A]">
                    {version.publishedAt
                      ? `Published on ${formatDate(version.publishedAt)} by ${version.publishedByUserName ?? "—"}`
                      : `Created on ${formatDate(version.createdAt)} by ${version.createdByUserName}`}
                  </span>

                  <div className="flex gap-2 flex-wrap">
                    {/* All versions get an Open button */}
                    <Button
                      variant="outlineBrand"
                      size="sm"
                      onClick={() => onOpenVersion?.(version.id)}
                      disabled={isDisabled}
                      title="Open in editor"
                    >
                      <ExternalLink className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Open</span>
                    </Button>

                    {/* Drafts also get a Delete button */}
                    {version.status === VersionStatus.Draft && (
                      <Button
                        variant="outlineBrand"
                        size="sm"
                        onClick={() => setDeleteConfirmOpen(true)}
                        disabled={isDisabled}
                        title="Delete draft"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">
                          {actionInProgress === "delete" ? "Deleting..." : "Delete"}
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <UserFeedbackDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        type="error"
        title="Delete draft"
        description="Are you sure you want to delete this draft? This action cannot be undone."
        primaryActionLabel="Delete"
        onPrimaryAction={handleDeleteDraft}
        secondaryActionLabel="Cancel"
        onSecondaryAction={() => setDeleteConfirmOpen(false)}
      />
    </div>
  )
}
