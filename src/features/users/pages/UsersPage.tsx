"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { UsersEmptyState } from "@/features/users/components/UsersEmptyState"
import { AddUserDialog } from "@/features/users/components/AddUserDialog"
import { useState } from "react"
import { UsersPagination } from "@/features/users/components/UsersPagination"
import { UsersTable } from "../components/UsersTable"
import { UserFeedbackDialog } from "@/components/ui/user-feedback-dialog"
import { UsersHeaderActions } from "../components/UsersHeaderActions"
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
      <div className="flex items-center justify-between pb-10">
  <div >

    <h1
      className="text-[40px]  leading-[120%] tracking-[-0.04em]  font-normal  text-[#1F1F1F] mb-[4px]"
    >
      User Management
    </h1>

    <p
      className="text-[14px]  leading-[120%]  tracking-[-0.04em]  font-normal text-[#747474] "
    >
      Manage system administrators and users
    </p>

  </div>

  <Button variant="primary" onClick={() => setOpen(true)} className="pt-[10px] pb-[10px] pl-[20px] pr-[20px]">
    <Plus className="h-4 w-4 mr-2" />
    Add User
  </Button>
</div>


      {/* Card Container */}
      <div className="rounded-[24px] bg-white shadow-sm  py-[32px] px-[24px]">

        <div className="flex items-center justify-between mb-[28px] gap-6">
          <h2
  className="text-[18px]  leading-[120%] tracking-[0em] font-normal text-[#1F1F1F]"
>
  System Users 
</h2>
<UsersHeaderActions
              search={search}
              status={status}
              onSearchChange={setSearch}
              onStatusChange={setStatus}
            />
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
      <UsersPagination />
    </div>
    <AddUserDialog open={open} onOpenChange={setOpen} 
     onUserCreated={handleUserCreated}
    />
<UserFeedbackDialog
     open={successOpen}
  onOpenChange={setSuccessOpen}
  type="success"
  title="User created successfully. "
  description="Password sent to email."
  />
    </>
  )
}
