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
import { EyeIcon, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { EditSalesDialog } from "./EditSalesDialog"
import { SalesHistoryDialog } from "./SalesHistoryDialog"

interface User {
    id: number
    name: string
    email: string
    role: string
    status: "Active" | "Inactive"
    reports: number
    lastLogin: string
    avatar: string
}

const users: User[] = [
    {
        id: 1,
        name: "Karin Bergström",
        email: "karin.bergstrom@acme.com",
        role: "Salesperson",
        status: "Active",
        reports: 92,
        lastLogin: "02/02/2026",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
        id: 2,
        name: "Anna Svensson",
        email: "anna.svensson@lofbergs.se",
        role: "Salesperson",
        status: "Inactive",
        reports: 29,
        lastLogin: "01/27/2025",
        avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    },
    {
        id: 3,
        name: "Karin Bergström",
        email: "karin.bergstrom@acme.com",
        role: "Salesperson",
        status: "Active",
        reports: 92,
        lastLogin: "02/02/2026",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
        id: 4,
        name: "Anna Svensson",
        email: "anna.svensson@lofbergs.se",
        role: "Salesperson",
        status: "Inactive",
        reports: 29,
        lastLogin: "01/27/2025",
        avatar: "https://randomuser.me/api/portraits/women/21.jpg",
    },
    {
        id: 5,
        name: "Karin Bergström",
        email: "karin.bergstrom@acme.com",
        role: "Salesperson",
        status: "Active",
        reports: 92,
        lastLogin: "02/02/2026",
        avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    },
    {
        id: 6,
        name: "Anna Svensson",
        email: "anna.svensson@lofbergs.se",
        role: "Salesperson",
        status: "Inactive",
        reports: 29,
        lastLogin: "01/27/2025",
        avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    },
    {
        id: 7,
        name: "Karin Bergström",
        email: "karin.bergstrom@acme.com",
        role: "Salesperson",
        status: "Active",
        reports: 92,
        lastLogin: "02/02/2026",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
        id: 8,
        name: "Anna Svensson",
        email: "anna.svensson@lofbergs.se",
        role: "Salesperson",
        status: "Inactive",
        reports: 29,
        lastLogin: "01/27/2025",
        avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    },
]

export function SalesTable() {
    const [editOpen, setEditOpen] = useState(false)
    const [selectedSale, setSelectedSale] = useState<User | null>(null)
    const [historyOpen, setHistoryOpen] = useState(false)
    const handleEdit = (sale: User) => {
        setSelectedSale(sale)
        setEditOpen(true)
    }
      const columnWidths = {
    name: "w-[180px]",
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

                <Table className="table-fixed">

                    {/* TABLE HEADER */}
                    <TableHeader>
                        <TableRow className="table-header-row-bordered">
                            <TableHead className={`table-header-cell ${columnWidths.name}`}>
                                Name
                            </TableHead>
                            <TableHead className={`table-header-cell ${columnWidths.email}`}>
                                Email
                            </TableHead>
                            <TableHead className={`table-header-cell ${columnWidths.role}`}>
                                Role
                            </TableHead>
                            <TableHead className={`table-header-cell ${columnWidths.status}`}>
                                Status
                            </TableHead>
                            <TableHead className={`table-header-cell ${columnWidths.reports}`}>
                                Reports
                            </TableHead>
                            <TableHead className={`table-header-cell ${columnWidths.lastLogin}`}>
                                Last login
                            </TableHead>
                            <TableHead className={`table-header-cell ${columnWidths.actions}`}>
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    {/* TABLE BODY */}
                    <TableBody>
                        {users.map((sale) => (
                            <TableRow
                                key={sale.id}
                                className="table-body-row"
                            >
                                {/* NAME */}
                                              <TableCell className={`table-name-cell ${columnWidths.name}`}>
                <div className="flex items-center gap-[8px]">

                                        <Image
                                            src={sale.avatar}
                                            alt={sale.name}
                                            width={24}
                                            height={24}
                                            className="rounded-full object-cover"
                                        />
                                        <span className="table-name-text">
                                            {sale.name}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* EMAIL */}
                                <TableCell className={`table-muted-text ${columnWidths.email} truncate`}>
                                    {sale.email}
                                </TableCell>

                                {/* ROLE */}
                                <TableCell className={`table-role-cell ${columnWidths.role}`}>
                                    <Badge
                                        className="table-role-badge"
                                    >
                                        {sale.role}
                                    </Badge>
                                </TableCell>

                                {/* STATUS */}
                                <TableCell className={`table-status-cell ${columnWidths.status}`}>
                                    <Badge
                                        className={`
                    table-status-badge
                    ${sale.status === "Active"
                                                ? "bg-[#7DB356] text-white"
                                                : "bg-[#E5E5E5] text-[#6B6B6B]"
                                            }
                  `}
                                    >
                                        {sale.status}
                                    </Badge>
                                </TableCell>

                                {/* REPORTS */}
                                <TableCell className={`table-name-text ${columnWidths.reports}`}>
                                    {sale.reports}
                                </TableCell>

                                {/* LAST LOGIN */}
                                <TableCell className={`table-muted-text ${columnWidths.lastLogin}`}>
                                    {sale.lastLogin}
                                </TableCell>

                                {/* ACTIONS */}
                                <TableCell className={`text-right ${columnWidths.actions}`}>
                                    <div className="table-actions-wrap">

                                        {/* EDIT BUTTON */}
                                        <button
                                            onClick={() => handleEdit(sale)}
                                            className="table-action-btn"
                                        >
                                            <Pencil className="table-action-icon"
                                            />
                                        </button>

                                        {/* DELETE BUTTON */}
                                        <button
                                            onClick={() => setHistoryOpen(true)}
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
            {selectedSale && (
                <EditSalesDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    defaultValues={{
                        //@ts-ignore
                        firstName: selectedSale.firstName,
                        //@ts-ignore
                        lastName: selectedSale.lastName,
                        email: selectedSale.email,
                        role: selectedSale.role,
                        //@ts-ignore
                        phone: selectedSale.phone || "",
                        //@ts-ignore
                        language: selectedSale.language || "",
                        password: "",
                        //@ts-ignore
                        notes: selectedSale.notes || "",
                    }}
                />
            )}
            <SalesHistoryDialog
                open={historyOpen}
                onOpenChange={setHistoryOpen}
                userName="Karin Bergström"
                avatar="https://randomuser.me/api/portraits/men/32.jpg"
            />
        </>
    )
}
