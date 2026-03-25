"use client"

import { useState, useEffect } from "react"
import { SearchInput } from "@/components/ui/search-input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { ChevronDown, ChevronUp } from "lucide-react"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { useDebounce } from "@/hooks/useDebounce"

export interface FilterOption {
  id: string
  name: string
}

interface HistoricalReportsFiltersProps {
  search: string
  customer: string
  salesRepresentative: string
  type: string
  status: string
  segment: string
  customerOptions: FilterOption[]
  salesRepresentativeOptions: FilterOption[]
  segmentOptions: FilterOption[]
  typeOptions: string[]
  statusOptions: string[]
  showSalesRepFilter?: boolean
  reportDateFrom: Date | undefined
  reportDateTo: Date | undefined
  createdFrom: Date | undefined
  createdTo: Date | undefined
  onSearchChange: (value: string) => void
  onCustomerChange: (value: string) => void
  onSalesRepresentativeChange: (value: string) => void
  onTypeChange: (value: string) => void
  onStatusChange: (value: string) => void
  onSegmentChange: (value: string) => void
  onReportDateFromChange: (date: Date | undefined) => void
  onReportDateToChange: (date: Date | undefined) => void
  onCreatedFromChange: (date: Date | undefined) => void
  onCreatedToChange: (date: Date | undefined) => void
}

export function HistoricalReportsFilters({
  search,
  customer,
  salesRepresentative,
  type,
  status,
  segment,
  customerOptions,
  salesRepresentativeOptions,
  segmentOptions,
  typeOptions,
  statusOptions,
  showSalesRepFilter = true,
  reportDateFrom,
  reportDateTo,
  createdFrom,
  createdTo,
  onSearchChange,
  onCustomerChange,
  onSalesRepresentativeChange,
  onTypeChange,
  onStatusChange,
  onSegmentChange,
  onReportDateFromChange,
  onReportDateToChange,
  onCreatedFromChange,
  onCreatedToChange,
}: HistoricalReportsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebounce(searchInput)

  useEffect(() => {
    onSearchChange(debouncedSearch)
  }, [debouncedSearch, onSearchChange])

  const fieldClass =
    "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-sm focus:outline-none"

  const searchField = (
    <div className="filter-field w-[240px] max-[649px]:w-full">
      <label>Search</label>
      <SearchInput
        placeholder="Search reports"
        value={searchInput}
        onChange={setSearchInput}
        className={fieldClass}
      />
    </div>
  )

  const filterFields = (
    <>
      <div className="filter-field w-[180px] max-[649px]:w-full">
        <label>Customer</label>
        <Select value={customer} onValueChange={onCustomerChange}>
          <SelectTrigger className={fieldClass} showClear={customer !== "all"} onClear={() => onCustomerChange("all")}>
            <SelectValue placeholder="All customers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All customers</SelectItem>
            {customerOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showSalesRepFilter && (
        <div className="filter-field w-[230px] max-[649px]:w-full">
          <label>Sales representative</label>
          <Select value={salesRepresentative} onValueChange={onSalesRepresentativeChange}>
            <SelectTrigger className={fieldClass} showClear={salesRepresentative !== "all"} onClear={() => onSalesRepresentativeChange("all")}>
              <SelectValue placeholder="All sales representatives" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sales representatives</SelectItem>
              {salesRepresentativeOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="filter-field w-[160px] max-[649px]:w-full">
        <label>Type</label>
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger className={fieldClass} showClear={type !== "all"} onClear={() => onTypeChange("all")}>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {typeOptions.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="filter-field w-[160px] max-[649px]:w-full">
        <label>Status</label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className={fieldClass} showClear={status !== "all"} onClear={() => onStatusChange("all")}>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="filter-field w-[160px] max-[649px]:w-full">
        <label>Segment</label>
        <Select value={segment} onValueChange={onSegmentChange}>
          <SelectTrigger className={fieldClass} showClear={segment !== "all"} onClear={() => onSegmentChange("all")}>
            <SelectValue placeholder="All segments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All segments</SelectItem>
            {segmentOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="filter-field w-[220px] max-[649px]:w-full">
        <label>Report date</label>
        <DateRangePicker
          from={reportDateFrom}
          to={reportDateTo}
          onFromChange={onReportDateFromChange}
          onToChange={onReportDateToChange}
        />
      </div>

      <div className="filter-field w-[220px] max-[649px]:w-full">
        <label>Created at</label>
        <DateRangePicker
          from={createdFrom}
          to={createdTo}
          onFromChange={onCreatedFromChange}
          onToChange={onCreatedToChange}
        />
      </div>
    </>
  )

  return (
    <div className="filters-card">
      {/* Desktop: left-aligned flex-wrap */}
      <div className="hidden md:flex flex-wrap gap-4 items-end">
        {searchField}
        {filterFields}
      </div>

      {/* Mobile: search + collapsible filters */}
      <div className="block md:hidden">
        {searchField}

        <div className={`mobile-advanced ${isOpen ? "open" : ""}`}>
          <div className="flex flex-col gap-4 pt-4">
            {filterFields}
          </div>
        </div>

        <div className="mobile-toggle" onClick={() => setIsOpen((prev) => !prev)}>
          <span>Filters</span>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
    </div>
  )
}
