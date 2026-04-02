"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { updateStep5, setGenerating, setGeneratedReportId } from "@/store/slices/reportWizardSlice"
import { useGenerateReportMutation, usePreviewReportMutation, useUploadImageMutation } from "@/store/services/reportsApi"
import { OutputSize } from "../../types"
import { getCustomerLogoFile, setCustomerLogoFile } from "../../customerLogoRef"
import type { Step1Data } from "../../types"
import { useAutoDismiss } from "@/hooks/useAutoDismiss"

export function Step5OutputExport() {
  const dispatch = useAppDispatch()
  const { step1, step2, step3, step4, step5, isGenerating, draftId, editingReportId } = useAppSelector(
    (state) => state.reportWizard
  )

  const [generateReport] = useGenerateReportMutation()
  const [previewReport] = usePreviewReportMutation()
  const [uploadImage] = useUploadImageMutation()
  const [error, setError] = useState<string | null>(null)
  const [cachedResult, setCachedResult] = useState<{ fileUrl?: string; zipUrl?: string; dataHash?: string } | null>(null)
  useAutoDismiss(error, () => setError(null))

  // Navigation warning while generating — stored in ref so we can remove explicitly
  const beforeUnloadRef = useRef<((e: BeforeUnloadEvent) => void) | null>(null)

  useEffect(() => {
    if (!isGenerating) {
      if (beforeUnloadRef.current) {
        window.removeEventListener("beforeunload", beforeUnloadRef.current)
        beforeUnloadRef.current = null
      }
      return
    }
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "The report/receipt is being generated. If you leave this page your progress will be lost."
    }
    beforeUnloadRef.current = handler
    window.addEventListener("beforeunload", handler)
    return () => {
      window.removeEventListener("beforeunload", handler)
      beforeUnloadRef.current = null
    }
  }, [isGenerating])

  const handleJpegToggle = useCallback(
    (checked: boolean) => {
      dispatch(updateStep5({ generateJpegs: checked }))
    },
    [dispatch]
  )

  const handleSizeChange = useCallback(
    (size: OutputSize) => {
      dispatch(updateStep5({ outputSize: size }))
    },
    [dispatch]
  )

  const resolveStep1WithLogo = useCallback(async (): Promise<Step1Data> => {
    const logoFile = getCustomerLogoFile()
    if (logoFile && step1.customerLogoUrl?.startsWith("blob:")) {
      const { url } = await uploadImage({ file: logoFile }).unwrap()
      setCustomerLogoFile(null)
      return { ...step1, customerLogoUrl: url }
    }
    return step1
  }, [step1, uploadImage])

  const validate = (): string | null => {
    const missing: string[] = []
    if (!step1.customerId && !step1.customerName) missing.push("Customer (Step 1)")
    if (!step1.salesRepresentativeId) missing.push("Salesperson (Step 1)")
    if (!step1.reportDate) missing.push("Report date (Step 1)")
    if (!step1.languageId) missing.push("Language (Step 1)")
    if (!step2.rows || step2.rows.length === 0) missing.push("Certification data (Step 2)")
    if (missing.length > 0) return `Missing required fields: ${missing.join(", ")}`
    return null
  }

  // Simple hash of wizard data to detect changes
  const getDataHash = useCallback(() => {
    return JSON.stringify({ step1, step2: { rows: step2.rows, timePeriod: step2.timePeriod }, step3, step4, step5 })
  }, [step1, step2, step3, step4, step5])

  const handleGenerate = useCallback(async () => {
    setError(null)
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    // Use cached result if data hasn't changed since last generate
    const currentHash = getDataHash()
    if (cachedResult?.dataHash === currentHash && cachedResult.fileUrl) {
      window.open(cachedResult.fileUrl, "_blank")
      return
    }

    dispatch(setGenerating(true))
    try {
      const resolvedStep1 = await resolveStep1WithLogo()
      const result = await generateReport({
        draftId: editingReportId ? undefined : draftId,
        step1: resolvedStep1,
        step2: { rows: step2.rows, timePeriod: step2.timePeriod },
        step3,
        step4,
        step5,
      }).unwrap()
      console.log("[Generate] Result:", { reportId: result.reportId, fileUrl: result.generatedFileUrl, zipUrl: result.jpegZipUrl })
      dispatch(setGeneratedReportId(result.reportId))

      // Cache the result for reuse
      setCachedResult({ fileUrl: result.generatedFileUrl ?? undefined, zipUrl: result.jpegZipUrl ?? undefined, dataHash: currentHash })

      // Remove beforeunload listener explicitly before opening new tabs
      if (beforeUnloadRef.current) {
        window.removeEventListener("beforeunload", beforeUnloadRef.current)
        beforeUnloadRef.current = null
      }
      dispatch(setGenerating(false))

      // Open generated PDF in new tab
      if (result.generatedFileUrl) {
        window.open(result.generatedFileUrl, "_blank")
      }

      // Download JPEG zip if generated
      if (result.jpegZipUrl) {
        const customerName = step1.customerName || "report"
        const dateStr = step1.reportDate?.replace(/-/g, "") || new Date().toISOString().slice(0, 10).replace(/-/g, "")
        const link = document.createElement("a")
        link.href = result.jpegZipUrl
        link.download = `${customerName} - ${dateStr}.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
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
  }, [dispatch, generateReport, resolveStep1WithLogo, draftId, editingReportId, step1, step2, step3, step4, step5, getDataHash, cachedResult])

  const handlePreview = useCallback(async () => {
    setError(null)
    const validationError = validate()
    if (validationError) { setError(validationError); return }

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
        const byteChars = atob(result.previewPdfBase64)
        const byteArray = new Uint8Array(byteChars.length)
        for (let i = 0; i < byteChars.length; i++) {
          byteArray[i] = byteChars.charCodeAt(i)
        }
        const blob = new Blob([byteArray], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        window.open(url, "_blank")
        setTimeout(() => URL.revokeObjectURL(url), 60000)
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
  }, [dispatch, previewReport, resolveStep1WithLogo, step1, step2, step3, step4, step5])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1F1F1F]">Generate</h2>
      </div>

      {/* Receipt JPEGs checkbox */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={step5.generateJpegs}
            onCheckedChange={(checked) => handleJpegToggle(Boolean(checked))}
            disabled={isGenerating}
          />
          <label className="text-sm text-[#1F1F1F] cursor-pointer">
            Receipt JPEGs
          </label>
        </div>

        {step5.generateJpegs && (
          <div className="ml-6 space-y-2">
            <label className="text-sm font-medium text-[#1F1F1F]">Receipt size</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="receiptSize"
                  checked={step5.outputSize === OutputSize.A4}
                  onChange={() => handleSizeChange(OutputSize.A4)}
                  className="w-4 h-4 accent-primary"
                  disabled={isGenerating}
                />
                <span className="text-sm">A4</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="receiptSize"
                  checked={step5.outputSize === OutputSize.A3}
                  onChange={() => handleSizeChange(OutputSize.A3)}
                  className="w-4 h-4 accent-primary"
                  disabled={isGenerating}
                />
                <span className="text-sm">A3</span>
              </label>
            </div>
          </div>
        )}
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
