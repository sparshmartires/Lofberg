"use client"

import { AddSalesDialog } from "@/features/sales/components/AddSalesDialog"
import { useMemo, useState } from "react"
import { AppPagination } from "@/components/ui/app-pagination"
import { SalesTable } from "../components/SalesTable"
import { UserFeedbackDialog } from "@/components/ui/user-feedback-dialog"
import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"
import { PageSectionTitle } from "@/components/layout/PageSectionTitle"
import { Loader2 } from "lucide-react"
import { SalesEmptyState } from "../components/SalesEmptyState"
import {
  useGetLanguagesQuery,
  useGetSalesRegionsQuery,
  useGetSalesRepresentativesQuery,
  useGetSalesSegmentsQuery,
} from "@/store/services/salesRepresentativesApi"
import { SalesRepFilters } from "../components/SalesRepFilters"
import { useAppSelector } from "@/store/hooks"

export function SalesPage() {
  const [open, setOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [segment, setSegment] = useState("all")
  const [region, setRegion] = useState("all")
  const [status, setStatus] = useState("all")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const preferredLanguageId = useAppSelector((state) => state.auth.user?.preferredLanguageId)

  const isActiveFilter = useMemo(() => {
    if (status === "active") return true
    if (status === "inactive") return false
    return undefined
  }, [status])

  const {
    data: salesResponse,
    isLoading,
    isFetching,
    error,
  } = useGetSalesRepresentativesQuery({
    pageNumber,
    pageSize,
    ...(search.trim() ? { searchTerm: search.trim() } : {}),
    ...(typeof isActiveFilter === "boolean" ? { isActive: isActiveFilter } : {}),
    ...(segment !== "all" ? { segmentId: segment } : {}),
    ...(region !== "all" ? { regionId: region } : {}),
  })

  const salesReps = salesResponse?.items ?? []
  const totalCount = salesResponse?.totalCount ?? 0

  const { data: languageOptions = [] } = useGetLanguagesQuery()
  const effectiveLanguageId = preferredLanguageId ?? languageOptions[0]?.id ?? ""

  const { data: segmentOptions = [] } = useGetSalesSegmentsQuery(effectiveLanguageId, {
    skip: !effectiveLanguageId,
  })
  const { data: regionOptions = [] } = useGetSalesRegionsQuery()

  const handleSaleCreated = () => {
    setOpen(false)

    setTimeout(() => {
      setSuccessOpen(true)
    }, 200)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPageNumber(1)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    setPageNumber(1)
  }

  const handleSegmentChange = (value: string) => {
    setSegment(value)
    setPageNumber(1)
  }

  const handleRegionChange = (value: string) => {
    setRegion(value)
    setPageNumber(1)
  }

  const handlePageSizeChange = (value: number) => {
    setPageSize(value)
    setPageNumber(1)
  }

  return (
    <>
      <div className="min-h-screen bg-background py-10">
        <PageHeaderWithAction
          title="Sales representatives"
          description="Create sustainability reports and receipts for customers"
          actionLabel="Add sales representative"
          onActionClick={() => setOpen(true)}
        />

        <SalesRepFilters
          search={search}
          segment={segment}
          region={region}
          status={status}
          segmentOptions={segmentOptions}
          regionOptions={regionOptions}
          onSearchChange={handleSearchChange}
          onSegmentChange={handleSegmentChange}
          onRegionChange={handleRegionChange}
          onStatusChange={handleStatusChange}
        />

        <div className="rounded-[24px] bg-white shadow-sm py-[32px] px-[24px] max-[649px]:p-[12px]">
          <div className="flex items-center justify-between mb-[28px] max-[649px]:mb-[16px] gap-6">
            <PageSectionTitle title="Sales Team" />
          </div>

          {error ? (
            <div className="text-sm text-destructive">Failed to load sales representatives.</div>
          ) : !isLoading && !isFetching && salesReps.length === 0 ? (
            <SalesEmptyState />
          ) : (
            <div className="relative">
              {isFetching ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-[16px]">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : null}
              <div className={isLoading || isFetching ? "opacity-70" : ""}>
                <SalesTable salesReps={salesReps} />
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

      <AddSalesDialog open={open} onOpenChange={setOpen} onSaleCreated={handleSaleCreated} />

      <UserFeedbackDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        type="success"
        title="Sales representative created successfully."
        description=""
      />
    </>
  )
}
