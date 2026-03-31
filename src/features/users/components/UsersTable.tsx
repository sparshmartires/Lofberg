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
import { ArrowUpDown, Pencil, Archive, RotateCcw } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { EditUserDialog } from "./EditUserDialog"
import { UserFeedbackDialog } from "@/components/ui/user-feedback-dialog"
import { UserMobileCard } from "./UserMobileCard"
import { UserItem, useDeleteUserMutation, useUpdateUserMutation } from "@/store/services/usersApi"

interface UsersTableProps {
  users: UserItem[]
  sortBy?: string
  sortDirection?: string
  onSort?: (column: string) => void
}

interface ViewUser {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  roleId: string
  role: string
  status: "Active" | "Archived"
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
    status: user.isActive ? "Active" : "Archived",
    reports: user.reportsCount,
    lastLogin: user.lastLogin,
    phone: user.phoneNumber || "",
    notes: user.notes || "",
    isActive: user.isActive,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=F2F2F2&color=6B6B6B`,
  }
}

export function UsersTable({ users, sortBy, sortDirection, onSort }: UsersTableProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ViewUser | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<ViewUser | null>(null)
  const [userToRestore, setUserToRestore] = useState<ViewUser | null>(null)
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()
  const [updateUser, { isLoading: isRestoring }] = useUpdateUserMutation()

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

  const handleRestoreClick = (user: ViewUser) => {
    setUserToRestore(user)
    setRestoreOpen(true)
  }

  const handleConfirmRestore = async () => {
    if (!userToRestore) return

    await updateUser({
      id: userToRestore.id,
      body: {
        firstName: userToRestore.firstName,
        lastName: userToRestore.lastName,
        email: userToRestore.email,
        roleId: userToRestore.roleId,
        isActive: true,
      } as any,
    }).unwrap()
    setRestoreOpen(false)
    setUserToRestore(null)
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
                <SortableHeader column="role" className={columnWidths.role}>
                  Role
                </SortableHeader>
                <SortableHeader column="status" className={columnWidths.status}>
                  Status
                </SortableHeader>
                <TableHead className={`table-header-cell ${columnWidths.reports}`}>
                  Reports generated
                </TableHead>
                <SortableHeader column="lastlogin" className={columnWidths.lastLogin}>
                  Last login
                </SortableHeader>
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
                  <TableCell className={`table-muted-text ${columnWidths.email}`} data-label="Email">
                    <span className="block truncate max-w-[280px]" title={user.email}>{user.email}</span>
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

                      {/* ARCHIVE/RESTORE BUTTON */}
                      {user.isActive ? (
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="table-action-btn"
                          title="Archive"
                        >
                          <Archive className="table-action-icon" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRestoreClick(user)}
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
        <div className="users-list-mobile">
          {userRows.map((user) => (
            <UserMobileCard
              key={user.id}
              user={user}
              onEdit={() => handleEdit(user)}
              onDelete={() => user.isActive ? handleDeleteClick(user) : handleRestoreClick(user)}
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
            notes: selectedUser.notes || "",
          }}
        />
      )}
      <UserFeedbackDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        type="error"
        title="Archive user"
        description={`${userToDelete?.name || "This user"} will no longer have access to the platform and their profile will be archived.`}
        primaryActionLabel="Cancel"
        onPrimaryAction={() => setDeleteOpen(false)}
        secondaryActionLabel="Archive"
        secondaryActionLoading={isDeleting}
        onSecondaryAction={handleConfirmDelete}
      />
      <UserFeedbackDialog
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
        type="success"
        title="Restore user"
        description={`${userToRestore?.name || "This user"} will be restored and will be able to access the platform again.`}
        primaryActionLabel="Cancel"
        onPrimaryAction={() => setRestoreOpen(false)}
        secondaryActionLabel="Restore"
        secondaryActionLoading={isRestoring}
        onSecondaryAction={handleConfirmRestore}
      />
    </>
  )
}
