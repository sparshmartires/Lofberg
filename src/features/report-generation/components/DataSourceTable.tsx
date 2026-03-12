"use client"

import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import {
  CertificationDataRow,
  CertificationType,
  FT_PREMIER_TYPES,
  CERTIFICATION_LABELS,
} from "../types"

interface DataSourceTableProps {
  rows: CertificationDataRow[]
  onChange: (rows: CertificationDataRow[]) => void
}

const cellInputClass =
  "w-[80px] h-[36px] rounded-[8px] border border-[#F0F0F0] px-2 py-1 text-sm text-center shadow-[0px_1px_2px_0px_#0000000A] focus:ring-0 focus:outline-none"

export function DataSourceTable({ rows, onChange }: DataSourceTableProps) {
  const updateRow = useCallback(
    (index: number, field: keyof CertificationDataRow, value: string) => {
      const updated = [...rows]
      const numVal = value === "" ? null : Number(value)
      updated[index] = { ...updated[index], [field]: numVal }
      onChange(updated)
    },
    [rows, onChange]
  )

  const isFTPremier = (type: CertificationType) => FT_PREMIER_TYPES.includes(type)
  const isCO2 = (type: CertificationType) => type === CertificationType.CO2

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#F0F0F0]">
            <th className="text-left py-3 px-3 font-medium text-[#1F1F1F] min-w-[160px]">Name</th>
            <th className="text-center py-3 px-3 font-medium text-[#1F1F1F]">Qty (kg)</th>
            <th className="text-center py-3 px-3 font-medium text-[#1F1F1F]">Football Fields</th>
            <th className="text-center py-3 px-3 font-medium text-[#1F1F1F]">Cups of Coffee</th>
            <th className="text-center py-3 px-3 font-medium text-[#1F1F1F]">Currency (&euro;)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const ftPremier = isFTPremier(row.certificationType)
            const co2 = isCO2(row.certificationType)

            return (
              <tr key={row.certificationType} className="border-b border-[#F0F0F0]">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    {ftPremier && (
                      <span className="text-[#9CA3AF]">&#x251C;</span>
                    )}
                    <span className="text-[#1F1F1F]">
                      {CERTIFICATION_LABELS[row.certificationType]}
                    </span>
                  </div>
                </td>

                <td className="py-3 px-3 text-center">
                  {ftPremier ? (
                    <span className="text-[#9CA3AF]">&mdash;</span>
                  ) : (
                    <Input
                      type="number"
                      value={row.quantityKg ?? ""}
                      onChange={(e) => updateRow(index, "quantityKg", e.target.value)}
                      className={cellInputClass}
                    />
                  )}
                </td>

                <td className="py-3 px-3 text-center">
                  {ftPremier || co2 ? (
                    <span className="text-[#9CA3AF]">{co2 ? "N/A" : "\u2014"}</span>
                  ) : (
                    <Input
                      type="number"
                      step="0.1"
                      value={row.footballFields ?? ""}
                      onChange={(e) => updateRow(index, "footballFields", e.target.value)}
                      className={cellInputClass}
                    />
                  )}
                </td>

                <td className="py-3 px-3 text-center">
                  {ftPremier || co2 ? (
                    <span className="text-[#9CA3AF]">{co2 ? "N/A" : "\u2014"}</span>
                  ) : (
                    <Input
                      type="number"
                      value={row.cupsOfCoffee ?? ""}
                      onChange={(e) => updateRow(index, "cupsOfCoffee", e.target.value)}
                      className={cellInputClass}
                    />
                  )}
                </td>

                <td className="py-3 px-3 text-center">
                  {ftPremier ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={row.currencyAmount ?? ""}
                      onChange={(e) => updateRow(index, "currencyAmount", e.target.value)}
                      className={cellInputClass}
                    />
                  ) : (
                    <span className="text-[#9CA3AF]">N/A</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <p className="text-xs text-[#9CA3AF] mt-4 px-3">
        FT Premier values represent financial impact: premiums paid to cooperatives and increased
        income for organic farming.
      </p>
    </div>
  )
}
