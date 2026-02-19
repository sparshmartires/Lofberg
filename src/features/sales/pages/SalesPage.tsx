"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { SalesEmptyState } from "@/features/sales/components/SalesEmptyState"
import { AddSalesDialog } from "@/features/sales/components/AddSalesDialog"
import { useState } from "react"
import { SalesPagination } from "@/features/sales/components/SalesPagination"
import { SalesTable } from "../components/SalesTable"
export function SalesPage() {
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
      Sales Representatives
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
      Createsustainability reports and and receipts for customers
    </p>

  </div>

  <Button variant="primary" onClick={() => setOpen(true)}>
    <Plus className="h-4 w-4 mr-2" />
    Add Sales Representative
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
  Sales Team ({users.length})
</h2>

        </div>

        {users.length === 0 ? (
        //   <UsersEmptyState />
        <>
     <SalesTable />

</>
        ) : (
          <div>
            {/* Table will go here later */}
          </div>
        )}

      </div>
      <SalesPagination />
    </div>
    <AddSalesDialog open={open} onOpenChange={setOpen} />

    </>
  )
}
