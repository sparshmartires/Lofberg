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
    <div className="rounded-[16px] bg-white border border-[#F0F0F0] px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[#1F1F1F] whitespace-nowrap">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-[#1F1F1F] whitespace-nowrap">
          {STEP_LABELS[currentStep - 1]}
        </span>
      </div>

      <div className="w-full h-[6px] rounded-full bg-[#E5E7EB] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#2E7D32] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
