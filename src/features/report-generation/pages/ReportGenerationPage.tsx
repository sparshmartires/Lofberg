"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { loadDraft, resetWizard } from "@/store/slices/reportWizardSlice"
import { useGetDraftQuery, useGetReportWizardStateQuery } from "@/store/services/reportsApi"
import { ReportWizard } from "../components/ReportWizard"
import { StepProgressTracker } from "../components/StepProgressTracker"

export function ReportGenerationPage() {
  const dispatch = useAppDispatch()
  const currentStep = useAppSelector((state) => state.reportWizard.currentStep)
  const searchParams = useSearchParams()
  const draftId = searchParams.get("draftId")
  const reportId = searchParams.get("reportId")

  const { data: draftData } = useGetDraftQuery(
    { id: draftId! },
    { skip: !draftId }
  )

  const { data: reportData } = useGetReportWizardStateQuery(
    { id: reportId! },
    { skip: !reportId }
  )

  // Reset wizard on mount (new report)
  useEffect(() => {
    if (!draftId && !reportId) {
      dispatch(resetWizard())
    }
  }, [draftId, reportId, dispatch])

  // Load draft if resuming
  useEffect(() => {
    if (draftData?.wizardState) {
      dispatch(loadDraft({ ...draftData.wizardState, draftId }))
    }
  }, [draftData, draftId, dispatch])

  // Load report wizard state if editing
  useEffect(() => {
    if (reportData?.wizardState) {
      dispatch(loadDraft({ ...reportData.wizardState, editingReportId: reportId }))
    }
  }, [reportData, reportId, dispatch])

  const isEditing = !!reportId

  return (
    <div className="min-h-screen bg-background py-10">
      {/* Page Header + Progress Tracker */}
      <div className="flex flex-col min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between gap-4 mb-8">
        <div className="shrink-0">
          <h1 className="text-[32px] font-semibold text-[#1F1F1F] leading-tight">
            {isEditing ? "Edit report" : "Generate"}
          </h1>
          <p className="text-sm text-[#747474] mt-1">
            {isEditing
              ? "Edit and regenerate this report"
              : "Create sustainability reports and receipts for customers"}
          </p>
        </div>

        <div className="w-full min-[900px]:max-w-[480px]">
          <StepProgressTracker currentStep={currentStep} />
        </div>
      </div>

      {/* Wizard */}
      <ReportWizard />
    </div>
  )
}
