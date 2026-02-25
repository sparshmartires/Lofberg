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
    avatar: "/avatars/1.jpg",
  },
  {
    id: 2,
    name: "Cecilia Holm",
    segment: "Retail chain",
    serviceTier: "Type A",
    lastReportDate: "02/02/2026",
    status: "Active",
    avatar: "/avatars/2.jpg",
  },
  {
    id: 3,
    name: "Anna Svensson",
    segment: "Arena",
    serviceTier: "Type A",
    lastReportDate: "01/27/2025",
    status: "Inactive",
    avatar: "/avatars/3.jpg",
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

  return (
    <>
      <div className="rounded-[24px]  bg-white overflow-hidden">
        <Table>
          {/* HEADER */}
          <TableHeader>
            <TableRow className="h-[64px] ">
              <TableHead className="text-[14px] text-[#1F1F1F] font-normal">
                Name
              </TableHead>
              <TableHead className="text-[14px] text-[#1F1F1F] font-normal">
                Segment
              </TableHead>
              <TableHead className="text-[14px] text-[#1F1F1F] font-normal">
                Service tier
              </TableHead>
              <TableHead className="text-[14px] text-[#1F1F1F] font-normal">
                Last report date
              </TableHead>
              <TableHead className="text-[14px] text-[#1F1F1F] font-normal">
                Status
              </TableHead>
              <TableHead className="text-right text-[14px] text-[#1F1F1F] font-normal">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* BODY */}
          <TableBody>
            {customers.map((customer) => (
              <TableRow
                key={customer.id}
                className="h-[72px] border-b border-[#EDEDED] hover:bg-[#FAFAFA] transition"
              >
                {/* NAME */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image
                      src={customer.avatar}
                      alt={customer.name}
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                    <span className="text-[14px] text-[#1F1F1F]">
                      {customer.name}
                    </span>
                  </div>
                </TableCell>

                {/* SEGMENT */}
                <TableCell className="text-[14px] text-[#4E4E4E]">
                  {customer.segment}
                </TableCell>

                {/* SERVICE TIER */}
                <TableCell className="text-[14px] text-[#4E4E4E]">
                  {customer.serviceTier}
                </TableCell>

                {/* LAST REPORT DATE */}
                <TableCell className="text-[14px] text-[#4E4E4E]">
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
    ${
      customer.status === "Active"
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
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="w-[22px] h-[22px] rounded-[6px] bg-[#F4ECFB] flex items-center justify-center hover:bg-[#E9D8FA] transition"
                    >
                      <Pencil className="w-[11px] h-[11px] text-[#5B2D91]" />
                    </button>

                    <button
                      onClick={() => handleHistory(customer)}
                      className="w-[22px] h-[22px] rounded-[6px] bg-[#F4ECFB] flex items-center justify-center hover:bg-[#E9D8FA] transition"
                    >
                      <Eye className="w-[11px] h-[11px] text-[#5B2D91]" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* EDIT DIALOG */}
      {selectedCustomer && (
        <EditCustomerDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          //@ts-ignore
          customer={selectedCustomer}
          onCustomerUpdated={()=>{}}
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
