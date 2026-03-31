"use client"

import { useCallback } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { updateStep3 } from "@/store/slices/reportWizardSlice"
import { ReportType } from "../../types"

export function Step3ReportType() {
  const dispatch = useAppDispatch()
  const step3 = useAppSelector((state) => state.reportWizard.step3)

  const handleTypeChange = useCallback(
    (type: ReportType) => {
      dispatch(updateStep3({ reportType: type }))
    },
    [dispatch]
  )

  const handleCompiledReceiptChange = useCallback(
    (checked: boolean) => {
      dispatch(updateStep3({ generateCompiledReceipt: checked }))
    },
    [dispatch]
  )

  const handleMediaScreensChange = useCallback(
    (checked: boolean) => {
      dispatch(updateStep3({ generateMediaScreens: checked }))
    },
    [dispatch]
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1F1F1F]">Report type</h2>
      </div>

      {/* Output type selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#1F1F1F]">
          Choose output type <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-1 min-[500px]:grid-cols-2 gap-4">
          <label
            className={`flex items-center gap-3 px-5 py-4 rounded-[16px] border cursor-pointer transition-colors ${
              step3.reportType === ReportType.ReportPlusReceipt
                ? "border-primary bg-[#F5F0FF]"
                : "border-[#F0F0F0] bg-white hover:bg-[#FAFAFA]"
            }`}
          >
            <input
              type="radio"
              name="reportType"
              checked={step3.reportType === ReportType.ReportPlusReceipt}
              onChange={() => handleTypeChange(ReportType.ReportPlusReceipt)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm font-medium text-[#1F1F1F]">Report + receipt</span>
          </label>

          <label
            className={`flex items-center gap-3 px-5 py-4 rounded-[16px] border cursor-pointer transition-colors ${
              step3.reportType === ReportType.ReceiptOnly
                ? "border-primary bg-[#F5F0FF]"
                : "border-[#F0F0F0] bg-white hover:bg-[#FAFAFA]"
            }`}
          >
            <input
              type="radio"
              name="reportType"
              checked={step3.reportType === ReportType.ReceiptOnly}
              onChange={() => handleTypeChange(ReportType.ReceiptOnly)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm font-medium text-[#1F1F1F]">Receipt only</span>
          </label>
        </div>
      </div>

      {/* Add-ons */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#1F1F1F]">Add ons</label>

        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={step3.generateCompiledReceipt}
              onCheckedChange={(checked) => handleCompiledReceiptChange(Boolean(checked))}
            />
            <label className="text-sm text-[#1F1F1F] cursor-pointer">
              Generate compiled receipt
            </label>
          </div>

          <div className="flex items-center gap-2" title="TBD">
            <Checkbox
              checked={false}
              disabled
            />
            <label className="text-sm text-[#9CA3AF] cursor-not-allowed">
              Generate media screens (TBD)
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
