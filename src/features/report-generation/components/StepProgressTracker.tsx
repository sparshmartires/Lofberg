"use client"

import { STEP_LABELS } from "../types"

interface StepProgressTrackerProps {
  currentStep: number
  totalSteps?: number
}

export function StepProgressTracker({
  currentStep,
  totalSteps = 5,
}: StepProgressTrackerProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="flex items-center gap-4 rounded-[16px] bg-white border border-[#F0F0F0] px-6 py-3 shadow-sm">
      <span className="text-sm font-medium text-[#1F1F1F] whitespace-nowrap">
        Step {currentStep} of {totalSteps}
      </span>

      <div className="flex-1 h-[6px] rounded-full bg-[#E5E7EB] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#2E7D32] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="text-sm text-[#1F1F1F] whitespace-nowrap hidden min-[600px]:block">
        {STEP_LABELS[currentStep - 1]}
      </span>
    </div>
  )
}
