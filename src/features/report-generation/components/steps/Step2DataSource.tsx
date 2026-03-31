"use client"

import { useCallback, useState } from "react"
import Papa from "papaparse"
import ExcelJS from "exceljs"
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

/**
 * Parse an Excel (.xlsx/.xls) file buffer and return the header-based JSON rows
 * plus an optional timePeriod extracted from metadata rows above the header.
 */
async function parseExcelBuffer(
  buffer: ArrayBuffer
): Promise<{ json: Record<string, unknown>[]; timePeriod: string | null }> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const worksheet = workbook.worksheets[0]
  if (!worksheet) return { json: [], timePeriod: null }

  let timePeriod: string | null = null
  let headerRowNumber = 1

  // Scan the first 11 rows for metadata ("date") and the header row ("name")
  const maxScan = Math.min(worksheet.rowCount, 11)
  for (let r = 1; r <= maxScan; r++) {
    const row = worksheet.getRow(r)
    const firstCellVal = row.getCell(1).value
    const cellStr = firstCellVal != null ? String(firstCellVal).trim().toLowerCase() : ""

    if (cellStr === "date") {
      const dateVal = row.getCell(2).value
      if (dateVal != null) timePeriod = String(dateVal).trim()
    }
    if (cellStr === "name") {
      headerRowNumber = r
      break
    }
  }

  // Read headers from the identified header row
  const headerRow = worksheet.getRow(headerRowNumber)
  const headers: string[] = []
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber] = cell.value != null ? String(cell.value).trim() : ""
  })

  // Build JSON array from subsequent rows
  const json: Record<string, unknown>[] = []
  for (let r = headerRowNumber + 1; r <= worksheet.rowCount; r++) {
    const row = worksheet.getRow(r)
    // Skip completely empty rows
    let hasValue = false
    const record: Record<string, unknown> = {}
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headers[colNumber]
      if (key) {
        record[key] = cell.value
        if (cell.value != null && String(cell.value).trim() !== "") hasValue = true
      }
    })
    if (hasValue) json.push(record)
  }

  return { json, timePeriod }
}

/**
 * Parse a CSV file string and return header-based JSON rows
 * plus an optional timePeriod extracted from metadata rows above the header.
 */
function parseCsvText(
  text: string
): { json: Record<string, unknown>[]; timePeriod: string | null } {
  // First parse without headers to inspect raw rows for metadata
  const raw = Papa.parse<string[]>(text, { header: false, skipEmptyLines: true })
  const rawData = raw.data

  let timePeriod: string | null = null
  let headerRowIndex = 0

  const maxScan = Math.min(rawData.length, 11)
  for (let r = 0; r < maxScan; r++) {
    const firstCell = (rawData[r][0] ?? "").trim().toLowerCase()
    if (firstCell === "date") {
      const dateVal = rawData[r][1]
      if (dateVal != null) timePeriod = String(dateVal).trim()
    }
    if (firstCell === "name") {
      headerRowIndex = r
      break
    }
  }

  // Use the identified header row as column names
  const headers = rawData[headerRowIndex].map((h) => h.trim())
  const json: Record<string, unknown>[] = []
  for (let r = headerRowIndex + 1; r < rawData.length; r++) {
    const row = rawData[r]
    const record: Record<string, unknown> = {}
    let hasValue = false
    for (let c = 0; c < headers.length; c++) {
      if (headers[c]) {
        record[headers[c]] = row[c]
        if (row[c] != null && String(row[c]).trim() !== "") hasValue = true
      }
    }
    if (hasValue) json.push(record)
  }

  return { json, timePeriod }
}

export function Step2DataSource() {
  const dispatch = useAppDispatch()
  const step2 = useAppSelector((state) => state.reportWizard.step2)
  const [localFile, setLocalFile] = useState<File | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const parseFile = useCallback(
    (file: File | null) => {
      setLocalFile(file)
      setParseError(null)
      if (!file) {
        dispatch(updateStep2({ dataFileName: null, rows: DEFAULT_DATA_ROWS }))
        return
      }

      dispatch(updateStep2({ dataFileName: file.name }))

      const isCsv = file.name.toLowerCase().endsWith(".csv")

      if (isCsv) {
        // CSV path: read as text, parse with PapaParse
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string
            const { json, timePeriod } = parseCsvText(text)
            const rows = mapExcelToRows(json)
            dispatch(updateStep2({ rows, timePeriod }))
          } catch (err) {
            console.error("CSV parsing failed:", err)
            setParseError("Failed to parse the uploaded file. Please check the format and try again.")
          }
        }
        reader.onerror = () => {
          console.error("FileReader error (CSV):", reader.error)
          setParseError("Failed to read the file. Please try again or use a different file.")
        }
        reader.readAsText(file)
      } else {
        // Excel path: read as ArrayBuffer, parse with ExcelJS
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const buffer = e.target?.result as ArrayBuffer
            const { json, timePeriod } = await parseExcelBuffer(buffer)
            const rows = mapExcelToRows(json)
            dispatch(updateStep2({ rows, timePeriod }))
          } catch (err) {
            console.error("Excel parsing failed:", err)
            setParseError("Failed to parse the uploaded file. Please check the format and try again.")
          }
        }
        reader.onerror = () => {
          console.error("FileReader error (Excel):", reader.error)
          setParseError("Failed to read the file. Please try again or use a different file.")
        }
        reader.readAsArrayBuffer(file)
      }
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
        <h2 className="text-lg font-semibold text-[#1F1F1F]">Purchase data</h2>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#1F1F1F]">
          Upload data file <span className="text-red-500">*</span>
        </label>
        <FileDropZone
          accept=".csv,.xlsx,.xls"
          acceptLabel="CSV or XLSX up to 100 MB"
          file={localFile}
          fallbackFileName={step2.dataFileName}
          onFileChange={parseFile}
        />
        {parseError && (
          <p className="text-sm text-red-500 mt-2">{parseError}</p>
        )}
      </div>

      {/* Data Table */}
      <div className="space-y-2">
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

    // Pick the right currency column based on certification type
    let currency: number | null = toNum(row["Currency (€)"] ?? row.Currency ?? row.currency ?? row.amount)
    if (certType === CertificationType.FTPremierCooperativePremium) {
      currency = toNum(row["EUR_FT_Cooperative_Premium"] ?? row["EUR_FT_Coop"]) ?? currency
    } else if (certType === CertificationType.FTPremierOrganicFarming) {
      currency = toNum(row["EUR_FT_Organic_Income"] ?? row["EUR_FT_Org"]) ?? currency
    }

    rows[idx] = {
      ...rows[idx],
      quantityKg: toNum(row["Qty (kgs)"] ?? row["Qty (kg)"] ?? row.Qty ?? row.qty ?? row.Quantity ?? row.quantity),
      footballFields: toNum(row["Football Fields"] ?? row["Football fields"] ?? row.footballFields),
      cupsOfCoffee: toNum(row["Cups of Coffee"] ?? row["Cups of coffee"] ?? row.cupsOfCoffee ?? row.cups),
      currencyAmount: currency,
    }
  }

  return rows
}

function matchCertificationType(name: string): CertificationType | null {
  // Exact label match first (case-insensitive)
  const labels = Object.entries(CERTIFICATION_LABELS)
  for (const [key, label] of labels) {
    if (name === label.toLowerCase()) {
      return Number(key) as CertificationType
    }
  }

  // Keyword fallbacks (order matters: specific before general)
  if (name.includes("rainforest")) return CertificationType.RainforestAlliance
  if (name.includes("cooperative") || name.includes("coop")) return CertificationType.FTPremierCooperativePremium
  if (name.includes("organic farming") || name.includes("organic income")) return CertificationType.FTPremierOrganicFarming
  if ((name.includes("fairtrade") || name.includes("fair trade")) && !name.includes("premier")) return CertificationType.Fairtrade
  if (name.includes("organic")) return CertificationType.Organic
  if (name.includes("co2")) return CertificationType.CO2
  return null
}

function toNum(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}
