"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { ArrowUpDown, Pencil, Eye } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { EditCustomerDialog } from "./EditCustomerPage"
import { CustomerHistoryDialog } from "./CustomerHistoryDialog"
import { CustomerItem } from "@/store/services/customersApi"

interface CustomerRow {
  id: string
  name: string
  segment: string
  serviceTier: string
  lastReportDate: string | null
  status: "Active" | "Inactive"
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
  status: customer.isActive ? "Active" : "Inactive",
  avatar:
    customer.logoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name || "Customer")}&background=F2F2F2&color=6B6B6B`,
})

export function CustomersTable({ customers, sortBy, sortDirection, onSort }: CustomersTableProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null)

  const customerRows = customers.map(mapCustomerForView)

  const handleEdit = (customer: CustomerRow) => {
    setSelectedCustomer(customer)
    setEditOpen(true)
  }

  const handleHistory = (customer: CustomerRow) => {
    setSelectedCustomer(customer)
    setHistoryOpen(true)
  }
  const columnWidths = {
    name: "w-[220px]",
    email: "w-[230px]",
    role: "w-[140px]",
    status: "w-[120px]",
    reports: "w-[100px]",
    lastLogin: "w-[110px]",
    actions: "w-[90px]",
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
        <Table className="table-fixed min-w-[760px]">
          {/* HEADER */}
          <TableHeader>
            <TableRow className="table-header-row-bordered">
              <SortableHeader column="name" className={columnWidths.name}>
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
                <TableCell className={`table-name-cell ${columnWidths.name}`}>
                  <div className="flex items-center gap-[8px]">
                    <Image
                      src={customer.avatar}
                      alt={customer.name}
                      width={24}
                      height={24}
                      className="rounded-full object-cover"
                    />
                    <span className="table-name-text">
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

                {/* STATUS */}
                <TableCell>
                  <span
                    className={`
    w-[84px]
    h-[32px]
    inline-flex
    items-center
    justify-center
    rounded-[99px]
    px-[8px]
    py-[4px]
    text-[12px]
    font-medium
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
                    >
                      <Pencil className="table-action-icon" />
                    </button>

                    <button
                      onClick={() => handleHistory(customer)}
                      className="table-action-btn"
                    >
                      <Eye className="table-action-icon" />
                    </button>
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
          onClick={() => handleHistory(customer)}
          className="view-link"
        >
          View Details <Eye className="h-3 w-3 ml-1" />
        </button>
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

      {/* HISTORY DIALOG */}
      {selectedCustomer && (
        <CustomerHistoryDialog
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          userName={selectedCustomer.name}
          avatar={selectedCustomer.avatar}
        />
      )}
    </>
  )
}
