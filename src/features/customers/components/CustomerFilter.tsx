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
import { useDebounce } from "@/hooks/useDebounce"

interface FilterOption {
  id: string
  name: string
}

interface CustomerFiltersProps {
  search: string
  segment: string
  region: string
  status: string
  segmentOptions: FilterOption[]
  regionOptions: FilterOption[]
  onSearchChange: (value: string) => void
  onSegmentChange: (value: string) => void
  onRegionChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function CustomerFilters({
  search,
  segment,
  region,
  status,
  segmentOptions,
  regionOptions,
  onSearchChange,
  onSegmentChange,
  onRegionChange,
  onStatusChange,
}: CustomerFiltersProps) {
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
        placeholder="Search by name or code"
        value={searchInput}
        onChange={setSearchInput}
        className={fieldClass}
      />
    </div>
  )

  const filterFields = (
    <>
      <div className="filter-field w-[180px] max-[649px]:w-full">
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

      <div className="filter-field w-[180px] max-[649px]:w-full">
        <label>Region</label>
        <Select value={region} onValueChange={onRegionChange}>
          <SelectTrigger className={fieldClass} showClear={region !== "all"} onClear={() => onRegionChange("all")}>
            <SelectValue placeholder="All regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All regions</SelectItem>
            {regionOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
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
