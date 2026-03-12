"use client"

import { useCallback } from "react"
import * as XLSX from "xlsx"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { updateStep2 } from "@/store/slices/reportWizardSlice"
import { FileDropZone } from "../FileDropZone"
import { DataSourceTable } from "../DataSourceTable"
import {
  CertificationDataRow,
  CertificationType,
  CERTIFICATION_LABELS,
  DEFAULT_DATA_ROWS,
} from "../../types"

export function Step2DataSource() {
  const dispatch = useAppDispatch()
  const step2 = useAppSelector((state) => state.reportWizard.step2)

  const parseFile = useCallback(
    (file: File | null) => {
      if (!file) {
        dispatch(updateStep2({ dataFile: null, dataFileName: null, rows: DEFAULT_DATA_ROWS }))
        return
      }

      dispatch(updateStep2({ dataFile: file, dataFileName: file.name }))

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: "array" })
          const sheet = workbook.Sheets[workbook.SheetNames[0]]
          const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

          const rows = mapExcelToRows(json)
          dispatch(updateStep2({ rows }))
        } catch {
          // If parsing fails, keep default rows
        }
      }
      reader.readAsArrayBuffer(file)
    },
    [dispatch]
  )

  const handleRowsChange = useCallback(
    (rows: CertificationDataRow[]) => {
      dispatch(updateStep2({ rows }))
    },
    [dispatch]
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1F1F1F]">Customer and report details</h2>
        <p className="text-sm text-[#747474] mt-1">
          Illustrates the percentage breakdown of report types generated
        </p>
      </div>

      <p className="text-sm text-[#1F1F1F]">
        Fill in the form fields below to create a new sustainable offer!
      </p>

      {/* File Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#1F1F1F]">
          Upload data file <span className="text-red-500">*</span>
        </label>
        <FileDropZone
          accept=".csv,.xlsx,.xls"
          acceptLabel="CSV or XLSX up to 100 MB"
          file={step2.dataFile}
          onFileChange={parseFile}
        />
      </div>

      {/* Data Table */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#1F1F1F]">Data display table</label>
        <DataSourceTable rows={step2.rows} onChange={handleRowsChange} />
      </div>
    </div>
  )
}

/**
 * Map parsed Excel JSON rows to CertificationDataRow[]
 * Attempts to match rows by name to known certification types
 */
function mapExcelToRows(
  json: Record<string, unknown>[]
): CertificationDataRow[] {
  const rows = [...DEFAULT_DATA_ROWS]

  for (const row of json) {
    const name = String(row.Name ?? row.name ?? row.Certification ?? row.certification ?? "").trim().toLowerCase()
    const certType = matchCertificationType(name)
    if (certType === null) continue

    const idx = rows.findIndex((r) => r.certificationType === certType)
    if (idx === -1) continue

    rows[idx] = {
      ...rows[idx],
      quantityKg: toNum(row["Qty (kg)"] ?? row.Qty ?? row.qty ?? row.Quantity ?? row.quantity),
      footballFields: toNum(row["Football Fields"] ?? row["Football fields"] ?? row.footballFields),
      cupsOfCoffee: toNum(row["Cups of Coffee"] ?? row["Cups of coffee"] ?? row.cupsOfCoffee ?? row.cups),
      currencyAmount: toNum(row["Currency (€)"] ?? row.Currency ?? row.currency ?? row.amount),
    }
  }

  return rows
}

function matchCertificationType(name: string): CertificationType | null {
  const labels = Object.entries(CERTIFICATION_LABELS)
  for (const [key, label] of labels) {
    if (name.includes(label.toLowerCase()) || label.toLowerCase().includes(name)) {
      return Number(key) as CertificationType
    }
  }
  if (name.includes("rainforest")) return CertificationType.RainforestAlliance
  if (name.includes("fairtrade") && !name.includes("premier")) return CertificationType.Fairtrade
  if (name.includes("cooperative") || name.includes("coop")) return CertificationType.FTPremierCooperativePremium
  if (name.includes("organic farming") || name.includes("organic income")) return CertificationType.FTPremierOrganicFarming
  if (name.includes("organic")) return CertificationType.Organic
  if (name.includes("co2")) return CertificationType.CO2
  return null
}

function toNum(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}
