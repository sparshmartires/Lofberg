"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Pencil, Eye } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { EditCustomerDialog } from "./EditCustomerPage"
import { CustomerHistoryDialog } from "./CustomerHistoryDialog"

interface Customer {
  id: number
  name: string
  segment: string
  serviceTier: string
  lastReportDate: string
  status: "Active" | "Inactive"
  avatar: string
}

const customers: Customer[] = [
  {
    id: 1,
    name: "Karin Bergström",
    segment: "Hotel",
    serviceTier: "Type A",
    lastReportDate: "02/02/2026",
    status: "Active",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Cecilia Holm",
    segment: "Retail chain",
    serviceTier: "Type A",
    lastReportDate: "02/02/2026",
    status: "Active",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    id: 3,
    name: "Anna Svensson",
    segment: "Arena",
    serviceTier: "Type A",
    lastReportDate: "01/27/2025",
    status: "Inactive",
    avatar: "https://randomuser.me/api/portraits/women/21.jpg",
  },
]

export function CustomersTable() {
  const [editOpen, setEditOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null)

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditOpen(true)
  }

  const handleHistory = (customer: Customer) => {
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
  return (
    <>
      <div className="table-card border-[0px]">
        <div className="customers-desktop">
        <Table className="table-fixed">
          {/* HEADER */}
          <TableHeader>
            <TableRow className="table-header-row-bordered">
              <TableHead className={`table-header-cell ${columnWidths.name}`}>
                Name
              </TableHead>
              <TableHead className="table-header-cell">
                Segment
              </TableHead>
              <TableHead className="table-header-cell">
                Service tier
              </TableHead>
              <TableHead className="table-header-cell">
                Last report date
              </TableHead>
              <TableHead className="table-header-cell">
                Status
              </TableHead>
              <TableHead className="table-header-cell">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* BODY */}
          <TableBody>
            {customers.map((customer) => (
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
  {customers.map((customer) => (
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
          //@ts-ignore
          customer={selectedCustomer}
          onCustomerUpdated={() => { }}
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
