"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  useGetTemplateVersionsQuery,
  useCreateDraftMutation,
  usePublishDraftMutation,
  useRollbackVersionMutation,
  useDeleteDraftMutation,
  VersionStatus,
} from "@/store/services/templatesApi"

interface VersionHistoryProps {
  templateId: string
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

export default function VersionHistory({ templateId }: VersionHistoryProps) {
  const { data: versions = [], isLoading } = useGetTemplateVersionsQuery({ templateId })
  const [createDraft] = useCreateDraftMutation()
  const [publishDraft] = usePublishDraftMutation()
  const [rollbackVersion] = useRollbackVersionMutation()
  const [deleteDraft] = useDeleteDraftMutation()
  const [isCreating, setIsCreating] = useState(false)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  const handleCreateVersion = async () => {
    setIsCreating(true)
    try {
      await createDraft({ templateId }).unwrap()
      await publishDraft({ templateId }).unwrap()
    } catch (err) {
      console.error("Failed to create version:", err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleRestore = async (versionId: string) => {
    if (!window.confirm("Are you sure you want to restore this version? The current active version will be archived.")) {
      return
    }
    setActionInProgress(versionId)
    try {
      await rollbackVersion({ templateId, versionId }).unwrap()
    } catch (err) {
      console.error("Failed to restore version:", err)
    } finally {
      setActionInProgress(null)
    }
  }

  const handlePublishDraft = async () => {
    setActionInProgress("publish")
    try {
      await publishDraft({ templateId }).unwrap()
    } catch (err) {
      console.error("Failed to publish draft:", err)
    } finally {
      setActionInProgress(null)
    }
  }

  const handleDeleteDraft = async () => {
    if (!window.confirm("Are you sure you want to delete this draft?")) return
    setActionInProgress("delete")
    try {
      await deleteDraft({ templateId }).unwrap()
    } catch (err) {
      console.error("Failed to delete draft:", err)
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
      <div className="flex items-center justify-between mb-6 max-[649px]:flex-col max-[649px]:items-start max-[649px]:gap-4">
        <h3 className="text-lg font-medium text-[#1F1F1F]">Version history</h3>
        <Button
          variant="primary"
          className="page-header-with-action-button"
          onClick={handleCreateVersion}
          disabled={isCreating}
        >
          <Plus className="h-4 w-4 mr-2" />
          {isCreating ? "Creating..." : "Create version"}
        </Button>
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
                className="flex items-center justify-between p-4 rounded-xl border border-[#EDEDED] max-[799px]:flex-col max-[799px]:items-start max-[799px]:gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-medium text-[#1F1F1F] truncate">
                    Version {version.versionNumber} — {version.versionName}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${badge.classes}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 max-[799px]:w-full max-[799px]:justify-between">
                  <span className="text-sm text-[#8A8A8A] whitespace-nowrap">
                    {version.publishedAt
                      ? `Published on ${formatDate(version.publishedAt)} by ${version.publishedByUserName ?? "—"}`
                      : `Created on ${formatDate(version.createdAt)} by ${version.createdByUserName}`}
                  </span>

                  <div className="flex gap-2">
                    {version.status === VersionStatus.Archived && (
                      <Button
                        variant="outlineBrand"
                        size="sm"
                        onClick={() => handleRestore(version.id)}
                        disabled={isDisabled}
                      >
                        {actionInProgress === version.id ? "Restoring..." : "Restore"}
                      </Button>
                    )}

                    {version.status === VersionStatus.Draft && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handlePublishDraft}
                          disabled={isDisabled}
                        >
                          {actionInProgress === "publish" ? "Publishing..." : "Publish"}
                        </Button>
                        <Button
                          variant="outlineBrand"
                          size="sm"
                          onClick={handleDeleteDraft}
                          disabled={isDisabled}
                        >
                          {actionInProgress === "delete" ? "Deleting..." : "Delete"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
