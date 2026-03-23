"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

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

  return (
    <div className="w-full max-w-[1360px] mx-auto">
      <div
        className="
          w-full
          p-[16px]
          rounded-[20px]
          border
          border-[#E6E6E6]
          bg-white
        "
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px]">

          {/* SEARCH */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[14px] text-[#1F1F1F]">
              Search
            </label>

            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by name or code"
              className="
                !h-[44px]
                px-[20px]
                py-[12px]
                rounded-[99px]
                border
                border-[#E6E6E6]
                focus-visible:ring-0
              "
            />
          </div>

          {/* SEGMENT */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[14px] text-[#1F1F1F]">
              Segment
            </label>

            <Select value={segment} onValueChange={onSegmentChange}>
              <SelectTrigger
                className="
                  !h-[44px]
                  px-[20px]
                  py-[12px]
                  rounded-[99px]
                  border
                  border-[#E6E6E6]
                  focus:ring-0
                "
                showClear={segment !== "all"}
                onClear={() => onSegmentChange("all")}
              >
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

          {/* REGION */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[14px] text-[#1F1F1F]">
              Region
            </label>

            <Select value={region} onValueChange={onRegionChange}>
              <SelectTrigger
                className="
                  !h-[44px]
                  px-[20px]
                  py-[12px]
                  rounded-[99px]
                  border
                  border-[#E6E6E6]
                  focus:ring-0
                "
                showClear={region !== "all"}
                onClear={() => onRegionChange("all")}
              >
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

          {/* STATUS */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[14px] text-[#1F1F1F]">
              Status
            </label>

            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger
                className="
                  !h-[44px]
                  px-[20px]
                  py-[12px]
                  rounded-[99px]
                  border
                  border-[#E6E6E6]
                  focus:ring-0
                "
                showClear={status !== "all"}
                onClear={() => onStatusChange("all")}
              >
                <SelectValue placeholder="All status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>
    </div>
  )
}
