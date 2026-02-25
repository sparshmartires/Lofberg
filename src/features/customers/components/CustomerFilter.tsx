"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

export function CustomerFilters() {
  const [segment, setSegment] = React.useState("")
  const [region, setRegion] = React.useState("")
  const [status, setStatus] = React.useState("")

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

            <Select value={segment} onValueChange={setSegment}>
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
              >
                <SelectValue placeholder="All Segments" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* REGION */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[14px] text-[#1F1F1F]">
              Region
            </label>

            <Select value={region} onValueChange={setRegion}>
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
              >
                <SelectValue placeholder="All Region" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="north">North</SelectItem>
                <SelectItem value="south">South</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* STATUS */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[14px] text-[#1F1F1F]">
              Status
            </label>

            <Select value={status} onValueChange={setStatus}>
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
              >
                <SelectValue placeholder="All Status" />
              </SelectTrigger>

              <SelectContent>
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
