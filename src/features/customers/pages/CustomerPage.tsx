"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { SalesEmptyState } from "@/features/sales/components/SalesEmptyState"
import { AddCustomerDialog} from "@/features/customers/components/AddCustomerPage"
import { useState } from "react"
import { CustomerPagination } from "@/features/customers/components/CustomerPagination"
import { CustomersTable } from "../components/CustomerTable"
import { UserFeedbackDialog } from "@/components/ui/user-feedback-dialog"
import { CustomerFilters } from "../components/CustomerFilter"
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
        <div className="flex items-center justify-between pb-10">
          <div className="space-y-2">

            <h1
              className="text-[40px] leading-[120%]  tracking-[-0.04em] font-normal  text-[#1F1F1F]"
            >
              Customer Management
            </h1>

            <p
              className="text-[14px] leading-[120%] tracking-[-0.04em] font-normal text-[#747474]"
            >
              Createsustainability reports and and receipts for customers
            </p>

          </div>

          <Button variant="primary" onClick={() => setOpen(true)} className="pt-[10px] pb-[10px] pl-[20px] pr-[20px]">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* <SalesRepFilters /> */}
        {/* Card Container */}
        <div className="rounded-[24px] border border-border bg-white p-8 shadow-sm">

          <div className="mb-6">
            <h2
              className="text-[18px] leading-[120%] tracking-[0em] font-normal text-[#1F1F1F]"
            >
              Customer
            </h2>

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
        <CustomerPagination />
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
