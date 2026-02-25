"use client"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

import { Badge } from "@/components/ui/badge"
import { X, Download } from "lucide-react"
import Image from "next/image"

interface CustomerHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  avatar: string
}

const historyData = [
  {
    id: "446416416",
    customer: "Helena Sjöberg",
    type: "Salesperson",
    segment: "Hotel",
    date: "02/02/2026",
  },
  {
    id: "789234123",
    customer: "Liam Anderson",
    type: "Salesperson",
    segment: "Restaurant",
    date: "02/02/2026",
  },
  {
    id: "678901234",
    customer: "Sophia Martinez",
    type: "Salesperson",
    segment: "Coffee Shop",
    date: "02/02/2026",
  },
  {
    id: "567890123",
    customer: "Noah Thompson",
    type: "Salesperson",
    segment: "Arena",
    date: "02/02/2026",
  },
  {
    id: "345678901",
    customer: "Oliver Brown",
    type: "Salesperson",
    segment: "Wholesale",
    date: "02/02/2026",
  },
]

export function CustomerHistoryDialog({
  open,
  onOpenChange,
  userName,
  avatar,
}: CustomerHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="
          max-w-[1200px]
          rounded-[32px]
          p-[48px]
          bg-white
          border-none
        "
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-8 right-8"
        >
          <X className="h-6 w-6 text-[#1F1F1F]" />
        </button>

        {/* TITLE */}
        <h2 className="text-[24px] leading-[120%] text-[#1F1F1F] mb-8">
          Customer History
        </h2>

        {/* USER HEADER */}
        <div className="flex items-center gap-6 mb-10">
          <Image
            src={avatar}
            alt={userName}
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
          <h3 className="text-[32px] leading-[120%] text-[#4E4E4E]">
            {userName}
          </h3>
        </div>

        {/* TABLE HEADER */}
        <div className="grid grid-cols-6 text-[16px] text-[#1F1F1F] pb-4 border-b border-dashed border-[#CFA8F5]">
          <div>Report Title/ID</div>
          <div>Customer Name</div>
          <div>Report Type</div>
          <div>Market Segment</div>
          <div>Date Created</div>
          <div className="text-right">Actions</div>
        </div>

        {/* TABLE BODY */}
        <div className="divide-y divide-[#E5E5E5]">
          {historyData.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-6 items-center py-6 text-[15px] text-[#4E4E4E]"
            >
              <div>{item.id}</div>

              <div>{item.customer}</div>

              <div>
                <Badge
                  className="
                    bg-[#EADCF6]
                    text-[#7B3EBE]
                    rounded-full
                    px-4
                    py-1
                    text-[12px]
                    font-normal
                  "
                >
                  {item.type}
                </Badge>
              </div>

              <div>{item.segment}</div>

              <div>{item.date}</div>

              <div className="flex justify-end">
                <button
                  className="
                    w-[36px]
                    h-[36px]
                    rounded-[10px]
                    bg-[#F4ECFB]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Download
                    className="w-[18px] h-[18px] text-[#5B2D91]"
                    fill="currentColor"
                    stroke="none"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

      </DialogContent>
    </Dialog>
  )
}
