"use client"

import { useCallback } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { updateStep5, setGenerating, setGeneratedReportId } from "@/store/slices/reportWizardSlice"
import { useGenerateReportMutation } from "@/store/services/reportsApi"
import { OutputFormat, OutputSize, ReportType } from "../../types"

const fieldClass =
  "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-body focus:ring-0 focus:outline-none"

export function Step5OutputExport() {
  const dispatch = useAppDispatch()
  const { step1, step2, step3, step4, step5, isGenerating, draftId } = useAppSelector(
    (state) => state.reportWizard
  )

  const [generateReport] = useGenerateReportMutation()

  const isReceiptOnly = step3.reportType === ReportType.ReceiptOnly

  const handleFormatChange = useCallback(
    (val: string) => {
      dispatch(updateStep5({ outputFormat: Number(val) as OutputFormat }))
    },
    [dispatch]
  )

  const handleSizeChange = useCallback(
    (val: string) => {
      dispatch(updateStep5({ outputSize: Number(val) as OutputSize }))
    },
    [dispatch]
  )

  const handleGenerate = useCallback(async () => {
    dispatch(setGenerating(true))
    try {
      const result = await generateReport({
        draftId,
        step1,
        step2: { rows: step2.rows },
        step3,
        step4,
        step5,
      }).unwrap()
      dispatch(setGeneratedReportId(result.reportId))
    } catch {
      // Error handling
    } finally {
      dispatch(setGenerating(false))
    }
  }, [dispatch, generateReport, draftId, step1, step2, step3, step4, step5])

  const handlePreview = useCallback(() => {
    // In a real implementation, this would open a preview in a new tab
    window.open(`/api/reports/preview`, "_blank")
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1F1F1F]">Output & export</h2>
      </div>

      <div className="grid grid-cols-1 min-[500px]:grid-cols-2 gap-6">
        {/* Output Format */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1F1F1F]">Output format</label>
          <Select
            value={String(step5.outputFormat)}
            onValueChange={handleFormatChange}
          >
            <SelectTrigger className={fieldClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={String(OutputFormat.PDF)}>PDF</SelectItem>
              <SelectItem value={String(OutputFormat.JPEG)}>JPEG</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-[#9CA3AF]">
            PDF or JPEG format available for all outputs
          </p>
        </div>

        {/* Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1F1F1F]">Size</label>
          {isReceiptOnly ? (
            <Select
              value={String(step5.outputSize)}
              onValueChange={handleSizeChange}
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(OutputSize.A4)}>A4</SelectItem>
                <SelectItem value={String(OutputSize.A3)}>A3</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className={`${fieldClass} flex items-center text-[#1F1F1F]`}>
              A4 (default)
            </div>
          )}
          <p className="text-xs text-[#9CA3AF]">
            {isReceiptOnly
              ? "Select A4, A3, or both sizes for receipts"
              : "Reports are generated in A4 format only"}
          </p>
        </div>
      </div>

      {/* Generate area */}
      <div className="rounded-[24px] bg-[#FAFAFA] border border-[#F0F0F0] p-8 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-[#F3E8FF] flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div>
          <p className="text-lg font-semibold text-[#2E7D32]">Ready to generate</p>
          <p className="text-sm text-[#747474]">
            Your report is configured and ready to be generated
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            type="button"
            variant="outlineBrand"
            onClick={handlePreview}
            disabled={isGenerating}
          >
            Preview
          </Button>

          <Button
            type="button"
            variant="accent"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate and download"}
          </Button>
        </div>
      </div>
    </div>
  )
}
