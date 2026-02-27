"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { SalesEmptyState } from "@/features/sales/components/SalesEmptyState"
import { AddSalesDialog } from "@/features/sales/components/AddSalesDialog"
import { useState } from "react"
import { SalesPagination } from "@/features/sales/components/SalesPagination"
import { SalesTable } from "../components/SalesTable"
import { UserFeedbackDialog } from "@/components/ui/user-feedback-dialog"
import { SalesRepFilters } from "../components/SalesRepFilters"
export function SalesPage() {
  const users: any[] = [] // Mock empty state
  const [open, setOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const handleSaleCreated = () => {
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
              className="text-[40px] leading-[120%]  tracking-[-0.04em] font-normal  text-[#1F1F1F] mb-[4px]"
            >
              Sales Representatives
            </h1>

            <p
              className="text-[14px] leading-[120%] tracking-[-0.04em] font-normal text-[#747474]"
            >
              Createsustainability reports and and receipts for customers
            </p>

          </div>

          <Button variant="primary" onClick={() => setOpen(true)} className="pt-[10px] pb-[10px] pl-[20px] pr-[20px]">
            <Plus className="h-4 w-4 mr-2" />
            Add Sales Representative
          </Button>
        </div>
        <SalesRepFilters />
        {/* Card Container */}
        <div className="rounded-[24px]   py-[32px] px-[24px] bg-white shadow-sm">

          <div className="mb-[28px] gap-6">
            <h2
              className="text-[18px] leading-[120%] tracking-[0em] font-normal text-[#1F1F1F]"
            >
              Sales Team 
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
      <AddSalesDialog open={open} onOpenChange={setOpen}
        onSaleCreated={handleSaleCreated}
      />
      <UserFeedbackDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        type="success"
        title="Sales representative created successfully. "
        description="Password sent to email."
      />
    </>
  )
}
