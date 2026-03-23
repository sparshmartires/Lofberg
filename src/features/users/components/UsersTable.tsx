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
import { UserMobileCard } from "./UserMobileCard"
import { UserItem, useDeleteUserMutation } from "@/store/services/usersApi"

interface UsersTableProps {
  users: UserItem[]
}

interface ViewUser {
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

const mapUserForView = (user: UserItem): ViewUser => {
  const fullName = `${user.firstName} ${user.lastName}`.trim()
  const displayName = fullName || user.email

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: displayName,
    email: user.email,
    roleId: user.roleId,
    role: user.roleName,
    status: user.isActive ? "Active" : "Inactive",
    reports: user.reportsCount,
    lastLogin: user.lastLogin,
    phone: user.phoneNumber || "",
    notes: user.notes || "",
    isActive: user.isActive,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=F2F2F2&color=6B6B6B`,
  }
}

export function UsersTable({ users }: UsersTableProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ViewUser | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<ViewUser | null>(null)
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()

  const userRows = users.map(mapUserForView)

  const columnWidths = {
    name: "w-[180px]",
    email: "w-[230px]",
    role: "w-[140px]",
    status: "w-[120px]",
    reports: "w-[100px]",
    lastLogin: "w-[110px]",
    actions: "w-[90px]",
  }

  const handleEdit = (user: ViewUser) => {
    setSelectedUser(user)
    setEditOpen(true)
  }

  const handleDeleteClick = (user: ViewUser) => {
    setUserToDelete(user)
    setDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    await deleteUser(userToDelete.id).unwrap()
    setDeleteOpen(false)
    setUserToDelete(null)
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
              {userRows.map((user) => (
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
                    {formatDate(user.lastLogin)}
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
                        onClick={() => handleDeleteClick(user)}
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
          {userRows.map((user) => (
            <UserMobileCard
              key={user.id}
              user={user}
              onEdit={() => handleEdit(user)}
              onDelete={() => handleDeleteClick(user)}
            />
          ))}
        </div>
      </div>
      {selectedUser && (
        <EditUserDialog
          userId={selectedUser.id}
          isActive={selectedUser.isActive}
          open={editOpen}
          onOpenChange={setEditOpen}
          defaultValues={{
            firstName: selectedUser.firstName,
            lastName: selectedUser.lastName,
            email: selectedUser.email,
            role: selectedUser.roleId,
            phone: selectedUser.phone || "",
            language: "",
            password: "",
            notes: selectedUser.notes || "",
          }}
        />
      )}
      <UserFeedbackDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        type="error"
        title="Are you sure?"
        description={`${userToDelete?.name || "This user"} will no longer have access to Löfbergs, and their profile will be archived.`}
        primaryActionLabel="Cancel"
        onPrimaryAction={() => setDeleteOpen(false)}
        secondaryActionLabel="Revoke"
        secondaryActionLoading={isDeleting}
        onSecondaryAction={handleConfirmDelete}
      />
    </>
  )
}
