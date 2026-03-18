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
  customerOptions: FilterOption[]
  salesRepresentativeOptions: FilterOption[]
  typeOptions: string[]
  statusOptions: string[]
  showSalesRepFilter?: boolean
  onSearchChange: (value: string) => void
  onCustomerChange: (value: string) => void
  onSalesRepresentativeChange: (value: string) => void
  onTypeChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function HistoricalReportsFilters({
  search,
  customer,
  salesRepresentative,
  type,
  status,
  customerOptions,
  salesRepresentativeOptions,
  typeOptions,
  statusOptions,
  showSalesRepFilter = true,
  onSearchChange,
  onCustomerChange,
  onSalesRepresentativeChange,
  onTypeChange,
  onStatusChange,
}: HistoricalReportsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const fieldClass =
    "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-sm focus:outline-none"

  return (
    <div className="filters-card">
      <div className={`hidden gap-4 md:grid md:grid-cols-2 ${showSalesRepFilter ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
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
              <SelectValue placeholder="All Customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
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
            <label>Sales Representative</label>
            <Select value={salesRepresentative} onValueChange={onSalesRepresentativeChange}>
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="All Sales Representative" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sales Representative</SelectItem>
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
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
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
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
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
              <label>Sales Representative</label>
              <Select value={salesRepresentative} onValueChange={onSalesRepresentativeChange}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="All Sales Representative" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sales Representative</SelectItem>
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
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
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
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
