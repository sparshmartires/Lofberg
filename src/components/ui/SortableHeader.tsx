"use client"

import { ArrowUpDown } from "lucide-react"
import { TableHead } from "@/components/ui/table"

interface SortableHeaderProps {
  column: string
  children: React.ReactNode
  className?: string
  sortBy?: string
  onSort?: (column: string) => void
}

export function SortableHeader({ column, children, className, sortBy, onSort }: SortableHeaderProps) {
  return (
    <TableHead
      className={`table-header-cell cursor-pointer select-none ${className ?? ""}`}
      onClick={() => onSort?.(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`h-3 w-3 ${sortBy === column ? "text-[#5B2D91]" : "text-[#8A8A8A]"}`} />
      </div>
    </TableHead>
  )
}
