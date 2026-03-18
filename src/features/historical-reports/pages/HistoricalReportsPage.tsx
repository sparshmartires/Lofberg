"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppPagination } from "@/components/ui/app-pagination"
import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"
import { PageSectionTitle } from "@/components/layout/PageSectionTitle"
import { HistoricalReportsTable } from "../components/HistoricalReportsTable"
import { HistoricalReportsFilters } from "../components/HistoricalReportsFilters"
import { useGetReportsQuery } from "@/store/services/reportsApi"
import { useAuth } from "@/store/hooks/useAuth"

const STATUS_OPTIONS = ["Draft", "Latest", "Past", "Archived"]
const TYPE_OPTIONS = ["Report + Receipt", "Receipt Only"]

export function HistoricalReportsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const isAdmin = user?.roles?.includes("Administrator") ?? false
  const [search, setSearch] = useState("")
  const [customer, setCustomer] = useState("all")
  const [salesRepresentative, setSalesRepresentative] = useState("all")
  const [type, setType] = useState("all")
  const [status, setStatus] = useState("all")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(11)

  // Map FE status label to BE enum value for filtering
  const statusToEnum: Record<string, string> = {
    Draft: "Draft",
    Latest: "Completed",
    Past: "Completed",
    Archived: "Archived",
  }

  // Map FE type label to BE enum value
  const typeToEnum: Record<string, string> = {
    "Report + Receipt": "ReportPlusReceipt",
    "Receipt Only": "ReceiptOnly",
  }

  const { data, isLoading } = useGetReportsQuery({
    pageNumber,
    pageSize,
    searchTerm: search || undefined,
    status: status !== "all" ? statusToEnum[status] : undefined,
    type: type !== "all" ? typeToEnum[type] : undefined,
  })

  const reports = data?.items ?? []

  // For status filter: if "Latest" or "Past" selected, additionally filter client-side by statusLabel
  const filteredReports =
    status === "Latest" || status === "Past"
      ? reports.filter((r) => r.statusLabel === status)
      : reports

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPageNumber(1)
  }

  const handleCustomerChange = (value: string) => {
    setCustomer(value)
    setPageNumber(1)
  }

  const handleSalesRepresentativeChange = (value: string) => {
    setSalesRepresentative(value)
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

  // Derive unique customer/sales rep names from current results for filter dropdowns
  const customerOptions = Array.from(new Set(reports.map((r) => r.customerName).filter(Boolean)))
  const salesRepresentativeOptions = Array.from(
    new Set(reports.map((r) => r.salesRepresentative).filter(Boolean))
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
        customer={customer}
        salesRepresentative={salesRepresentative}
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
          <HistoricalReportsTable reports={filteredReports} showSalesRepColumn={isAdmin} />
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
