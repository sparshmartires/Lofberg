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
import { ChevronUp, ChevronDown } from "lucide-react"
import { SalesFilterOption } from "@/store/services/salesRepresentativesApi"

interface SalesRepFiltersProps {
  search: string
  segment: string
  region: string
  status: string
  segmentOptions: SalesFilterOption[]
  regionOptions: SalesFilterOption[]
  onSearchChange: (value: string) => void
  onSegmentChange: (value: string) => void
  onRegionChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function SalesRepFilters({
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
}: SalesRepFiltersProps) {

  const [isOpen, setIsOpen] = useState(false)

  const fieldClass =
    "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-sm focus:outline-none"

  return (
    <div className="filters-card">

      {/* DESKTOP LAYOUT */}
      <div className="filters-desktop">

        <div className="filter-field">
          <label>Search</label>
          <Input
            placeholder="Search by name or code"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={fieldClass}
          />
        </div>

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
          <label>Region</label>
          <Select value={region} onValueChange={onRegionChange}>
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder="All regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {regionOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="filter-field">
          <label>Status</label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* MOBILE LAYOUT */}
      <div className="filters-mobile">

        {/* Search always visible */}
        <div className="filter-field mb-4">
          <label>Search</label>
          <Input
            placeholder="Search Reports"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={fieldClass}
          />
        </div>

        {/* Expandable section */}
        <div className={`mobile-advanced ${isOpen ? "open" : ""}`}>

          <div className="filter-field">
            <label>Segment</label>
            <Select value={segment} onValueChange={onSegmentChange}>
              <SelectTrigger className={fieldClass} showClear={segment !== "all"} onClear={() => onSegmentChange("all")}>
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
            <label>Region</label>
            <Select value={region} onValueChange={onRegionChange}>
              <SelectTrigger className={fieldClass} showClear={region !== "all"} onClear={() => onRegionChange("all")}>
                <SelectValue placeholder="All regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regions</SelectItem>
                {regionOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="filter-field">
            <label>Status</label>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className={fieldClass} showClear={status !== "all"} onClear={() => onStatusChange("all")}>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>

        {/* Toggle always at bottom */}
        <div
          className="mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>Advanced Search</span>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

      </div>

    </div>
  )
}
