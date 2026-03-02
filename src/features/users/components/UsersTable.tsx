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
import { Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { EditUserDialog } from "./EditUserDialog"
import { UserFeedbackDialog } from "@/components/ui/user-feedback-dialog"

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
    avatar: "https://randomuser.me/api/portraits/men/44.jpg",
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
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 4,
    name: "Anna Svensson",
    email: "anna.svensson@lofbergs.se",
    role: "Salesperson",
    status: "Inactive",
    reports: 29,
    lastLogin: "01/27/2025",
    avatar: "https://randomuser.me/api/portraits/men/44.jpg",
  },
  {
    id: 5,
    name: "Karin Bergström",
    email: "karin.bergstrom@acme.com",
    role: "Salesperson",
    status: "Active",
    reports: 92,
    lastLogin: "02/02/2026",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    id: 6,
    name: "Anna Svensson",
    email: "anna.svensson@lofbergs.se",
    role: "Salesperson",
    status: "Inactive",
    reports: 29,
    lastLogin: "01/27/2025",
    avatar: "https://randomuser.me/api/portraits/women/21.jpg",
  },
  {
    id: 7,
    name: "Karin Bergström",
    email: "karin.bergstrom@acme.com",
    role: "Salesperson",
    status: "Active",
    reports: 92,
    lastLogin: "02/02/2026",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    id: 8,
    name: "Anna Svensson",
    email: "anna.svensson@lofbergs.se",
    role: "Salesperson",
    status: "Inactive",
    reports: 29,
    lastLogin: "01/27/2025",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
  },
]

export function UsersTable() {
  const [editOpen, setEditOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const columnWidths = {
    name: "w-[180px]",
    email: "w-[230px]",
    role: "w-[140px]",
    status: "w-[120px]",
    reports: "w-[100px]",
    lastLogin: "w-[110px]",
    actions: "w-[90px]",
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setEditOpen(true)
  }
  return (
    <>
      <div className="table-card border-[#EDEDED]">
        <div className="users-table-desktop">
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
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="table-body-row"
                >
                  {/* NAME */}
                  <TableCell className={`table-name-cell ${columnWidths.name}`} data-label="Name">
                    <div className="flex items-center gap-[8px]">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                      />
                      <span className="table-name-text">
                        {user.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* EMAIL */}
                  <TableCell className={`table-muted-text ${columnWidths.email} truncate`} data-label="Email">
                    {user.email}
                  </TableCell>

                  {/* ROLE */}
                  <TableCell className={columnWidths.role} data-label="Role">
                    <Badge
                      className="table-role-badge"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>

                  {/* STATUS */}
                  <TableCell className={columnWidths.status} data-label="Status">
                    <Badge
                      className={`
                    table-status-badge
                    ${user.status === "Active"
                          ? "bg-[#7DB356] text-white"
                          : "bg-[#E5E5E5] text-[#6B6B6B]"
                        }
                  `}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>

                  {/* REPORTS */}
                  <TableCell className={`table-name-text ${columnWidths.reports}`} data-label="Reports">
                    {user.reports}
                  </TableCell>

                  {/* LAST LOGIN */}
                  <TableCell className={`table-muted-text ${columnWidths.lastLogin}`} data-label="Last login">
                    {user.lastLogin}
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell className={`${columnWidths.actions}`} data-label="Actions">
                    <div className="table-actions-wrap">

                      {/* EDIT BUTTON */}
                      <button
                        onClick={() => handleEdit(user)}
                        className="table-action-btn"
                      >
                        <Pencil className="table-action-icon"
                        />
                      </button>

                      {/* DELETE BUTTON */}
                      <button
                        onClick={() => setDeleteOpen(true)}
                        className="table-action-btn"
                      >
                        <Trash2 className="table-action-icon" />
                      </button>

                    </div>
                  </TableCell>


                </TableRow>
              ))}
            </TableBody>

          </Table>
        </div>
        <div className="users-list-mobile">
          {users.map((user) => (
            <div key={user.id} className="user-mobile-card">

              {/* Header */}
              <div className="user-mobile-header">
                <div className="flex items-center gap-3">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                  <span className="user-mobile-name">
                    {user.name}
                  </span>
                </div>

                <Badge
                  className={
                    user.status === "Active"
                      ? "bg-[#7DB356] text-white rounded-full px-4 py-1 text-xs"
                      : "bg-[#E5E5E5] text-[#6B6B6B] rounded-full px-4 py-1 text-xs"
                  }
                >
                  {user.status}
                </Badge>
              </div>

              <div className="user-mobile-divider" />

              {/* Info Section */}

              {/* Email + Last login in one row */}
              <div className="user-mobile-split-row">
                <div>
                  <div className="user-mobile-label">Email : {user.email}</div>
                  <span className="user-mobile-label">Role : {user.role}</span>
                </div>

                <div className="text-right">
                  <div className="user-mobile-label">Last login</div>
                  <div className="user-mobile-value">{user.lastLogin}</div>
                </div>
              </div>

              {/* Role */}


              {/* Reports */}
              <div className="user-mobile-stacked">
                <span className="user-mobile-label">Reports : {user.reports}</span>
                <span className="user-mobile-value"></span>
              </div>

              <div className="user-mobile-divider" />

              {/* Actions */}
              <div className="user-mobile-actions">
                <button onClick={() => handleEdit(user)} className="mobile-edit">
                  Edit <Pencil className="h-3 w-3 inline ml-1" />
                </button>

                <button onClick={() => setDeleteOpen(true)} className="mobile-delete">
                  Delete <Trash2 className="h-3 w-3 inline ml-1" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
      {selectedUser && (
        <EditUserDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          defaultValues={{
            //@ts-ignore
            firstName: selectedUser.firstName,
            //@ts-ignore
            lastName: selectedUser.lastName,
            email: selectedUser.email,
            role: selectedUser.role,
            //@ts-ignore
            phone: selectedUser.phone || "",
            //@ts-ignore
            language: selectedUser.language || "",
            password: "",
            //@ts-ignore
            notes: selectedUser.notes || "",
          }}
        />
      )}
      <UserFeedbackDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        type="error"
        title="Are you sure?"
        description="karin will no longer have access to Lofberg, and their profile will be archived."
        primaryActionLabel="Cancel"
        onPrimaryAction={() => setDeleteOpen(false)}
        secondaryActionLabel="Revoke"
        onSecondaryAction={() => setDeleteOpen(false)}
      />
    </>
  )
}
