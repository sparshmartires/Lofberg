"use client"

import { useCallback, useState } from "react"
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
  "w-[110px] h-[36px] rounded-[8px] border border-[#F0F0F0] px-2 py-1 text-sm text-center shadow-[0px_1px_2px_0px_#0000000A] focus:ring-0 focus:outline-none"

/** Format a number for EU display (e.g., 1.234,56) */
function formatEu(val: number | null): string {
  if (val === null || val === undefined) return ""
  return val.toLocaleString("de-DE", { maximumFractionDigits: 2 })
}

/** Parse an EU-formatted string back to a number */
function parseEu(str: string): number | null {
  if (!str.trim()) return null
  // Replace dots (thousands) and convert comma (decimal) to dot
  const normalized = str.replace(/\./g, "").replace(",", ".")
  const n = Number(normalized)
  return isNaN(n) ? null : n
}

/** Controlled EU-formatted input that shows raw number on focus */
function EuNumberInput({
  value,
  onChange,
  className,
  step,
}: {
  value: number | null
  onChange: (val: string) => void
  className: string
  step?: string
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState("")

  const handleFocus = () => {
    setEditing(true)
    setEditValue(value !== null && value !== undefined ? String(value) : "")
  }

  const handleBlur = () => {
    setEditing(false)
    onChange(editValue)
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      className={className}
      value={editing ? editValue : formatEu(value)}
      onChange={(e) => setEditValue(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  )
}

export function DataSourceTable({ rows, onChange }: DataSourceTableProps) {
  const updateRow = useCallback(
    (index: number, field: keyof CertificationDataRow, value: string) => {
      const updated = [...rows]
      const numVal = parseEu(value)
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
            <th className="text-center py-3 px-3 font-medium text-[#1F1F1F]">Football fields</th>
            <th className="text-center py-3 px-3 font-medium text-[#1F1F1F]">Cups of coffee</th>
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
                    <EuNumberInput
                      value={row.quantityKg}
                      onChange={(v) => updateRow(index, "quantityKg", v)}
                      className={cellInputClass}
                    />
                  )}
                </td>

                <td className="py-3 px-3 text-center">
                  {ftPremier || co2 ? (
                    <span className="text-[#9CA3AF]">{co2 ? "N/A" : "\u2014"}</span>
                  ) : (
                    <EuNumberInput
                      value={row.footballFields}
                      onChange={(v) => updateRow(index, "footballFields", v)}
                      className={cellInputClass}
                      step="0.1"
                    />
                  )}
                </td>

                <td className="py-3 px-3 text-center">
                  {ftPremier || co2 ? (
                    <span className="text-[#9CA3AF]">{co2 ? "N/A" : "\u2014"}</span>
                  ) : (
                    <EuNumberInput
                      value={row.cupsOfCoffee}
                      onChange={(v) => updateRow(index, "cupsOfCoffee", v)}
                      className={cellInputClass}
                    />
                  )}
                </td>

                <td className="py-3 px-3 text-center">
                  {ftPremier ? (
                    <EuNumberInput
                      value={row.currencyAmount}
                      onChange={(v) => updateRow(index, "currencyAmount", v)}
                      className={cellInputClass}
                      step="0.01"
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
    </div>
  )
}
