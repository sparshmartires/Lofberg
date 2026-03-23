"use client"

import { useCallback } from "react"
import { ChevronLeft, ChevronRight, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWizardNavigation } from "../hooks/useWizardNavigation"
import { ReportSummary } from "./ReportSummary"
import { Step1CustomerDetails } from "./steps/Step1CustomerDetails"
import { Step2DataSource } from "./steps/Step2DataSource"
import { Step3ReportType } from "./steps/Step3ReportType"
import { Step4ContentSelection } from "./steps/Step4ContentSelection"
import { Step5OutputExport } from "./steps/Step5OutputExport"

export function ReportWizard() {
  const {
    currentStep,
    isFirstStep,
    isLastStep,
    goNext,
    goBack,
    saveDraft,
    isSaving,
    stepError,
  } = useWizardNavigation()

  const handleSaveDraft = useCallback(async () => {
    await saveDraft()
  }, [saveDraft])

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Left: Step Content */}
        <div className="rounded-[24px] bg-white shadow-sm p-6 min-[700px]:p-8">
          {currentStep === 1 && <Step1CustomerDetails />}
          {currentStep === 2 && <Step2DataSource />}
          {currentStep === 3 && <Step3ReportType />}
          {currentStep === 4 && <Step4ContentSelection />}
          {currentStep === 5 && <Step5OutputExport />}
        </div>

        {/* Right: Summary */}
        <div className="hidden lg:block">
          <ReportSummary />
        </div>
      </div>

      {/* Validation error */}
      {stepError && (
        <p className="text-sm text-red-500 text-center">{stepError}</p>
      )}

      {/* Navigation Bar — same width as content grid above */}
      <div className="rounded-[24px] bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        {/* Back — same variant/size as Save as draft */}
        <Button
          type="button"
          variant="outlineBrand"
          onClick={goBack}
          disabled={isFirstStep}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outlineBrand"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save as draft"}
          </Button>

          {!isLastStep && (
            <Button
              type="button"
              variant="primary"
              onClick={goNext}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
