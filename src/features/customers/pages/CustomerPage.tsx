"use client"

import { AddCustomerDialog} from "@/features/customers/components/AddCustomerPage"
import { useMemo, useState } from "react"
import { AppPagination } from "@/components/ui/app-pagination"
import { CustomersTable } from "../components/CustomerTable"
import { UserFeedbackDialog } from "@/components/ui/user-feedback-dialog"
import { CustomerFilters } from "../components/CustomerFilter"
import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"
import { PageSectionTitle } from "@/components/layout/PageSectionTitle"
import {
  useGetCustomerRegionsQuery,
  useGetCustomerSegmentsQuery,
  useGetCustomersQuery,
} from "@/store/services/customersApi"
import { Loader2 } from "lucide-react"
export function CustomersPage() {
  const [open, setOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [segment, setSegment] = useState("all")
  const [region, setRegion] = useState("all")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const isActiveFilter = useMemo(() => {
    if (status === "active") return true
    if (status === "inactive") return false
    return undefined
  }, [status])

  const {
    data: customersResponse,
    isLoading,
    isFetching,
    error,
  } = useGetCustomersQuery({
    pageNumber,
    pageSize,
    ...(search.trim() ? { searchTerm: search.trim() } : {}),
    ...(segment !== "all" ? { segmentId: segment } : {}),
    ...(region !== "all" ? { regionId: region } : {}),
    ...(typeof isActiveFilter === "boolean" ? { isActive: isActiveFilter } : {}),
  })

  const { data: segmentOptions = [] } = useGetCustomerSegmentsQuery()
  const { data: regionOptions = [] } = useGetCustomerRegionsQuery()

  const customers = customersResponse?.items ?? []
  const totalCount = customersResponse?.totalCount ?? 0

  const handleCustomerCreated = () => {
    setOpen(false)

    setTimeout(() => {
      setSuccessOpen(true)
    }, 200)
  }

  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setPageNumber(1)
  }

  const handlePageSizeChange = (value: number) => {
    setPageSize(value)
    setPageNumber(1)
  }

  return (
    <>
      <div className="min-h-screen bg-background py-10">

        {/* Header */}
        <PageHeaderWithAction
          title="Customer management"
          description="Create sustainability reports and receipts for customers"
          actionLabel="Add customer"
          onActionClick={() => setOpen(true)}
        />

        <div className="mb-6">
          <CustomerFilters
            search={search}
            segment={segment}
            region={region}
            status={status}
            segmentOptions={segmentOptions}
            regionOptions={regionOptions}
            onSearchChange={handleFilterChange(setSearch)}
            onSegmentChange={handleFilterChange(setSegment)}
            onRegionChange={handleFilterChange(setRegion)}
            onStatusChange={handleFilterChange(setStatus)}
          />
        </div>

        {/* Card Container */}
        <div className="rounded-[24px] border border-border bg-white p-8 shadow-sm">

          <div className="mb-6">
            <PageSectionTitle title="Customer" />

          </div>

          {error ? (
            <div className="text-sm text-destructive">Failed to load customers.</div>
          ) : !isLoading && !isFetching && customers.length === 0 ? (
            <div className="text-sm text-muted-foreground">No customers found.</div>
          ) : (
            <div className="relative">
              {isFetching ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-[16px]">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : null}
              <div className={isLoading || isFetching ? "opacity-70" : ""}>
                <CustomersTable customers={customers} />
              </div>
            </div>
          )}

        </div>
        <AppPagination
          currentPage={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setPageNumber}
          onPageSizeChange={handlePageSizeChange}
          disabled={isFetching}
        />
      </div>
      <AddCustomerDialog open={open} onOpenChange={setOpen}
        onCustomerCreated={handleCustomerCreated}
       
      />
      <UserFeedbackDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        type="success"
        title="Customer created successfully. "
        description=""
      />
    </>
  )
}
