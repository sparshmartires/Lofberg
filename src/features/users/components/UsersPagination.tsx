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
    <div className="flex items-center justify-between mt-10">

     <div className="flex-1">
    <p className="text-[14px] leading-[120%] text-[#6B6B6B]">
      Results: 1–11 of 150
    </p>
  </div>

      {/* CENTER */}
      <div className="flex justify-center flex-1">
    <Pagination>
      <PaginationContent className="flex items-center gap-3">

          {/* PREVIOUS */}
          <PaginationItem>
            <button className="h-[36px] w-[36px] rounded-full bg-[#FFFFFF] flex items-center justify-center border border-[#C9CDD499]">
              <ChevronLeft className="h-4 w-4 text-[#778394]" />
            </button>
          </PaginationItem>

          {/* ACTIVE */}
          <PaginationItem>
            <button
              className="
                h-[36px] w-[36px]
                rounded-full
                border border-[#7B3EBE]
                bg-[#F5EEFB]
                text-[#7B3EBE]
                text-[14px]
                font-normal
                flex items-center justify-center
              "
            >
              1
            </button>
          </PaginationItem>

          {/* OTHER PAGES */}
          {[2, 3].map((page) => (
            <PaginationItem key={page}>
              <button
                className="
                  h-[36px] w-[36px]
                  rounded-full
                  bg-[#FFFFFF]
                  text-[14px]
                  text-[#4C4951]
                  border border-[#C9CDD499]
                  flex items-center justify-center
                "
              >
                {page}
              </button>
            </PaginationItem>
          ))}

          {/* ELLIPSIS */}
          <PaginationItem>
            <button className="h-[36px] w-[36px] rounded-full bg-[#FFFFFF] text-[#4C4951]   border border-[#C9CDD499] flex items-center justify-center">
              ...
            </button>
          </PaginationItem>

          {/* LAST */}
          <PaginationItem>
            <button className="h-[36px] w-[36px] rounded-full bg-[#FFFFFF] text-[#4C4951]   border border-[#C9CDD499] flex items-center justify-center">
              10
            </button>
          </PaginationItem>

          {/* NEXT */}
          <PaginationItem>
            <button className="h-[36px] w-[36px] rounded-full bg-[#FFFFFF] text-[#4C4951]   border border-[#C9CDD499] flex items-center justify-center">
              <ChevronRight className="h-4 w-4 text-[#778394]" />
            </button>
          </PaginationItem>

     </PaginationContent>
    </Pagination>
  </div>

      {/* RIGHT */}
     <div className="flex justify-end flex-1 items-center gap-3">
    <span className="text-[14px] text-[#6B6B6B]">
      Rows per page
    </span>

        <Select defaultValue="11">
          <SelectTrigger
            className="
              h-[36px]
              w-[72px]
              rounded-[12px]
              border border-[#C9CDD4]
              bg-[#FFFFFF]
              text-[14px]
            "
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
