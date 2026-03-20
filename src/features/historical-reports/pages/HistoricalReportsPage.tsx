"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { AppPagination } from "@/components/ui/app-pagination"
import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"
import { PageSectionTitle } from "@/components/layout/PageSectionTitle"
import { HistoricalReportsTable } from "../components/HistoricalReportsTable"
import { HistoricalReportsFilters } from "../components/HistoricalReportsFilters"
import type { FilterOption } from "../components/HistoricalReportsFilters"
import { useGetReportsQuery, useGetSegmentsQuery } from "@/store/services/reportsApi"
import { useAuth } from "@/store/hooks/useAuth"

const STATUS_OPTIONS = ["Draft", "Latest", "Past", "Archived"]
const TYPE_OPTIONS = ["Report + Receipt", "Receipt Only"]

export function HistoricalReportsPage() {
  const router = useRouter()
  const { user } = useAuth()

  // Read roles from Redux state first, fall back to localStorage for page reload
  const isAdmin = useMemo(() => {
    if (user?.roles) return user.roles.includes("Administrator")
    if (typeof window === "undefined") return true
    try {
      const stored = localStorage.getItem("user")
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed?.roles?.includes("Administrator") ?? true
      }
    } catch { /* ignore */ }
    return true
  }, [user])

  const [search, setSearch] = useState("")
  const [customerId, setCustomerId] = useState("all")
  const [salesRepresentativeId, setSalesRepresentativeId] = useState("all")
  const [type, setType] = useState("all")
  const [status, setStatus] = useState("all")
  const [segmentId, setSegmentId] = useState("all")
  const [reportDateFrom, setReportDateFrom] = useState<Date | undefined>()
  const [reportDateTo, setReportDateTo] = useState<Date | undefined>()
  const [createdFrom, setCreatedFrom] = useState<Date | undefined>()
  const [createdTo, setCreatedTo] = useState<Date | undefined>()
  const [sortBy, setSortBy] = useState<string | undefined>()
  const [sortDirection, setSortDirection] = useState<string | undefined>()
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(11)

  // Map FE type label to BE enum value
  const typeToEnum: Record<string, string> = {
    "Report + Receipt": "ReportPlusReceipt",
    "Receipt Only": "ReceiptOnly",
  }

  const formatDateParam = (d: Date | undefined) => (d ? format(d, "yyyy-MM-dd") : undefined)

  const { data, isLoading } = useGetReportsQuery({
    pageNumber,
    pageSize,
    searchTerm: search || undefined,
    customerId: customerId !== "all" ? customerId : undefined,
    salesRepresentativeId: salesRepresentativeId !== "all" ? salesRepresentativeId : undefined,
    status: status !== "all" ? status : undefined,
    type: type !== "all" ? typeToEnum[type] : undefined,
    segmentId: segmentId !== "all" ? segmentId : undefined,
    dateFrom: formatDateParam(reportDateFrom),
    dateTo: formatDateParam(reportDateTo),
    createdFrom: formatDateParam(createdFrom),
    createdTo: formatDateParam(createdTo),
    sortBy,
    sortDirection,
  })

  const { data: segments = [] } = useGetSegmentsQuery()

  const reports = data?.items ?? []

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPageNumber(1)
  }

  const handleCustomerChange = (value: string) => {
    setCustomerId(value)
    setPageNumber(1)
  }

  const handleSalesRepresentativeChange = (value: string) => {
    setSalesRepresentativeId(value)
    setPageNumber(1)
  }

  const handleTypeChange = (value: string) => {
    setType(value)
    setPageNumber(1)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    setPageNumber(1)
  }

  const handleSegmentChange = (value: string) => {
    setSegmentId(value)
    setPageNumber(1)
  }

  const handleReportDateFromChange = (date: Date | undefined) => {
    setReportDateFrom(date)
    setPageNumber(1)
  }

  const handleReportDateToChange = (date: Date | undefined) => {
    setReportDateTo(date)
    setPageNumber(1)
  }

  const handleCreatedFromChange = (date: Date | undefined) => {
    setCreatedFrom(date)
    setPageNumber(1)
  }

  const handleCreatedToChange = (date: Date | undefined) => {
    setCreatedTo(date)
    setPageNumber(1)
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
    setPageNumber(1)
  }

  const handlePageSizeChange = (value: number) => {
    setPageSize(value)
    setPageNumber(1)
  }

  const handleGenerateReport = () => {
    router.push("/report-generation")
  }

  // Derive unique customer/sales rep options from current results for filter dropdowns
  const customerOptions: FilterOption[] = Array.from(
    new Map(
      reports
        .filter((r) => r.customerId && r.customerName)
        .map((r) => [r.customerId, { id: r.customerId, name: r.customerName }])
    ).values()
  )
  const salesRepresentativeOptions: FilterOption[] = Array.from(
    new Map(
      reports
        .filter((r) => r.salesRepresentativeId && r.salesRepresentative)
        .map((r) => [r.salesRepresentativeId, { id: r.salesRepresentativeId, name: r.salesRepresentative }])
    ).values()
  )

  const segmentOptions: FilterOption[] = segments.map((s) => ({ id: s.id, name: s.name }))

  return (
    <div className="min-h-screen bg-background py-10">
      <PageHeaderWithAction
        title="Historical reports"
        description="Review and download previously generated reports"
        actionLabel="Generate report"
        onActionClick={handleGenerateReport}
      />

      <HistoricalReportsFilters
        search={search}
        customer={customerId}
        salesRepresentative={salesRepresentativeId}
        type={type}
        status={status}
        segment={segmentId}
        customerOptions={customerOptions}
        salesRepresentativeOptions={salesRepresentativeOptions}
        segmentOptions={segmentOptions}
        typeOptions={TYPE_OPTIONS}
        statusOptions={STATUS_OPTIONS}
        showSalesRepFilter={isAdmin}
        reportDateFrom={reportDateFrom}
        reportDateTo={reportDateTo}
        createdFrom={createdFrom}
        createdTo={createdTo}
        onSearchChange={handleSearchChange}
        onCustomerChange={handleCustomerChange}
        onSalesRepresentativeChange={handleSalesRepresentativeChange}
        onTypeChange={handleTypeChange}
        onStatusChange={handleStatusChange}
        onSegmentChange={handleSegmentChange}
        onReportDateFromChange={handleReportDateFromChange}
        onReportDateToChange={handleReportDateToChange}
        onCreatedFromChange={handleCreatedFromChange}
        onCreatedToChange={handleCreatedToChange}
      />

      <div className="rounded-[24px] bg-white shadow-sm py-[32px] px-[24px] max-[649px]:p-[12px]">
        <div className="flex items-center justify-between mb-[28px] max-[649px]:mb-[16px] gap-6">
          <PageSectionTitle title="Reports" />
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-sm text-[#8A8A8A]">Loading reports...</div>
        ) : (
          <HistoricalReportsTable
            reports={reports}
            showSalesRepColumn={isAdmin}
            isAdmin={isAdmin}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        )}
      </div>

      <AppPagination
        currentPage={pageNumber}
        pageSize={pageSize}
        totalCount={data?.totalCount ?? 0}
        onPageChange={setPageNumber}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
