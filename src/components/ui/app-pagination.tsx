"use client"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface AppPaginationProps {
  currentPage?: number
  pageSize?: number
  totalCount?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  disabled?: boolean
}

export function AppPagination({
  currentPage = 1,
  pageSize = 10,
  totalCount = 150,
  onPageChange,
  onPageSizeChange,
  disabled = false,
}: AppPaginationProps) {
  const safePageSize = Math.max(1, pageSize)
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize))
  const clampedPage = Math.min(Math.max(1, currentPage), totalPages)

  const start = totalCount === 0 ? 0 : (clampedPage - 1) * safePageSize + 1
  const end = totalCount === 0 ? 0 : Math.min(clampedPage * safePageSize, totalCount)

  const visiblePages = Array.from(
    { length: Math.min(3, totalPages) },
    (_, index) => clampedPage + index
  ).filter((page) => page <= totalPages)

  const handlePageChange = (page: number) => {
    if (disabled) return
    onPageChange?.(Math.min(Math.max(page, 1), totalPages))
  }

  return (
    <>
    <div className="pagination-desktop">
    <div className="pagination-container">
      <div className="pagination-side">
        <p className="pagination-results-text">Results: {start}–{end} of {totalCount}</p>
      </div>

      <div className="pagination-center">
        <Pagination>
          <PaginationContent className="flex items-center gap-3">
            <PaginationItem>
              <button
                className="pagination-page-btn"
                onClick={() => handlePageChange(clampedPage - 1)}
                disabled={disabled || clampedPage <= 1}
              >
                <ChevronLeft className="pagination-arrow-icon" />
              </button>
            </PaginationItem>

            {visiblePages.map((page) => (
              <PaginationItem key={page}>
                <button
                  className={
                    page === clampedPage
                      ? "pagination-page-btn-active"
                      : "pagination-page-btn pagination-page-btn-text"
                  }
                  onClick={() => handlePageChange(page)}
                  disabled={disabled}
                >
                  {page}
                </button>
              </PaginationItem>
            ))}

            {totalPages > visiblePages[visiblePages.length - 1] && (
              <>
                <PaginationItem>
                  <button className="pagination-page-btn pagination-page-btn-text" disabled>
                    ...
                  </button>
                </PaginationItem>

                <PaginationItem>
                  <button
                    className="pagination-page-btn pagination-page-btn-text"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={disabled}
                  >
                    {totalPages}
                  </button>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <button
                className="pagination-page-btn pagination-page-btn-text"
                onClick={() => handlePageChange(clampedPage + 1)}
                disabled={disabled || clampedPage >= totalPages}
              >
                <ChevronRight className="pagination-arrow-icon" />
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <div className="pagination-right">
        <span className="pagination-label-text">Rows per page</span>

        <Select
          value={String(safePageSize)}
          onValueChange={(value) => {
            const parsed = Number(value)
            if (!Number.isNaN(parsed)) {
              onPageSizeChange?.(parsed)
            }
          }}
          disabled={disabled}
        >
          <SelectTrigger className="pagination-rows-select">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="15">15</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    </div>
    </>
  )
}