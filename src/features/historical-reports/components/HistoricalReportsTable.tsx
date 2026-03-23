"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Archive, ArrowUpDown, Download, Pencil, RotateCcw, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ReportDto, StatusLabel } from "@/features/report-generation/types"
import { useArchiveReportMutation, useRestoreReportMutation } from "@/store/services/reportsApi"

interface HistoricalReportsTableProps {
  reports: ReportDto[]
  showSalesRepColumn?: boolean
  isAdmin?: boolean
  sortBy?: string
  sortDirection?: string
  onSort?: (column: string) => void
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

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

type ModalAction = "archive" | "delete" | "restore"

export function HistoricalReportsTable({
  reports,
  showSalesRepColumn = true,
  isAdmin = false,
  sortBy,
  sortDirection,
  onSort,
}: HistoricalReportsTableProps) {
  const router = useRouter()
  const [archiveReport] = useArchiveReportMutation()
  const [restoreReport] = useRestoreReportMutation()
  const [modal, setModal] = useState<{ open: boolean; action: ModalAction; report: ReportDto | null }>({
    open: false,
    action: "archive",
    report: null,
  })

  const handleDownload = (report: ReportDto) => {
    if (report.generatedFileUrl) {
      window.open(report.generatedFileUrl, "_blank")
    }
  }

  const openModal = (action: ModalAction, report: ReportDto) => {
    setModal({ open: true, action, report })
  }

  const closeModal = () => {
    setModal({ open: false, action: "archive", report: null })
  }

  const handleConfirm = async () => {
    if (!modal.report) return
    if (modal.action === "archive" || modal.action === "delete") {
      await archiveReport({ id: modal.report.id })
    } else if (modal.action === "restore") {
      await restoreReport({ id: modal.report.id })
    }
    closeModal()
  }

  const canEdit = (report: ReportDto) =>
    isAdmin
      ? report.statusLabel !== "Archived"
      : report.statusLabel === "Draft" || report.statusLabel === "Latest"

  const canDownload = (report: ReportDto) =>
    report.statusLabel !== "Draft" && report.statusLabel !== "Archived" && report.generatedFileUrl

  const canArchive = (report: ReportDto) => {
    if (isAdmin) return report.statusLabel !== "Archived"
    return report.statusLabel === "Draft"
  }

  const canRestore = (report: ReportDto) =>
    isAdmin && report.statusLabel === "Archived"

  const getArchiveAction = (report: ReportDto): ModalAction =>
    report.statusLabel === "Draft" ? "delete" : "archive"

  const SortableHeader = ({ column, children, className }: { column: string; children: React.ReactNode; className?: string }) => (
    <TableHead
      className={`table-header-cell cursor-pointer select-none ${className ?? ""}`}
      onClick={() => onSort?.(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`h-3 w-3 ${sortBy === column ? "text-[#5B2D91]" : "text-[#8A8A8A]"}`} />
      </div>
    </TableHead>
  )

  const modalTitle = {
    archive: `Archive "${modal.report?.title}"?`,
    delete: `Delete draft "${modal.report?.title}"?`,
    restore: `Restore "${modal.report?.title}"?`,
  }

  const modalDescription = {
    archive: "This report will be moved to the archive. You can restore it later.",
    delete: "This draft will be permanently deleted. This action cannot be undone.",
    restore: "This report will be restored and become visible again.",
  }

  const modalConfirmLabel = {
    archive: "Archive",
    delete: "Delete",
    restore: "Restore",
  }

  const modalConfirmVariant = {
    archive: "default" as const,
    delete: "destructive" as const,
    restore: "default" as const,
  }

  return (
    <>
      <div className="table-card border-[#EDEDED]">
        <div className="users-table-desktop">
          <Table>
            <TableHeader>
              <TableRow className="table-header-row-bordered">
                <SortableHeader column="title" className="min-w-[180px]">
                  Report title/ID
                </SortableHeader>
                <SortableHeader column="customer" className="min-w-[160px]">
                  Customer name
                </SortableHeader>
                {showSalesRepColumn && (
                  <SortableHeader column="salesperson" className="min-w-[160px]">
                    Sales representative
                  </SortableHeader>
                )}
                <SortableHeader column="segment" className="min-w-[120px]">
                  Segment
                </SortableHeader>
                <SortableHeader column="status" className="min-w-[100px]">
                  Status
                </SortableHeader>
                <SortableHeader column="reportdate" className="min-w-[120px]">
                  Report date
                </SortableHeader>
                <SortableHeader column="createdat" className="min-w-[120px]">
                  Created at
                </SortableHeader>
                <TableHead className="table-header-cell min-w-[120px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} className="table-body-row">
                  <TableCell className="table-name-cell min-w-[180px]" data-label="Report title/ID">
                    <div className="flex flex-col gap-0.5">
                      <span className="table-name-text truncate">{report.title}</span>
                      <span className="table-muted-text">{report.id.substring(0, 8)}</span>
                    </div>
                  </TableCell>

                  <TableCell className="min-w-[160px]" data-label="Customer name">
                    <div className="flex items-center gap-2">
                      <Avatar size="sm">
                        {report.customerLogoUrl && (
                          <AvatarImage src={report.customerLogoUrl} alt={report.customerName} />
                        )}
                        <AvatarFallback>{getInitials(report.customerName)}</AvatarFallback>
                      </Avatar>
                      <span className="table-muted-text truncate">{report.customerName}</span>
                    </div>
                  </TableCell>

                  {showSalesRepColumn && (
                    <TableCell className="min-w-[160px]" data-label="Sales representative">
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          {report.salesRepProfileImageUrl && (
                            <AvatarImage src={report.salesRepProfileImageUrl} alt={report.salesRepresentative} />
                          )}
                          <AvatarFallback>{getInitials(report.salesRepresentative)}</AvatarFallback>
                        </Avatar>
                        <span className="table-muted-text truncate">{report.salesRepresentative}</span>
                      </div>
                    </TableCell>
                  )}

                  <TableCell className="table-muted-text min-w-[120px]" data-label="Segment">
                    {report.customerSegment ?? "-"}
                  </TableCell>

                  <TableCell className="min-w-[100px]" data-label="Status">
                    <Badge className={`table-status-badge ${getStatusClass(report.statusLabel)}`}>
                      {report.statusLabel}
                    </Badge>
                  </TableCell>

                  <TableCell className="table-muted-text min-w-[120px]" data-label="Report date">
                    {formatDate(report.reportDate)}
                  </TableCell>

                  <TableCell className="table-muted-text min-w-[120px]" data-label="Created at">
                    {formatDate(report.createdAt)}
                  </TableCell>

                  <TableCell className="min-w-[120px]" data-label="Actions">
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
                          onClick={() => openModal(getArchiveAction(report), report)}
                          className="table-action-btn"
                          aria-label={report.statusLabel === "Draft" ? `Delete ${report.title}` : `Archive ${report.title}`}
                        >
                          {report.statusLabel === "Draft" ? (
                            <Trash2 className="table-action-icon" />
                          ) : (
                            <Archive className="table-action-icon" />
                          )}
                        </button>
                      )}
                      {canRestore(report) && (
                        <button
                          onClick={() => openModal("restore", report)}
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

              <div className="flex items-center gap-2 text-[14px] text-[#4E4E4E]">
                <Avatar size="sm">
                  {report.customerLogoUrl && (
                    <AvatarImage src={report.customerLogoUrl} alt={report.customerName} />
                  )}
                  <AvatarFallback>{getInitials(report.customerName)}</AvatarFallback>
                </Avatar>
                Customer name : {report.customerName}
              </div>

              {showSalesRepColumn && (
                <div className="flex items-center gap-2 text-[14px] text-[#4E4E4E]">
                  <Avatar size="sm">
                    {report.salesRepProfileImageUrl && (
                      <AvatarImage src={report.salesRepProfileImageUrl} alt={report.salesRepresentative} />
                    )}
                    <AvatarFallback>{getInitials(report.salesRepresentative)}</AvatarFallback>
                  </Avatar>
                  Sales representative: {report.salesRepresentative}
                </div>
              )}

              {report.customerSegment && (
                <div className="text-[14px] text-[#4E4E4E]">
                  Segment : {report.customerSegment}
                </div>
              )}

              <div className="text-[14px] text-[#4E4E4E]">
                Report date : {formatDate(report.reportDate)}
              </div>

              <div className="text-[14px] text-[#4E4E4E]">
                Created at : {formatDate(report.createdAt)}
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
                    onClick={() => openModal(getArchiveAction(report), report)}
                    className="flex items-center gap-2 text-[#5B2D91] text-[14px]"
                  >
                    {report.statusLabel === "Draft" ? "Delete" : "Archive"}
                    {report.statusLabel === "Draft" ? <Trash2 className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                  </button>
                )}
                {canRestore(report) && (
                  <button
                    onClick={() => openModal("restore", report)}
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

      {/* Confirmation Modal */}
      <Dialog open={modal.open} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modal.report ? modalTitle[modal.action] : ""}</DialogTitle>
            <DialogDescription>{modalDescription[modal.action]}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant={modalConfirmVariant[modal.action]} onClick={handleConfirm}>
              {modalConfirmLabel[modal.action]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
