"use client"

import { useCallback, useState } from "react"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface RowData {
  name: string
  qty?: number
  football?: number
  coffee?: number
  currency?: number
}

export default function CustomerReportUploader() {
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [uploaded, setUploaded] = useState(false)
  const [tableData, setTableData] = useState<RowData[]>([])

  const { register, setValue } = useForm()

  const validateFile = (file: File) => {
    const allowed =
      file.type === "text/csv" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    if (!allowed) {
      setError("Only CSV or XLSX files are allowed.")
      return false
    }

    if (file.size > 100 * 1024 * 1024) {
      setError("File must be under 100MB.")
      return false
    }

    return true
  }

  const simulateUpload = () => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploaded(true)

          // Mock parsed data
          setTableData([
            { name: "Rainforest Alliance", qty: 400, football: 2.5, coffee: 50000 },
            { name: "Fair Trade", qty: 400, football: 2.5, coffee: 50000 },
            { name: "FT Premier Cooperative Premium", currency: 1250 },
            { name: "FT Premier - Organic Farming Income", currency: 850 },
            { name: "Organic", qty: 400, football: 2.5, coffee: 50000 },
            { name: "CO2", qty: 400 },
          ])

          return 100
        }
        return prev + 10
      })
    }, 150)
  }

  const handleFile = (file: File) => {
    setError(null)
    setUploaded(false)

    if (!validateFile(file)) return

    setFileName(file.name)
    simulateUpload()
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  return (
    <div className="rounded-[28px] border border-[#E5E5E5] p-8 space-y-8 bg-white">

      {/* HEADER */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">
          Customer and Report Details
        </h2>
        <p className="text-sm text-muted-foreground">
          Illustrates the percentage breakdown of report types generated
        </p>
        <p className="text-sm">
          Fill in the form fields below to create a new sustainable offer!
        </p>
      </div>

      {/* UPLOAD */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          Upload Data File *
        </label>

        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`
            relative flex flex-col items-center justify-center text-center
            px-6 py-14 rounded-[28px]
            border-2 border-dashed
            transition-all
            ${
              dragActive
                ? "border-purple-600 bg-purple-50"
                : "border-[#D9C2F3] bg-[#FAF7FF]"
            }
          `}
        >
          <input
            type="file"
            accept=".csv,.xlsx"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFile(e.target.files[0])
              }
            }}
          />

          <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#F3E8FF] mb-4">
            <Upload className="h-6 w-6 text-[#6B21A8]" />
          </div>

          <p className="font-medium">
            Upload a File or Drag and Drop
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            CSV or XLSX up to 100MB
          </p>

          {fileName && (
            <div className="mt-4 text-sm text-green-600 flex items-center gap-2">
              <FileText size={16} />
              {fileName}
            </div>
          )}

          {progress > 0 && progress < 100 && (
            <div className="w-full mt-4">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-purple-600 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 text-sm text-red-500 flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* DATA TABLE */}
      {uploaded && (
        <div className="space-y-4">
          <h3 className="text-md font-medium">Data Display Table</h3>

          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Qty (kgs)</th>
                  <th className="p-4">Football Fields</th>
                  <th className="p-4">Cups of Coffee</th>
                  <th className="p-4">Currency (€)</th>
                </tr>
              </thead>

              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-4">{row.name}</td>

                    <td className="p-4">
                      {row.qty ? (
                        <Input
                          defaultValue={row.qty}
                          className="rounded-full h-[36px] w-[100px]"
                        />
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="p-4">
                      {row.football ? (
                        <Input
                          defaultValue={row.football}
                          className="rounded-full h-[36px] w-[100px]"
                        />
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="p-4">
                      {row.coffee ? (
                        <Input
                          defaultValue={row.coffee}
                          className="rounded-full h-[36px] w-[120px]"
                        />
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="p-4">
                      {row.currency ? (
                        <Input
                          defaultValue={row.currency}
                          className="rounded-full h-[36px] w-[120px]"
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            FT Premier values represent financial impact: premiums paid to cooperatives and increased income for organic farming.
          </p>
        </div>
      )}

      <Button className="mt-6">Create Sustainable Offer</Button>
    </div>
  )
}