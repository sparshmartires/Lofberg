"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AppPagination } from "@/components/ui/app-pagination"
import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"
import { PageSectionTitle } from "@/components/layout/PageSectionTitle"
import {
  HistoricalReportsTable,
  HistoricalReportItem,
} from "../components/HistoricalReportsTable"
import { HistoricalReportsFilters } from "../components/HistoricalReportsFilters"

const mockReports: HistoricalReportItem[] = [
  {
    id: "RPT-1001",
    title: "Q1 Sustainability Summary",
    customerName: "Nordic Beans AB",
    salesRepresentative: "Emma Johansson",
    status: "Completed",
    reportDate: "2026-01-12",
    type: "Sustainability",
  },
  {
    id: "RPT-1002",
    title: "Carbon Footprint Statement",
    customerName: "Green Cup Ltd",
    salesRepresentative: "Liam Svensson",
    status: "In Progress",
    reportDate: "2026-01-30",
    type: "Receipt",
  },
  {
    id: "RPT-1003",
    title: "Monthly Water Usage Report",
    customerName: "Arctic Roasters",
    salesRepresentative: "Emma Johansson",
    status: "Draft",
    reportDate: "2026-02-05",
    type: "Sustainability",
  },
  {
    id: "RPT-1004",
    title: "Store Impact Overview",
    customerName: "Café North",
    salesRepresentative: "Noah Lindberg",
    status: "Completed",
    reportDate: "2026-02-16",
    type: "Receipt",
  },
  {
    id: "RPT-1005",
    title: "Waste Reduction Snapshot",
    customerName: "Bean Circle",
    salesRepresentative: "Liam Svensson",
    status: "Completed",
    reportDate: "2026-02-20",
    type: "Sustainability",
  },
  {
    id: "RPT-1006",
    title: "Energy Consumption Detail",
    customerName: "Nordic Beans AB",
    salesRepresentative: "Noah Lindberg",
    status: "In Progress",
    reportDate: "2026-03-01",
    type: "Sustainability",
  },
  {
    id: "RPT-1007",
    title: "Annual Performance Receipt",
    customerName: "Green Cup Ltd",
    salesRepresentative: "Emma Johansson",
    status: "Draft",
    reportDate: "2026-03-04",
    type: "Receipt",
  },
  {
    id: "RPT-1008",
    title: "Scope 3 Emission Analysis",
    customerName: "Arctic Roasters",
    salesRepresentative: "Liam Svensson",
    status: "Completed",
    reportDate: "2026-03-06",
    type: "Sustainability",
  },
]

export function HistoricalReportsPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [customer, setCustomer] = useState("all")
  const [salesRepresentative, setSalesRepresentative] = useState("all")
  const [type, setType] = useState("all")
  const [status, setStatus] = useState("all")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(11)

  const customerOptions = useMemo(
    () => Array.from(new Set(mockReports.map((report) => report.customerName))),
    []
  )

  const salesRepresentativeOptions = useMemo(
    () => Array.from(new Set(mockReports.map((report) => report.salesRepresentative))),
    []
  )

  const typeOptions = useMemo(
    () => Array.from(new Set(mockReports.map((report) => report.type))),
    []
  )

  const statusOptions = useMemo(
    () => Array.from(new Set(mockReports.map((report) => report.status))),
    []
  )

  const filteredReports = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return mockReports.filter((report) => {
      const matchesSearch =
        !normalizedSearch ||
        report.title.toLowerCase().includes(normalizedSearch) ||
        report.id.toLowerCase().includes(normalizedSearch)

      const matchesCustomer = customer === "all" || report.customerName === customer
      const matchesSalesRepresentative =
        salesRepresentative === "all" || report.salesRepresentative === salesRepresentative
      const matchesType = type === "all" || report.type === type
      const matchesStatus = status === "all" || report.status === status

      return (
        matchesSearch &&
        matchesCustomer &&
        matchesSalesRepresentative &&
        matchesType &&
        matchesStatus
      )
    })
  }, [search, customer, salesRepresentative, type, status])

  const paginatedReports = useMemo(() => {
    const start = (pageNumber - 1) * pageSize
    return filteredReports.slice(start, start + pageSize)
  }, [filteredReports, pageNumber, pageSize])

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
        typeOptions={typeOptions}
        statusOptions={statusOptions}
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

        <HistoricalReportsTable reports={paginatedReports} />
      </div>

      <AppPagination
        currentPage={pageNumber}
        pageSize={pageSize}
        totalCount={filteredReports.length}
        onPageChange={setPageNumber}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
