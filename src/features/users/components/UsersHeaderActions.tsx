"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Search } from "lucide-react"

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
  return (
    <div className="users-header-actions">

      {/* Search */}
      <div className="users-header-actions-search-wrap">
        <Search
          size={16}
          className="users-header-actions-search-icon"
        />

        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          className="users-header-actions-search-input"
        />
      </div>

      {/* Status Dropdown */}
      <div className="users-header-actions-status-wrap">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="users-header-actions-status-trigger">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
    </div>
  )
}