"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { ArrowUpDown, Pencil, Eye, Archive, RotateCcw } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { EditCustomerDialog } from "./EditCustomerPage"
import { CustomerItem, useUpdateCustomerMutation, useDeleteCustomerMutation } from "@/store/services/customersApi"
import { UserFeedbackDialog } from "@/components/ui/user-feedback-dialog"

interface CustomerRow {
  id: string
  name: string
  segment: string
  serviceTier: string
  lastReportDate: string | null
  status: "Active" | "Archived"
  isActive: boolean
  reportsGenerated: number
  avatar: string
}

interface CustomersTableProps {
  customers: CustomerItem[]
  sortBy?: string
  sortDirection?: string
  onSort?: (column: string) => void
}

const getServiceTierLabel = (serviceTier: number | null) => {
  if (serviceTier === 1) return "Type A"
  if (serviceTier === 2) return "Type B"
  return "-"
}

const formatDate = (value: string | null) => {
  if (!value) return "-"

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

const mapCustomerForView = (customer: CustomerItem): CustomerRow => ({
  id: customer.id,
  name: customer.name || "-",
  segment: customer.segmentName || "-",
  serviceTier: getServiceTierLabel(customer.serviceTier),
  lastReportDate: formatDate(customer.lastReportDate),
  status: customer.isActive ? "Active" : "Archived",
  isActive: customer.isActive,
  reportsGenerated: customer.reportsGenerated ?? 0,
  avatar:
    customer.logoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name || "Customer")}&background=F2F2F2&color=6B6B6B`,
})

export function CustomersTable({ customers, sortBy, sortDirection, onSort }: CustomersTableProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [confirmArchive, setConfirmArchive] = useState<CustomerRow | null>(null)
  const [confirmRestore, setConfirmRestore] = useState<CustomerRow | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null)
  const [deleteCustomer] = useDeleteCustomerMutation()
  const [updateCustomer] = useUpdateCustomerMutation()

  const customerRows = customers.map(mapCustomerForView)

  const handleEdit = (customer: CustomerRow) => {
    setSelectedCustomer(customer)
    setEditOpen(true)
  }

  const handleView = (customer: CustomerRow) => {
    setSelectedCustomer(customer)
    setViewOpen(true)
  }
  const handleArchive = async (customer: CustomerRow) => {
    try {
      await updateCustomer({ id: customer.id, body: { isActive: false } as any }).unwrap()
    } catch { /* handled by RTK */ }
    setConfirmArchive(null)
  }

  const handleRestore = async (customer: CustomerRow) => {
    try {
      await updateCustomer({ id: customer.id, body: { isActive: true } as any }).unwrap()
    } catch { /* handled by RTK */ }
    setConfirmRestore(null)
  }

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

  return (
    <>
      <div className="table-card border-[0px]">
        <div className="customers-desktop overflow-x-auto">
        <Table className="w-full min-w-[860px]">
          {/* HEADER */}
          <TableHeader>
            <TableRow className="table-header-row-bordered">
              <SortableHeader column="name">
                Name
              </SortableHeader>
              <SortableHeader column="segment">
                Segment
              </SortableHeader>
              <SortableHeader column="servicetier">
                Service tier
              </SortableHeader>
              <TableHead className="table-header-cell">
                Last report date
              </TableHead>
              <TableHead className="table-header-cell">
                Reports
              </TableHead>
              <SortableHeader column="status">
                Status
              </SortableHeader>
              <TableHead className="table-header-cell">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* BODY */}
          <TableBody>
            {customerRows.map((customer) => (
              <TableRow
                key={customer.id}
                className="table-body-row"
              >
                {/* NAME */}
                <TableCell className="table-name-cell max-w-[280px]">
                  <div className="flex items-center gap-[8px]">
                    <Image
                      src={customer.avatar}
                      alt={customer.name}
                      width={24}
                      height={24}
                      className="rounded-full object-cover shrink-0"
                    />
                    <span className="table-name-text truncate" title={customer.name}>
                      {customer.name}
                    </span>
                  </div>
                </TableCell>

                {/* SEGMENT */}
                <TableCell className="table-muted-text">
                  {customer.segment}
                </TableCell>

                {/* SERVICE TIER */}
                <TableCell className="table-muted-text">
                  {customer.serviceTier}
                </TableCell>

                {/* LAST REPORT DATE */}
                <TableCell className="table-muted-text">
                  {customer.lastReportDate}
                </TableCell>

                {/* REPORTS */}
                <TableCell>
                  <button
                    className="text-[#5B2D91] hover:underline cursor-pointer"
                    onClick={() => router.push(`/historical-reports?customerId=${customer.id}`)}
                  >
                    {customer.reportsGenerated}
                  </button>
                </TableCell>

                {/* STATUS */}
                <TableCell>
                  <span
                    className={`
    w-[84px] h-[32px] inline-flex items-center justify-center rounded-[99px]
    px-[8px] py-[4px] text-[12px] font-medium
    ${customer.status === "Active"
                        ? "bg-[#7DB356] text-white"
                        : "bg-[#E5E5E5] text-[#6B6B6B]"
                      }
  `}
                  >
                    {customer.status}
                  </span>
                </TableCell>

                {/* ACTIONS */}
                <TableCell className="text-right">
                  <div className="table-actions-wrap">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="table-action-btn"
                      title="Edit"
                    >
                      <Pencil className="table-action-icon" />
                    </button>

                    <button
                      onClick={() => handleView(customer)}
                      className="table-action-btn"
                      title="View details"
                    >
                      <Eye className="table-action-icon" />
                    </button>

                    {customer.isActive ? (
                      <button
                        onClick={() => setConfirmArchive(customer)}
                        className="table-action-btn"
                        title="Archive"
                      >
                        <Archive className="table-action-icon" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmRestore(customer)}
                        className="table-action-btn"
                        title="Restore"
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
      </div>
<div className="customers-mobile">
  {customerRows.map((customer) => (
    <div key={customer.id} className="customer-card">

      {/* Top Row */}
      <div className="customer-card-header">
        <div className="flex items-center gap-3">
          <Image
            src={customer.avatar}
            alt={customer.name}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <span className="customer-name">
            {customer.name}
          </span>
        </div>

        <span
          className={`customer-status ${
            customer.status === "Active"
              ? "active"
              : "inactive"
          }`}
        >
          {customer.status}
        </span>
      </div>
  <div className="customer-divider" />
      {/* Segment + Date */}
      <div className="customer-info">
        <div className="customer-row">
          <span className="label">Segment: {customer.segment}</span>
           <span className="label">Service tier:{customer.serviceTier}</span>
        </div>

        <div className="text-right">
          <span className="label">Last report date</span>
          <div className="value">{customer.lastReportDate}</div>
        </div>
        <div>
          <span className="label">Reports: </span>
          <button
            className="text-[#5B2D91] hover:underline"
            onClick={() => router.push(`/historical-reports?customerId=${customer.id}`)}
          >
            {customer.reportsGenerated}
          </button>
        </div>
      </div>

      {/* Service Tier */}
     

      <div className="customer-divider" />

      {/* Actions */}
      <div className="customer-actions">
        <button
          onClick={() => handleEdit(customer)}
          className="edit-link"
        >
          Edit <Pencil className="h-3 w-3 ml-1" />
        </button>

        <button
          onClick={() => handleView(customer)}
          className="view-link"
        >
          View details <Eye className="h-3 w-3 ml-1" />
        </button>

        {customer.isActive ? (
          <button
            onClick={() => setConfirmArchive(customer)}
            className="edit-link"
          >
            Archive <Archive className="h-3 w-3 ml-1" />
          </button>
        ) : (
          <button
            onClick={() => setConfirmRestore(customer)}
            className="edit-link"
          >
            Restore <RotateCcw className="h-3 w-3 ml-1" />
          </button>
        )}
      </div>

    </div>
  ))}
</div>
      {/* EDIT DIALOG */}
      {selectedCustomer && (
        <EditCustomerDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          customerId={selectedCustomer.id}
        />
      )}

      {/* VIEW DETAILS DIALOG (read-only) */}
      {selectedCustomer && (
        <EditCustomerDialog
          open={viewOpen}
          onOpenChange={setViewOpen}
          customerId={selectedCustomer.id}
          readOnly
        />
      )}

      {/* ARCHIVE CONFIRM */}
      <UserFeedbackDialog
        open={!!confirmArchive}
        onOpenChange={() => setConfirmArchive(null)}
        type="error"
        title="Archive customer"
        description={`${confirmArchive?.name || "This customer"} will be archived and hidden from active lists.`}
        primaryActionLabel="Archive"
        onPrimaryAction={() => confirmArchive && handleArchive(confirmArchive)}
        secondaryActionLabel="Cancel"
        onSecondaryAction={() => setConfirmArchive(null)}
      />

      {/* RESTORE CONFIRM */}
      <UserFeedbackDialog
        open={!!confirmRestore}
        onOpenChange={() => setConfirmRestore(null)}
        type="success"
        title="Restore customer"
        description={`${confirmRestore?.name || "This customer"} will be restored to active status.`}
        primaryActionLabel="Restore"
        onPrimaryAction={() => confirmRestore && handleRestore(confirmRestore)}
        secondaryActionLabel="Cancel"
        onSecondaryAction={() => setConfirmRestore(null)}
      />
    </>
  )
}
