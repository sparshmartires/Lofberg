"use client"

import { useCallback } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { updateStep4 } from "@/store/slices/reportWizardSlice"
import { AddOnBlockSelector } from "../AddOnBlockSelector"
import { AddOnBlock, CertificationType, FT_PREMIER_TYPES, CERTIFICATION_LABELS } from "../../types"

export function Step4ContentSelection() {
  const dispatch = useAppDispatch()
  const step4 = useAppSelector((state) => state.reportWizard.step4)
  const step2 = useAppSelector((state) => state.reportWizard.step2)
  const step1 = useAppSelector((state) => state.reportWizard.step1)

  const hasCustomer = Boolean(step1.customerId)

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

  const handleCupsChange = useCallback(
    (checked: boolean) => {
      dispatch(updateStep4({ showCupsOfCoffee: checked }))
    },
    [dispatch]
  )

  const handleAddOnChange = useCallback(
    (selected: AddOnBlock[]) => {
      dispatch(updateStep4({ selectedAddOnBlocks: selected }))
    },
    [dispatch]
  )

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

      {/* Cover page - cups of coffee */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#1F1F1F]">Cover page</label>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={step4.showCupsOfCoffee}
            onCheckedChange={(checked) => handleCupsChange(Boolean(checked))}
          />
          <label className="text-sm text-[#1F1F1F] cursor-pointer">
            Show cups of coffee representation
          </label>
        </div>
      </div>

      {/* Conversion logic warning */}
      {!hasCustomer && (
        <div className="rounded-[16px] bg-[#FFF8E1] border border-[#FFE082] px-4 py-3">
          <p className="text-sm text-[#6D4C00]">
            Please select a customer in step 1 to configure conversion logic
          </p>
        </div>
      )}
    </div>
  )
}
