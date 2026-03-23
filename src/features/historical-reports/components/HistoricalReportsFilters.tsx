"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { ChevronDown, ChevronUp } from "lucide-react"
import { DateRangePicker } from "@/components/ui/date-range-picker"

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

  const fieldClass =
    "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-sm focus:outline-none"

  return (
    <div className="filters-card">
      {/* Desktop filters */}
      <div className="hidden md:flex flex-col gap-4">
        {/* Row 1: Search, Customer, Sales Rep (if admin), Type, Status */}
        <div className={`grid gap-4 md:grid-cols-2 ${showSalesRepFilter ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
          <div className="filter-field">
            <label>Search</label>
            <Input
              placeholder="Search reports"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="filter-field">
            <label>Customer</label>
            <Select value={customer} onValueChange={onCustomerChange}>
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="All customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All customers</SelectItem>
                {customerOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showSalesRepFilter && (
            <div className="filter-field">
              <label>Sales representative</label>
              <Select value={salesRepresentative} onValueChange={onSalesRepresentativeChange}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="All sales representatives" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sales representatives</SelectItem>
                  {salesRepresentativeOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="filter-field">
            <label>Type</label>
            <Select value={type} onValueChange={onTypeChange}>
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {typeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="filter-field">
            <label>Status</label>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Segment, Report Date Range, Created At Range */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="filter-field">
            <label>Segment</label>
            <Select value={segment} onValueChange={onSegmentChange}>
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="All segments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All segments</SelectItem>
                {segmentOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="filter-field">
            <label>Report date</label>
            <DateRangePicker
              from={reportDateFrom}
              to={reportDateTo}
              onFromChange={onReportDateFromChange}
              onToChange={onReportDateToChange}
            />
          </div>

          <div className="filter-field">
            <label>Created at</label>
            <DateRangePicker
              from={createdFrom}
              to={createdTo}
              onFromChange={onCreatedFromChange}
              onToChange={onCreatedToChange}
            />
          </div>
        </div>
      </div>

      {/* Mobile filters */}
      <div className="block md:hidden">
        <div className="filter-field mb-4">
          <label>Search</label>
          <Input
            placeholder="Search reports"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className={`mobile-advanced ${isOpen ? "open" : ""}`}>
          <div className="filter-field mb-4">
            <label>Customer</label>
            <Select value={customer} onValueChange={onCustomerChange}>
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="All customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All customers</SelectItem>
                {customerOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showSalesRepFilter && (
            <div className="filter-field mb-4">
              <label>Sales representative</label>
              <Select value={salesRepresentative} onValueChange={onSalesRepresentativeChange}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="All sales representatives" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sales representatives</SelectItem>
                  {salesRepresentativeOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="filter-field mb-4">
            <label>Type</label>
            <Select value={type} onValueChange={onTypeChange}>
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {typeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="filter-field mb-4">
            <label>Status</label>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="filter-field mb-4">
            <label>Segment</label>
            <Select value={segment} onValueChange={onSegmentChange}>
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="All segments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All segments</SelectItem>
                {segmentOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="filter-field mb-4">
            <label>Report date</label>
            <DateRangePicker
              from={reportDateFrom}
              to={reportDateTo}
              onFromChange={onReportDateFromChange}
              onToChange={onReportDateToChange}
            />
          </div>

          <div className="filter-field">
            <label>Created at</label>
            <DateRangePicker
              from={createdFrom}
              to={createdTo}
              onFromChange={onCreatedFromChange}
              onToChange={onCreatedToChange}
            />
          </div>
        </div>

        <div className="mobile-toggle" onClick={() => setIsOpen((prev) => !prev)}>
          <span>Advanced Search</span>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
    </div>
  )
}
