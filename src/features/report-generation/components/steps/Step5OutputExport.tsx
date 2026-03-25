"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
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
import { useGenerateReportMutation, usePreviewReportMutation, useUploadImageMutation } from "@/store/services/reportsApi"
import { OutputFormat, OutputSize, ReportType } from "../../types"
import { getCustomerLogoFile, setCustomerLogoFile } from "../../customerLogoRef"
import type { Step1Data } from "../../types"

const fieldClass =
  "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-body focus:ring-0 focus:outline-none"

export function Step5OutputExport() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { step1, step2, step3, step4, step5, isGenerating, draftId, editingReportId } = useAppSelector(
    (state) => state.reportWizard
  )

  const [generateReport] = useGenerateReportMutation()
  const [previewReport] = usePreviewReportMutation()
  const [uploadImage] = useUploadImageMutation()
  const [error, setError] = useState<string | null>(null)

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

  const resolveStep1WithLogo = useCallback(async (): Promise<Step1Data> => {
    const logoFile = getCustomerLogoFile()
    // If there's a logo file but the URL is a blob: URL, upload it first
    if (
      logoFile &&
      step1.customerLogoUrl &&
      step1.customerLogoUrl.startsWith("blob:")
    ) {
      const { url } = await uploadImage({ file: logoFile }).unwrap()
      setCustomerLogoFile(null)
      return { ...step1, customerLogoUrl: url }
    }
    return step1
  }, [step1, uploadImage])

  const handleGenerate = useCallback(async () => {
    setError(null)

    if (!step1.salesRepresentativeId) {
      setError("Please select a sales representative in Step 1.")
      return
    }
    if (!step2.rows || step2.rows.length === 0) {
      setError("Please add certification data in Step 2.")
      return
    }

    dispatch(setGenerating(true))
    try {
      const resolvedStep1 = await resolveStep1WithLogo()
      const result = await generateReport({
        draftId: editingReportId ? undefined : draftId, // Always create new report when editing a completed report
        step1: resolvedStep1,
        step2: { rows: step2.rows, timePeriod: step2.timePeriod },
        step3,
        step4,
        step5,
      }).unwrap()
      dispatch(setGeneratedReportId(result.reportId))

      // Open the generated PDF in a new tab
      if (result.generatedFileUrl) {
        window.open(result.generatedFileUrl, "_blank")
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: { error?: string } }).data?.error ?? "Report generation failed")
          : "Report generation failed. Please try again."
      setError(message)
    } finally {
      dispatch(setGenerating(false))
    }
  }, [dispatch, generateReport, resolveStep1WithLogo, draftId, editingReportId, step2, step3, step4, step5, step1.salesRepresentativeId])

  const handlePreview = useCallback(async () => {
    setError(null)

    if (!step1.salesRepresentativeId) {
      setError("Please select a sales representative in Step 1.")
      return
    }
    if (!step2.rows || step2.rows.length === 0) {
      setError("Please add certification data in Step 2.")
      return
    }

    dispatch(setGenerating(true))
    try {
      const resolvedStep1 = await resolveStep1WithLogo()
      const result = await previewReport({
        step1: resolvedStep1,
        step2: { rows: step2.rows, timePeriod: step2.timePeriod },
        step3,
        step4,
        step5,
      }).unwrap()

      if (result.previewPdfBase64) {
        // Convert base64 to blob and open in new tab
        const byteChars = atob(result.previewPdfBase64)
        const byteArray = new Uint8Array(byteChars.length)
        for (let i = 0; i < byteChars.length; i++) {
          byteArray[i] = byteChars.charCodeAt(i)
        }
        const blob = new Blob([byteArray], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        window.open(url, "_blank")
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: { error?: string } }).data?.error ?? "Preview generation failed")
          : "Preview generation failed. Please try again."
      setError(message)
    } finally {
      dispatch(setGenerating(false))
    }
  }, [dispatch, previewReport, resolveStep1WithLogo, step2, step3, step4, step5, step1.salesRepresentativeId])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1F1F1F]">Generate</h2>
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
        </div>
      </div>

      {error && (
        <div className="rounded-[12px] bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

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
            {isGenerating ? "Generating..." : "Generate"}
          </Button>

        </div>
      </div>
    </div>
  )
}
