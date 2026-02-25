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

export function UsersPagination() {
  return (
    <div className="pagination-container">

     <div className="pagination-side">
    <p className="pagination-results-text">
      Results: 1–11 of 150
    </p>
  </div>

      {/* CENTER */}
      <div className="pagination-center">
    <Pagination>
      <PaginationContent className="flex items-center gap-3">

          {/* PREVIOUS */}
          <PaginationItem>
            <button className="pagination-page-btn">
              <ChevronLeft className="pagination-arrow-icon" />
            </button>
          </PaginationItem>

          {/* ACTIVE */}
          <PaginationItem>
            <button
              className="pagination-page-btn-active"
            >
              1
            </button>
          </PaginationItem>

          {/* OTHER PAGES */}
          {[2, 3].map((page) => (
            <PaginationItem key={page}>
              <button
                className="pagination-page-btn pagination-page-btn-text"
              >
                {page}
              </button>
            </PaginationItem>
          ))}

          {/* ELLIPSIS */}
          <PaginationItem>
            <button className="pagination-page-btn pagination-page-btn-text">
              ...
            </button>
          </PaginationItem>

          {/* LAST */}
          <PaginationItem>
            <button className="pagination-page-btn pagination-page-btn-text">
              10
            </button>
          </PaginationItem>

          {/* NEXT */}
          <PaginationItem>
            <button className="pagination-page-btn pagination-page-btn-text">
              <ChevronRight className="pagination-arrow-icon" />
            </button>
          </PaginationItem>

     </PaginationContent>
    </Pagination>
  </div>

      {/* RIGHT */}
     <div className="pagination-right">
    <span className="pagination-label-text">
      Rows per page
    </span>

        <Select defaultValue="11">
          <SelectTrigger
            className="pagination-rows-select"
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="11">11</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

    </div>
  )
}
