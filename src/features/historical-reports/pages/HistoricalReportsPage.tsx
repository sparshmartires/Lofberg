"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppPagination } from "@/components/ui/app-pagination"
import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"
import { PageSectionTitle } from "@/components/layout/PageSectionTitle"
import { HistoricalReportsTable } from "../components/HistoricalReportsTable"
import { HistoricalReportsFilters } from "../components/HistoricalReportsFilters"
import type { FilterOption } from "../components/HistoricalReportsFilters"
import { useGetReportsQuery } from "@/store/services/reportsApi"
import { useAuth } from "@/store/hooks/useAuth"

const STATUS_OPTIONS = ["Draft", "Latest", "Past", "Archived"]
const TYPE_OPTIONS = ["Report + Receipt", "Receipt Only"]

export function HistoricalReportsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const isAdmin = user?.roles?.includes("Administrator") ?? false
  const [search, setSearch] = useState("")
  const [customerId, setCustomerId] = useState("all")
  const [salesRepresentativeId, setSalesRepresentativeId] = useState("all")
  const [type, setType] = useState("all")
  const [status, setStatus] = useState("all")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(11)

  // Map FE type label to BE enum value
  const typeToEnum: Record<string, string> = {
    "Report + Receipt": "ReportPlusReceipt",
    "Receipt Only": "ReceiptOnly",
  }

  const { data, isLoading } = useGetReportsQuery({
    pageNumber,
    pageSize,
    searchTerm: search || undefined,
    customerId: customerId !== "all" ? customerId : undefined,
    salesRepresentativeId: salesRepresentativeId !== "all" ? salesRepresentativeId : undefined,
    status: status !== "all" ? status : undefined,
    type: type !== "all" ? typeToEnum[type] : undefined,
  })

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
        customerOptions={customerOptions}
        salesRepresentativeOptions={salesRepresentativeOptions}
        typeOptions={TYPE_OPTIONS}
        statusOptions={STATUS_OPTIONS}
        showSalesRepFilter={isAdmin}
        onSearchChange={handleSearchChange}
        onCustomerChange={handleCustomerChange}
        onSalesRepresentativeChange={handleSalesRepresentativeChange}
        onTypeChange={handleTypeChange}
        onStatusChange={handleStatusChange}
      />

      <div className="rounded-[24px] bg-white shadow-sm py-[32px] px-[24px] max-[649px]:p-[12px]">
        <div className="flex items-center justify-between mb-[28px] max-[649px]:mb-[16px] gap-6">
          <PageSectionTitle title="Reports" />
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-sm text-[#8A8A8A]">Loading reports...</div>
        ) : (
          <HistoricalReportsTable reports={reports} showSalesRepColumn={isAdmin} isAdmin={isAdmin} />
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
