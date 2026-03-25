"use client"

import { useCallback, useMemo } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { updateStep4 } from "@/store/slices/reportWizardSlice"
import { AddOnBlockSelector } from "../AddOnBlockSelector"
import { AddOnBlock, FT_PREMIER_TYPES, CERTIFICATION_LABELS, QuantityUnit } from "../../types"
import {
  useGetSegmentConversionsBySegmentQuery,
  useGetCO2ConversionsQuery,
} from "@/store/services/conversionLogicApi"
import {
  useGetTemplatesQuery,
  useGetTemplateVersionQuery,
  PageType,
} from "@/store/services/templatesApi"
import { parseContentJson, type IncreasingImpactContent } from "@/features/template/types"

const fieldClass =
  "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-body focus:ring-0 focus:outline-none"

export function Step4ContentSelection() {
  const dispatch = useAppDispatch()
  const step4 = useAppSelector((state) => state.reportWizard.step4)
  const step2 = useAppSelector((state) => state.reportWizard.step2)
  const step1 = useAppSelector((state) => state.reportWizard.step1)

  const segmentId = step1.customerSegmentId

  // Fetch templates to get active version's impact block names
  const { data: templates = [] } = useGetTemplatesQuery()
  const reportTemplate = templates.find((t) => t.type === 0) // Report type
  const activeVersionId = reportTemplate?.activeVersion?.id
  const { data: versionData } = useGetTemplateVersionQuery(
    { templateId: reportTemplate?.id ?? "", versionId: activeVersionId ?? "" },
    { skip: !reportTemplate?.id || !activeVersionId }
  )

  // Extract custom action block names from the IncreasingImpact page content
  const addOnLabels = useMemo(() => {
    if (!versionData?.pages) return undefined
    const impactPage = versionData.pages.find(
      (p) => p.pageType === PageType.IncreasingPositiveImpact
    )
    if (!impactPage?.contentJson) return undefined
    const content = parseContentJson<IncreasingImpactContent>(
      impactPage.contentJson,
      {} as IncreasingImpactContent
    )
    const labels: Partial<Record<AddOnBlock, string>> = {}
    for (let i = 0; i < 10; i++) {
      const name = (content as unknown as Record<string, string>)[`actionName${i + 1}`]
      if (name) labels[i as AddOnBlock] = name
    }
    return Object.keys(labels).length > 0 ? labels : undefined
  }, [versionData])

  // Fetch segment conversions for the customer's segment (skip if no segment)
  const { data: segmentConversions = [] } = useGetSegmentConversionsBySegmentQuery(
    segmentId!,
    { skip: !segmentId }
  )

  // Fetch CO2 conversions
  const { data: co2Conversions = [] } = useGetCO2ConversionsQuery()

  const handleTocChange = useCallback(
    (checked: boolean) => {
      dispatch(updateStep4({ includeTableOfContents: checked }))
    },
    [dispatch]
  )

  const handleThirdPartyLogoChange = useCallback(
    (checked: boolean) => {
      dispatch(updateStep4({ includeThirdPartyLogo: checked }))
    },
    [dispatch]
  )

  const handleAddOnChange = useCallback(
    (selected: AddOnBlock[]) => {
      dispatch(updateStep4({ selectedAddOnBlocks: selected }))
    },
    [dispatch]
  )

  const handleQuantityUnitChange = useCallback(
    (value: string) => {
      dispatch(updateStep4({ quantityUnit: value as QuantityUnit }))
    },
    [dispatch]
  )

  const handleAreaUnitChange = useCallback(
    (value: string) => {
      dispatch(updateStep4({
        selectedSegmentConversionId: value === "none" ? null : value,
      }))
    },
    [dispatch]
  )

  const handleCO2UnitChange = useCallback(
    (value: string) => {
      dispatch(updateStep4({
        selectedCO2ConversionId: value === "none" ? null : value,
      }))
    },
    [dispatch]
  )

  // Only show certifications with quantity data (non-FT Premier rows)
  const certRows = step2.rows.filter(
    (r) => !FT_PREMIER_TYPES.includes(r.certificationType) && r.quantityKg !== null
  )

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#1F1F1F]">Content selection</h2>

      {/* Cover page options */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={step4.includeTableOfContents}
            onCheckedChange={(checked) => handleTocChange(Boolean(checked))}
          />
          <label className="text-sm text-[#1F1F1F] cursor-pointer">
            Include table of contents
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={step4.includeThirdPartyLogo}
            onCheckedChange={(checked) => handleThirdPartyLogoChange(Boolean(checked))}
          />
          <label className="text-sm text-[#1F1F1F] cursor-pointer">
            Include third party logo
          </label>
        </div>
      </div>

      {/* Add on blocks */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#1F1F1F]">Increasing impact</label>
        <AddOnBlockSelector
          selected={step4.selectedAddOnBlocks}
          onChange={handleAddOnChange}
          max={3}
          labels={addOnLabels}
        />
      </div>

      {/* Certifications page */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#1F1F1F]">Certifications</label>
        <p className="text-xs text-[#9CA3AF]">
          Data loaded from CSV file - displays coffee quantities in kilograms
        </p>

        {certRows.length > 0 ? (
          <div className="rounded-[16px] border border-[#F0F0F0] overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {certRows.map((row) => (
                  <tr key={row.certificationType} className="border-b border-[#F0F0F0] last:border-b-0">
                    <td className="py-3 px-4 text-[#1F1F1F]">
                      {CERTIFICATION_LABELS[row.certificationType]}
                    </td>
                    <td className="py-3 px-4 text-right text-[#1F1F1F]">
                      {row.quantityKg} Kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[#9CA3AF]">No certification data available. Upload a CSV in Step 2.</p>
        )}
      </div>

      {/* Quantity unit */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#1F1F1F]">Quantity unit</label>
        <p className="text-xs text-[#9CA3AF]">
          Choose how to express the base coffee quantity
        </p>

        <Select value={step4.quantityUnit} onValueChange={handleQuantityUnitChange}>
          <SelectTrigger className={fieldClass}>
            <SelectValue placeholder="Select quantity unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cups_of_coffee">Cups of coffee</SelectItem>
            <SelectItem value="kilograms">Kilograms</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Area unit */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#1F1F1F]">Area unit</label>
        <p className="text-xs text-[#9CA3AF]">
          Choose a comparison metric for area/impact on receipts
        </p>

        <Select
          value={step4.selectedSegmentConversionId ?? "none"}
          onValueChange={handleAreaUnitChange}
        >
          <SelectTrigger className={fieldClass}>
            <SelectValue placeholder="Select area unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Football pitches (default)</SelectItem>
            {segmentConversions.map((sc) => (
              <SelectItem key={sc.id} value={sc.id}>
                {sc.metricName} ({sc.segmentName})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!segmentId && (
          <p className="text-xs text-[#9CA3AF] italic">
            Select a customer with a segment in Step 1 to see additional conversion options
          </p>
        )}
      </div>

      {/* CO2 unit */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#1F1F1F]">CO2 unit</label>
        <p className="text-xs text-[#9CA3AF]">
          Choose how to express CO2 reduction on the CO2 receipt
        </p>

        <Select
          value={step4.selectedCO2ConversionId ?? "none"}
          onValueChange={handleCO2UnitChange}
        >
          <SelectTrigger className={fieldClass}>
            <SelectValue placeholder="Select CO2 unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Kilograms (default)</SelectItem>
            {co2Conversions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
