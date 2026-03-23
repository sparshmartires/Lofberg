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
import { Loader2 } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"

interface UsersHeaderActionsProps {
  search: string
  status: string
  isLoading?: boolean
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function UsersHeaderActions({
  search,
  status,
  isLoading = false,
  onSearchChange,
  onStatusChange,
}: UsersHeaderActionsProps) {
  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebounce(searchInput)

  useEffect(() => {
    onSearchChange(debouncedSearch)
  }, [debouncedSearch, onSearchChange])

  const fieldClass =
    "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-sm focus:outline-none"

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="w-[200px]">
        <SearchInput
          placeholder="Search"
          value={searchInput}
          onChange={setSearchInput}
          className={fieldClass}
        />
      </div>

      <div className="w-[160px]">
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

      {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  )
}
