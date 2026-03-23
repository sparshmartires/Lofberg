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
import { ArrowUpDown, EyeIcon, Pencil } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { EditSalesDialog } from "./EditSalesDialog"
import { SalesHistoryDialog } from "./SalesHistoryDialog"
import { SalesRepresentativeItem } from "@/store/services/salesRepresentativesApi"

interface SalesTableProps {
  salesReps: SalesRepresentativeItem[]
  sortBy?: string
  sortDirection?: string
  onSort?: (column: string) => void
}

interface ViewSalesRep {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  roleId: string
  role: string
  status: "Active" | "Inactive"
  reports: number
  lastLogin: string | null
  phone: string
  notes: string
  avatar: string
  isActive: boolean
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

const mapSalesRepForView = (salesRep: SalesRepresentativeItem): ViewSalesRep => {
  const fullName = `${salesRep.firstName} ${salesRep.lastName}`.trim()
  const displayName = fullName || salesRep.email

  return {
    id: salesRep.id,
    firstName: salesRep.firstName,
    lastName: salesRep.lastName,
    name: displayName,
    email: salesRep.email,
    roleId: salesRep.roleId,
    role: salesRep.roleName,
    status: salesRep.isActive ? "Active" : "Inactive",
    reports: salesRep.reportsCount,
    lastLogin: salesRep.lastLogin,
    phone: salesRep.phoneNumber || "",
    notes: salesRep.notes || "",
    isActive: salesRep.isActive,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=F2F2F2&color=6B6B6B`,
  }
}

export function SalesTable({ salesReps, sortBy, sortDirection, onSort }: SalesTableProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [selectedSalesRep, setSelectedSalesRep] = useState<ViewSalesRep | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historySalesRep, setHistorySalesRep] = useState<ViewSalesRep | null>(null)

  const salesRows = salesReps.map(mapSalesRepForView)

  const columnWidths = {
    name: "w-[180px]",
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

  const handleEdit = (salesRep: ViewSalesRep) => {
    setSelectedSalesRep(salesRep)
    setEditOpen(true)
  }

  const handleHistoryClick = (salesRep: ViewSalesRep) => {
    setHistorySalesRep(salesRep)
    setHistoryOpen(true)
  }

  return (
    <>
      <div className="table-card border-[#EDEDED]">
        <div className="users-table-desktop">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="table-header-row-bordered">
                <SortableHeader column="name" className={columnWidths.name}>
                  Name
                </SortableHeader>
                <TableHead className={`table-header-cell ${columnWidths.email}`}>
                  Email
                </TableHead>
                <SortableHeader column="role" className={columnWidths.role}>
                  Role
                </SortableHeader>
                <SortableHeader column="status" className={columnWidths.status}>
                  Status
                </SortableHeader>
                <TableHead className={`table-header-cell ${columnWidths.reports}`}>
                  Reports
                </TableHead>
                <SortableHeader column="lastlogin" className={columnWidths.lastLogin}>
                  Last login
                </SortableHeader>
                <TableHead className={`table-header-cell ${columnWidths.actions}`}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {salesRows.map((salesRep) => (
                <TableRow
                  key={salesRep.id}
                  className="table-body-row"
                >
                  <TableCell className={`table-name-cell ${columnWidths.name}`} data-label="Name">
                    <div className="flex items-center gap-[8px]">
                      <Image
                        src={salesRep.avatar}
                        alt={salesRep.name}
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                      />
                      <span className="table-name-text">
                        {salesRep.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className={`table-muted-text ${columnWidths.email} truncate`} data-label="Email">
                    {salesRep.email}
                  </TableCell>

                  <TableCell className={columnWidths.role} data-label="Role">
                    <Badge className="table-role-badge">
                      {salesRep.role}
                    </Badge>
                  </TableCell>

                  <TableCell className={columnWidths.status} data-label="Status">
                    <Badge
                      className={`
                    table-status-badge
                    ${salesRep.status === "Active"
                          ? "bg-[#7DB356] text-white"
                          : "bg-[#E5E5E5] text-[#6B6B6B]"
                        }
                  `}
                    >
                      {salesRep.status}
                    </Badge>
                  </TableCell>

                  <TableCell className={`table-name-text ${columnWidths.reports}`} data-label="Reports">
                    {salesRep.reports}
                  </TableCell>

                  <TableCell className={`table-muted-text ${columnWidths.lastLogin}`} data-label="Last login">
                    {formatDate(salesRep.lastLogin)}
                  </TableCell>

                  <TableCell className={columnWidths.actions} data-label="Actions">
                    <div className="table-actions-wrap">
                      <button
                        onClick={() => handleEdit(salesRep)}
                        className="table-action-btn"
                      >
                        <Pencil className="table-action-icon" />
                      </button>

                      <button
                        onClick={() => handleHistoryClick(salesRep)}
                        className="table-action-btn"
                      >
                        <EyeIcon className="table-action-icon" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="users-list-mobile">
          {salesRows.map((salesRep) => (
            <div key={salesRep.id} className="user-mobile-card">
              <div className="user-mobile-header">
                <div className="flex items-center gap-3">
                  <Image
                    src={salesRep.avatar}
                    alt={salesRep.name}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                  <span className="user-mobile-name">
                    {salesRep.name}
                  </span>
                </div>

                <Badge
                  className={
                    salesRep.status === "Active"
                      ? "bg-[#7DB356] text-white rounded-full px-4 py-1 text-xs"
                      : "bg-[#E5E5E5] text-[#6B6B6B] rounded-full px-4 py-1 text-xs"
                  }
                >
                  {salesRep.status}
                </Badge>
              </div>

              <div className="user-mobile-divider" />

              <div className="user-mobile-split-row">
                <div>
                  <div className="user-mobile-label">Email : {salesRep.email}</div>
                  <span className="user-mobile-label">Role : {salesRep.role}</span>
                </div>

                <div className="text-right">
                  <div className="user-mobile-label">Last login</div>
                  <div className="user-mobile-value">{formatDate(salesRep.lastLogin)}</div>
                </div>
              </div>

              <div className="user-mobile-stacked">
                <span className="user-mobile-label">Reports : {salesRep.reports}</span>
                <span className="user-mobile-value"></span>
              </div>

              <div className="user-mobile-divider" />

              <div className="user-mobile-actions">
                <button onClick={() => handleEdit(salesRep)} className="mobile-edit">
                  Edit <Pencil className="h-3 w-3 inline ml-1" />
                </button>

                <button onClick={() => handleHistoryClick(salesRep)} className="mobile-delete">
                  History <EyeIcon className="h-3 w-3 inline ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedSalesRep && (
        <EditSalesDialog
          salesRepId={selectedSalesRep.id}
          currentIsActive={selectedSalesRep.isActive}
          open={editOpen}
          onOpenChange={setEditOpen}
          defaultValues={{
            fullName: selectedSalesRep.name,
            email: selectedSalesRep.email,
            role: selectedSalesRep.roleId,
            phone: selectedSalesRep.phone,
            status: selectedSalesRep.isActive ? "active" : "inactive",
            notes: selectedSalesRep.notes,
          }}
        />
      )}

      <SalesHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        userName={historySalesRep?.name ?? "Sales Representative"}
        avatar={historySalesRep?.avatar ?? "https://ui-avatars.com/api/?name=Sales+Representative&background=F2F2F2&color=6B6B6B"}
      />
    </>
  )
}
