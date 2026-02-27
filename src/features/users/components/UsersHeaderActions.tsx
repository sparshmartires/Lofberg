"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"

interface UsersHeaderActionsProps {
  search: string
  status: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function UsersHeaderActions({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: UsersHeaderActionsProps) {
  return (
    <div className="flex items-center gap-4">
      
      {/* Search */}
      <div className="relative w-[217px] h-[48px]">
        <Search
          size={16}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          className="
            w-full h-full
            rounded-[99px]
            border border-[#F0F0F0]
            pl-[20px] pr-[40px]
            py-[12px]
            shadow-[0px_2px_4px_0px_#0000000A]
            text-[#8A8A8A]
            placeholder:text-[#8A8A8A]
            focus:outline-none
            focus:ring-0
          "
        />
      </div>

      {/* Status Dropdown */}
      <div className="w-[141px] h-[48px]">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger
            className="
              w-full !h-[48px]
              rounded-[99px]
              color-[#1F1F1F]
              border border-[#F0F0F0]
              pl-[20px] pr-[8px]
              py-[12px]
              shadow-[0px_2px_4px_0px_#0000000A]
              text-[#8A8A8A]
              focus:outline-none
              focus:ring-0
            "
          >
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
  )
}