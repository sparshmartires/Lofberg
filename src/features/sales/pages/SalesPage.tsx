"use client"

import { AddSalesDialog } from "@/features/sales/components/AddSalesDialog"
import { useState } from "react"
import { AppPagination } from "@/components/ui/app-pagination"
import { SalesTable } from "../components/SalesTable"
import { UserFeedbackDialog } from "@/components/ui/user-feedback-dialog"
import { SalesRepFilters } from "../components/SalesRepFilters"
import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"
import { PageSectionTitle } from "@/components/layout/PageSectionTitle"
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
        <PageHeaderWithAction
          title="Sales Representatives"
          description="Createsustainability reports and and receipts for customers"
          actionLabel="Add Sales Representative"
          onActionClick={() => setOpen(true)}
        />
        <SalesRepFilters />
        {/* Card Container */}
        <div className="rounded-[24px]   py-[32px] px-[24px] bg-white shadow-sm">

          <div className="mb-[28px] gap-6">
            <PageSectionTitle title="Sales Team" />

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
        <AppPagination />
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
