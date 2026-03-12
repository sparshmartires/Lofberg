"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAppDispatch } from "@/store/hooks"
import { loadDraft, resetWizard } from "@/store/slices/reportWizardSlice"
import { useGetDraftQuery } from "@/store/services/reportsApi"
import { ReportWizard } from "../components/ReportWizard"

export function ReportGenerationPage() {
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const draftId = searchParams.get("draftId")

  const { data: draftData } = useGetDraftQuery(
    { id: draftId! },
    { skip: !draftId }
  )

  // Reset wizard on mount (new report)
  useEffect(() => {
    if (!draftId) {
      dispatch(resetWizard())
    }
  }, [draftId, dispatch])

  // Load draft if resuming
  useEffect(() => {
    if (draftData?.wizardState) {
      dispatch(loadDraft({ ...draftData.wizardState, draftId }))
    }
  }, [draftData, draftId, dispatch])

  return (
    <div className="min-h-screen bg-background py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-[32px] font-semibold text-[#1F1F1F] leading-tight">
          Generate report/receipt
        </h1>
        <p className="text-sm text-[#747474] mt-1">
          Create sustainability reports and receipts for customers
        </p>
      </div>

      {/* Wizard */}
      <ReportWizard />
    </div>
  )
}
