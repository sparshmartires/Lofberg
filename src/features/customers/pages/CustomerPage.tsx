"use client"

import { AddCustomerDialog} from "@/features/customers/components/AddCustomerPage"
import { useState } from "react"
import { AppPagination } from "@/components/ui/app-pagination"
import { CustomersTable } from "../components/CustomerTable"
import { UserFeedbackDialog } from "@/components/ui/user-feedback-dialog"
import { CustomerFilters } from "../components/CustomerFilter"
import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"
import { PageSectionTitle } from "@/components/layout/PageSectionTitle"
export function CustomersPage() {
  const users: any[] = [] // Mock empty state
  const [open, setOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const handleCustomerCreated = () => {
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
          title="Customer Management"
          description="Createsustainability reports and and receipts for customers"
          actionLabel="Add Customer"
          onActionClick={() => setOpen(true)}
        />

        {/* <SalesRepFilters /> */}
        {/* Card Container */}
        <div className="rounded-[24px] border border-border bg-white p-8 shadow-sm">

          <div className="mb-6">
            <PageSectionTitle title="Customer" />

          </div>

          {users.length === 0 ? (
            //   <UsersEmptyState />
            <>
              <CustomersTable />

            </>
          ) : (
            <div>
              {/* Table will go here later */}
            </div>
          )}

        </div>
        <AppPagination />
      </div>
      <AddCustomerDialog open={open} onOpenChange={setOpen}
        onCustomerCreated={handleCustomerCreated}
       
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
