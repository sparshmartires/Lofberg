"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

interface SalesRepFiltersProps {
  search: string
  segment: string
  region: string
  status: string
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
  onSearchChange,
  onSegmentChange,
  onRegionChange,
  onStatusChange,
}: SalesRepFiltersProps) {
  const fieldClass =
    "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-sm focus:outline-none mb-4"

  return (
    <div className="w-full rounded-[28px] bg-white border border-[#F0F0F0] p-6 shadow-sm mb-6">
      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1F1F1F]">
            Search
          </label>
          <Input
            placeholder="Search by name or code"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={fieldClass}
          />
        </div>

        {/* Segment */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1F1F1F]">
            Segment
          </label>
          <Select value={segment} onValueChange={onSegmentChange}>
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder="All Segments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="horeca">HoReCa</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Region */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1F1F1F]">
            Region
          </label>
          <Select value={region} onValueChange={onRegionChange}>
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder="All Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Region</SelectItem>
              <SelectItem value="north">North</SelectItem>
              <SelectItem value="south">South</SelectItem>
              <SelectItem value="east">East</SelectItem>
              <SelectItem value="west">West</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1F1F1F]">
            Status
          </label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>
    </div>
  )
}