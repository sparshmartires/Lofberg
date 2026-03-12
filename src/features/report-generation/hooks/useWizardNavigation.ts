"use client"

import { useCallback } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { setStep, resetWizard, setDraftId } from "@/store/slices/reportWizardSlice"
import { useSaveDraftMutation } from "@/store/services/reportsApi"

export function useWizardNavigation() {
  const dispatch = useAppDispatch()
  const wizardState = useAppSelector((state) => state.reportWizard)
  const { currentStep, draftId } = wizardState

  const [saveDraftMutation, { isLoading: isSaving }] = useSaveDraftMutation()

  const totalSteps = 5

  const goNext = useCallback(() => {
    if (currentStep < totalSteps) {
      dispatch(setStep(currentStep + 1))
    }
  }, [currentStep, dispatch])

  const goBack = useCallback(() => {
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
        draftId,
        wizardState: stateToSave,
      }).unwrap()

      if (result.draftId) {
        dispatch(setDraftId(result.draftId))
      }
      return true
    } catch {
      return false
    }
  }, [wizardState, draftId, saveDraftMutation, dispatch])

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
  }
}
