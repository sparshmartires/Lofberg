"use client"

import { useCallback } from "react"
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
import { AddOnBlock, CertificationType, FT_PREMIER_TYPES, CERTIFICATION_LABELS } from "../../types"
import {
  useGetSegmentConversionsBySegmentQuery,
  useGetCO2ConversionsQuery,
} from "@/store/services/conversionLogicApi"

const fieldClass =
  "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-body focus:ring-0 focus:outline-none"

export function Step4ContentSelection() {
  const dispatch = useAppDispatch()
  const step4 = useAppSelector((state) => state.reportWizard.step4)
  const step2 = useAppSelector((state) => state.reportWizard.step2)
  const step1 = useAppSelector((state) => state.reportWizard.step1)

  const segmentId = step1.customerSegmentId

  // Fetch segment conversions for the customer's segment (skip if no segment)
  const { data: segmentConversions = [] } = useGetSegmentConversionsBySegmentQuery(
    segmentId!,
    { skip: !segmentId }
  )

  // Fetch CO2 conversions
  const { data: co2Conversions = [] } = useGetCO2ConversionsQuery()

  // Check if step2 has CO2 data with non-zero quantity
  const hasCO2Data = step2.rows.some(
    (r) => r.certificationType === CertificationType.CO2 && r.quantityKg !== null && r.quantityKg > 0
  )

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
      if (value === "football_pitches") {
        dispatch(updateStep4({
          selectedSegmentConversionId: null,
          showCupsOfCoffee: false,
        }))
      } else if (value === "cups_of_coffee") {
        dispatch(updateStep4({
          selectedSegmentConversionId: null,
          showCupsOfCoffee: true,
        }))
      } else {
        // A segment conversion ID
        dispatch(updateStep4({
          selectedSegmentConversionId: value,
          showCupsOfCoffee: false,
        }))
      }
    },
    [dispatch]
  )

  const handleCO2ConversionChange = useCallback(
    (value: string) => {
      dispatch(updateStep4({
        selectedCO2ConversionId: value === "none" ? null : value,
      }))
    },
    [dispatch]
  )

  // Determine current quantity unit dropdown value
  const quantityUnitValue = step4.selectedSegmentConversionId
    ? step4.selectedSegmentConversionId
    : step4.showCupsOfCoffee
      ? "cups_of_coffee"
      : "football_pitches"

  // Only show certifications with quantity data (non-FT Premier rows)
  const certRows = step2.rows.filter(
    (r) => !FT_PREMIER_TYPES.includes(r.certificationType) && r.quantityKg !== null
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1F1F1F]">Content selection</h2>
      </div>

      {/* Cover page options */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#1F1F1F]">Cover page</label>

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
        <label className="text-sm font-medium text-[#1F1F1F]">Add on</label>
        <AddOnBlockSelector
          selected={step4.selectedAddOnBlocks}
          onChange={handleAddOnChange}
          max={3}
        />
      </div>

      {/* Certifications page */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#1F1F1F]">Certifications page</label>
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

      {/* Receipt quantity unit */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#1F1F1F]">Receipt quantity unit</label>
        <p className="text-xs text-[#9CA3AF]">
          Choose which unit to display on receipt pages
        </p>

        <Select value={quantityUnitValue} onValueChange={handleQuantityUnitChange}>
          <SelectTrigger className={fieldClass}>
            <SelectValue placeholder="Select quantity unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="football_pitches">Football pitches (default)</SelectItem>
            <SelectItem value="cups_of_coffee">Cups of coffee</SelectItem>
            {segmentConversions.map((sc) => (
              <SelectItem key={sc.id} value={sc.id}>
                {sc.metricName} ({sc.segmentName})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* CO2 comparison */}
      {hasCO2Data && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-[#1F1F1F]">CO2 comparison</label>
          <p className="text-xs text-[#9CA3AF]">
            Choose a tangible equivalent to display alongside raw CO2 kg on the CO2 receipt
          </p>

          <Select
            value={step4.selectedCO2ConversionId ?? "none"}
            onValueChange={handleCO2ConversionChange}
          >
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder="Select CO2 comparison" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (show raw kg CO2 only)</SelectItem>
              {co2Conversions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Segment warning */}
      {!segmentId && (
        <div className="rounded-[16px] bg-[#FFF8E1] border border-[#FFE082] px-4 py-3">
          <p className="text-sm text-[#6D4C00]">
            Select a customer with a segment in Step 1 to see segment-specific conversion options
          </p>
        </div>
      )}
    </div>
  )
}
