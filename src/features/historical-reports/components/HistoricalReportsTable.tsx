"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Archive, Download, Pencil, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ReportDto, StatusLabel } from "@/features/report-generation/types"
import { useArchiveReportMutation, useRestoreReportMutation } from "@/store/services/reportsApi"

interface HistoricalReportsTableProps {
  reports: ReportDto[]
  showSalesRepColumn?: boolean
  isAdmin?: boolean
}

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date)
}

const getStatusClass = (statusLabel: StatusLabel) => {
  switch (statusLabel) {
    case "Latest":
      return "bg-[#7DB356] text-white"
    case "In Progress":
      return "bg-[#FFE378] text-[#3C1053]"
    case "Draft":
      return "bg-[#E5E5E5] text-[#6B6B6B]"
    case "Past":
      return "bg-[#B0C4DE] text-[#1a1a1a]"
    case "Archived":
      return "bg-[#D4D4D4] text-[#6B6B6B]"
    case "Failed":
      return "bg-[#E57373] text-white"
    default:
      return "bg-[#E5E5E5] text-[#6B6B6B]"
  }
}

export function HistoricalReportsTable({ reports, showSalesRepColumn = true, isAdmin = false }: HistoricalReportsTableProps) {
  const router = useRouter()
  const [archiveReport] = useArchiveReportMutation()
  const [restoreReport] = useRestoreReportMutation()

  const columnWidths = {
    title: "w-[220px]",
    customer: "w-[180px]",
    salesRep: "w-[180px]",
    status: "w-[130px]",
    date: "w-[130px]",
    actions: "w-[120px]",
  }

  const handleDownload = (report: ReportDto) => {
    if (report.generatedFileUrl) {
      window.open(report.generatedFileUrl, "_blank")
    }
  }

  const handleArchive = async (report: ReportDto) => {
    const message =
      report.statusLabel === "Draft"
        ? `Delete draft "${report.title}"? This cannot be undone.`
        : `Archive report "${report.title}"?`

    if (window.confirm(message)) {
      await archiveReport({ id: report.id })
    }
  }

  const handleRestore = async (report: ReportDto) => {
    if (window.confirm(`Restore report "${report.title}"?`)) {
      await restoreReport({ id: report.id })
    }
  }

  const canEdit = (report: ReportDto) =>
    isAdmin
      ? report.statusLabel !== "Archived"
      : report.statusLabel === "Draft" || report.statusLabel === "Latest"

  const canDownload = (report: ReportDto) =>
    report.statusLabel !== "Draft" && report.statusLabel !== "Archived" && report.generatedFileUrl

  const canArchive = (report: ReportDto) =>
    report.statusLabel !== "Archived"

  const canRestore = (report: ReportDto) =>
    report.statusLabel === "Archived"

  return (
    <div className="table-card border-[#EDEDED]">
      <div className="users-table-desktop">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="table-header-row-bordered">
              <TableHead className={`table-header-cell ${columnWidths.title}`}>
                Report title/ID
              </TableHead>
              <TableHead className={`table-header-cell ${columnWidths.customer}`}>
                Customer name
              </TableHead>
              {showSalesRepColumn && (
                <TableHead className={`table-header-cell ${columnWidths.salesRep}`}>
                  Sales representative
                </TableHead>
              )}
              <TableHead className={`table-header-cell ${columnWidths.status}`}>
                Status
              </TableHead>
              <TableHead className={`table-header-cell ${columnWidths.date}`}>
                Report date
              </TableHead>
              <TableHead className={`table-header-cell ${columnWidths.actions}`}>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id} className="table-body-row">
                <TableCell className={`table-name-cell ${columnWidths.title}`} data-label="Report title/ID">
                  <div className="flex flex-col gap-0.5">
                    <span className="table-name-text truncate">{report.title}</span>
                    <span className="table-muted-text">{report.id.substring(0, 8)}</span>
                  </div>
                </TableCell>

                <TableCell className={`table-muted-text ${columnWidths.customer}`} data-label="Customer name">
                  {report.customerName}
                </TableCell>

                {showSalesRepColumn && (
                  <TableCell className={`table-muted-text ${columnWidths.salesRep}`} data-label="Sales representative">
                    {report.salesRepresentative}
                  </TableCell>
                )}

                <TableCell className={columnWidths.status} data-label="Status">
                  <Badge className={`table-status-badge ${getStatusClass(report.statusLabel)}`}>
                    {report.statusLabel}
                  </Badge>
                </TableCell>

                <TableCell className={`table-muted-text ${columnWidths.date}`} data-label="Report date">
                  {formatDate(report.reportDate)}
                </TableCell>

                <TableCell className={columnWidths.actions} data-label="Actions">
                  <div className="table-actions-wrap">
                    {canEdit(report) && (
                      <button
                        onClick={() =>
                          router.push(
                            report.statusLabel === "Draft"
                              ? `/report-generation?draftId=${report.id}`
                              : `/report-generation?reportId=${report.id}`
                          )
                        }
                        className="table-action-btn"
                        aria-label={`Edit ${report.title}`}
                      >
                        <Pencil className="table-action-icon" />
                      </button>
                    )}
                    {canDownload(report) && (
                      <button
                        onClick={() => handleDownload(report)}
                        className="table-action-btn"
                        aria-label={`Download ${report.title}`}
                      >
                        <Download className="table-action-icon" />
                      </button>
                    )}
                    {canArchive(report) && (
                      <button
                        onClick={() => handleArchive(report)}
                        className="table-action-btn"
                        aria-label={`Archive ${report.title}`}
                      >
                        <Archive className="table-action-icon" />
                      </button>
                    )}
                    {canRestore(report) && (
                      <button
                        onClick={() => handleRestore(report)}
                        className="table-action-btn"
                        aria-label={`Restore ${report.title}`}
                      >
                        <RotateCcw className="table-action-icon" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="users-list-mobile">
        {reports.map((report) => (
          <div key={report.id} className="user-mobile-card">
            <div className="flex items-center justify-between">
              <div className="text-[14px] text-[#1F1F1F]">
                Report title/ID : <span className="text-[#4E4E4E]">{report.id.substring(0, 8)}</span>
              </div>

              <Badge className={`${getStatusClass(report.statusLabel)} rounded-full px-4 py-1 text-xs`}>
                {report.statusLabel}
              </Badge>
            </div>

            <div className="user-mobile-divider" />

            <div className="text-[14px] text-[#4E4E4E]">
              Customer name : {report.customerName}
            </div>

            {showSalesRepColumn && (
              <div className="text-[14px] text-[#4E4E4E]">
                Sales representative: {report.salesRepresentative}
              </div>
            )}

            <div className="text-[14px] text-[#4E4E4E]">
              Report date : {formatDate(report.reportDate)}
            </div>

            <div className="flex justify-end mt-4 gap-3">
              {canDownload(report) && (
                <button
                  onClick={() => handleDownload(report)}
                  className="flex items-center gap-2 text-[#5B2D91] text-[14px]"
                >
                  Download
                  <Download className="h-4 w-4" />
                </button>
              )}
              {canArchive(report) && (
                <button
                  onClick={() => handleArchive(report)}
                  className="flex items-center gap-2 text-[#5B2D91] text-[14px]"
                >
                  Archive
                  <Archive className="h-4 w-4" />
                </button>
              )}
              {canRestore(report) && (
                <button
                  onClick={() => handleRestore(report)}
                  className="flex items-center gap-2 text-[#5B2D91] text-[14px]"
                >
                  Restore
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
