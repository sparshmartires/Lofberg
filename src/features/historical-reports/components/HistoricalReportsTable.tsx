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
import { Download, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"

export interface HistoricalReportItem {
  id: string
  title: string
  customerName: string
  salesRepresentative: string
  status: "Completed" | "In Progress" | "Draft"
  reportDate: string
  type: string
}

interface HistoricalReportsTableProps {
  reports: HistoricalReportItem[]
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

const getStatusClass = (status: HistoricalReportItem["status"]) => {
  if (status === "Completed") return "bg-[#7DB356] text-white"
  if (status === "In Progress") return "bg-[#FFE378] text-[#3C1053]"
  return "bg-[#E5E5E5] text-[#6B6B6B]"
}

export function HistoricalReportsTable({ reports }: HistoricalReportsTableProps) {
  const router = useRouter()

  const columnWidths = {
    title: "w-[220px]",
    customer: "w-[180px]",
    salesRep: "w-[180px]",
    status: "w-[130px]",
    date: "w-[130px]",
    actions: "w-[90px]",
  }

  const handleDownload = (report: HistoricalReportItem) => {
    const payload = `Report ID: ${report.id}\nTitle: ${report.title}\nCustomer: ${report.customerName}\nSales Representative: ${report.salesRepresentative}\nStatus: ${report.status}\nReport Date: ${formatDate(report.reportDate)}\nType: ${report.type}`
    const blob = new Blob([payload], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${report.title.replace(/\s+/g, "-").toLowerCase()}-${report.id}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

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
              <TableHead className={`table-header-cell ${columnWidths.salesRep}`}>
                Sales representative
              </TableHead>
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
                    <span className="table-muted-text">{report.id}</span>
                  </div>
                </TableCell>

                <TableCell className={`table-muted-text ${columnWidths.customer}`} data-label="Customer name">
                  {report.customerName}
                </TableCell>

                <TableCell className={`table-muted-text ${columnWidths.salesRep}`} data-label="Sales representative">
                  {report.salesRepresentative}
                </TableCell>

                <TableCell className={columnWidths.status} data-label="Status">
                  <Badge className={`table-status-badge ${getStatusClass(report.status)}`}>
                    {report.status}
                  </Badge>
                </TableCell>

                <TableCell className={`table-muted-text ${columnWidths.date}`} data-label="Report date">
                  {formatDate(report.reportDate)}
                </TableCell>

                <TableCell className={columnWidths.actions} data-label="Actions">
                  <div className="table-actions-wrap">
                    {report.status === "Draft" && (
                      <button
                        onClick={() => router.push(`/report-generation?draftId=${report.id}`)}
                        className="table-action-btn"
                        aria-label={`Continue editing ${report.title}`}
                      >
                        <Pencil className="table-action-icon" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(report)}
                      className="table-action-btn"
                      aria-label={`Download ${report.title}`}
                    >
                      <Download className="table-action-icon" />
                    </button>
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

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="text-[14px] text-[#1F1F1F]">
          Report title/ID : <span className="text-[#4E4E4E]">{report.id}</span>
        </div>

        <Badge className={`${getStatusClass(report.status)} rounded-full px-4 py-1 text-xs`}>
          {report.status}
        </Badge>
      </div>

      <div className="user-mobile-divider" />

      {/* CUSTOMER */}
      <div className="text-[14px] text-[#4E4E4E]">
        Customer name : {report.customerName}
      </div>

      {/* SALES REP */}
      <div className="text-[14px] text-[#4E4E4E]">
        Sales representative: {report.salesRepresentative}
      </div>

      {/* DATE */}
      <div className="text-[14px] text-[#4E4E4E]">
        Report date : {formatDate(report.reportDate)}
      </div>

      {/* ACTION */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => handleDownload(report)}
          className="flex items-center gap-2 text-[#5B2D91] text-[14px]"
        >
          Save
          <Download className="h-4 w-4" />
        </button>
      </div>

    </div>
  ))}
</div>
    </div>
  )
}
