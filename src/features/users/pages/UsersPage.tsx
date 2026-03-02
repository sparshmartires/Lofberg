"use client"

import { AddUserDialog } from "@/features/users/components/AddUserDialog"
import { useState } from "react"
import { AppPagination } from "@/components/ui/app-pagination"
import { UsersTable } from "../components/UsersTable"
import { UserFeedbackDialog } from "@/components/ui/user-feedback-dialog"
import { UsersHeaderActions } from "../components/UsersHeaderActions"
import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"
import { PageSectionTitle } from "@/components/layout/PageSectionTitle"
export function UsersPage() {
  const users: any[] = [] // Mock empty state
const [open, setOpen] = useState(false)
const [successOpen, setSuccessOpen] = useState(false)
 const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
const handleUserCreated = () => {
  setOpen(false)

  setTimeout(() => {
    setSuccessOpen(true)
  }, 200)
}

  return (
    <>
    <div className="min-h-screen bg-background py-10">

      {/* Header */}
      <PageHeaderWithAction
        title="User Management"
        description="Manage system administrators and users"
        actionLabel="Add User"
        onActionClick={() => setOpen(true)}
      />


      {/* Card Container */}
      <div className="rounded-[24px] bg-white shadow-sm py-[32px] px-[24px] max-[649px]:p-[12px]">

        <div className="flex items-center justify-between mb-[28px] max-[649px]:mb-[16px] gap-6">
          <PageSectionTitle title="System Users" />
<div className="max-[649px]:hidden">
  <UsersHeaderActions
    search={search}
    status={status}
    onSearchChange={setSearch}
    onStatusChange={setStatus}
  />
</div>
        </div>

        {users.length === 0 ? (
        //   <UsersEmptyState />
        <>
     <UsersTable />

</>
        ) : (
          <div>
            {/* Table will go here later */}
          </div>
        )}

      </div>
      <AppPagination />
    </div>
    <AddUserDialog open={open} onOpenChange={setOpen} 
     onUserCreated={handleUserCreated}
    />
<UserFeedbackDialog
     open={successOpen}
  onOpenChange={setSuccessOpen}
  type="success"
  title="User created successfully. "
  description=""
  />
    </>
  )
}
