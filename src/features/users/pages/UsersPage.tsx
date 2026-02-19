"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { UsersEmptyState } from "@/features/users/components/UsersEmptyState"
import { AddUserDialog } from "@/features/users/components/AddUserDialog"
import { useState } from "react"
import { UsersPagination } from "@/features/users/components/UsersPagination"
import { UsersTable } from "../components/UsersTable"
export function UsersPage() {
  const users: any[] = [] // Mock empty state
const [open, setOpen] = useState(false)

  return (
    <>
    <div className="min-h-screen bg-background py-10">

      {/* Header */}
      <div className="flex items-start justify-between pb-10">
  <div className="space-y-2">

    <h1
      className="
        text-[40px]
        leading-[120%]
        tracking-[-0.04em]
        font-normal
        text-[#1F1F1F]
      "
    >
      User Management
    </h1>

    <p
      className="
        text-[14px]
        leading-[120%]
        tracking-[-0.04em]
        font-normal
        text-[#747474]
      "
    >
      Manage system administrators and users
    </p>

  </div>

  <Button variant="primary" onClick={() => setOpen(true)}>
    <Plus className="h-4 w-4 mr-2" />
    Add User
  </Button>
</div>


      {/* Card Container */}
      <div className="rounded-[24px] border border-border bg-white p-8 shadow-sm">

        <div className="mb-6">
          <h2
  className="
    text-[18px]
    leading-[120%]
    tracking-[0em]
    font-normal
    text-[#1F1F1F]
  "
>
  System Users ({users.length})
</h2>

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
    <AddUserDialog open={open} onOpenChange={setOpen} />

    </>
  )
}
