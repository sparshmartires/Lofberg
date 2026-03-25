"use client"

import { useCallback, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { setStep, resetWizard, setDraftId } from "@/store/slices/reportWizardSlice"
import { useSaveDraftMutation } from "@/store/services/reportsApi"

export function useWizardNavigation() {
  const dispatch = useAppDispatch()
  const wizardState = useAppSelector((state) => state.reportWizard)
  const { currentStep, step1, step2, draftId, editingReportId } = wizardState
  const [stepError, setStepError] = useState<string | null>(null)

  const [saveDraftMutation, { isLoading: isSaving }] = useSaveDraftMutation()

  const totalSteps = 5

  const validateStep = useCallback((): string | null => {
    if (currentStep === 1) {
      if (!step1.customerName?.trim()) return "Please select or enter a customer name"
      if (!step1.salesRepresentativeId) return "Please select a sales representative"
      if (!step1.reportDate) return "Please set a report date"
      if (!step1.languageId) return "Please select a language"
    }
    if (currentStep === 2) {
      const hasData = step2.rows?.some((r) => r.quantityKg != null || r.currencyAmount != null)
      if (!hasData) return "Please upload data or enter at least one row"
    }
    return null
  }, [currentStep, step1, step2])

  const goNext = useCallback(() => {
    const error = validateStep()
    if (error) {
      setStepError(error)
      return
    }
    setStepError(null)
    if (currentStep < totalSteps) {
      dispatch(setStep(currentStep + 1))
    }
  }, [currentStep, dispatch, validateStep])

  const goBack = useCallback(() => {
    setStepError(null)
    if (currentStep > 1) {
      dispatch(setStep(currentStep - 1))
    }
  }, [currentStep, dispatch])

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= totalSteps) {
        dispatch(setStep(step))
      }
    },
    [dispatch]
  )

  const saveDraft = useCallback(async () => {
    try {
      const { isGenerating, generatedReportId, ...stateToSave } = wizardState
      const result = await saveDraftMutation({
        draftId: editingReportId ? null : draftId, // Always create new draft when editing a completed report
        wizardState: stateToSave,
      }).unwrap()

      // Only track draftId when NOT editing a completed report
      if (!editingReportId && result.draftId) {
        dispatch(setDraftId(result.draftId))
      }
      return true
    } catch {
      return false
    }
  }, [wizardState, draftId, editingReportId, saveDraftMutation, dispatch])

  const reset = useCallback(() => {
    dispatch(resetWizard())
  }, [dispatch])

  return {
    currentStep,
    totalSteps,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
    goNext,
    goBack,
    goToStep,
    saveDraft,
    isSaving,
    reset,
    stepError,
  }
}
