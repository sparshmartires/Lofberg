"use client"

import Image from "next/image"
import { Download, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export interface HistoryDialogItem {
  id: string
  customer: string
  type: string
  segment: string
  date: string
}

interface HistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  avatar: string
  title: string
  historyData?: HistoryDialogItem[]
}

const defaultHistoryData: HistoryDialogItem[] = [
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

export function HistoryDialog({
  open,
  onOpenChange,
  userName,
  avatar,
  title,
  historyData = defaultHistoryData,
}: HistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="
          w-[calc(100%-32px)]
          max-w-[1200px]
          max-h-[calc(100vh-32px)]
          rounded-[32px]
          p-[32px 24px]
          bg-white
          border-none
          gap-[4px]
          overflow-y-auto
          max-[650px]:overflow-auto
        "
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-8 right-8"
        >
          <X className="h-6 w-6 text-[#1F1F1F]" />
        </button>

        <h2 className="text-[18px] leading-[120%] text-[#1F1F1F] mb-[26px]">
          {title}
        </h2>

        <div className="flex items-center gap-[14px] mb-[28px]">
          <Image
            src={avatar}
            alt={userName}
            width={44}
            height={44}
            className="rounded-full object-cover"
          />
          <h3 className="text-[24px] leading-[120%] text-[#4E4E4E]">
            {userName}
          </h3>
        </div>

        <div className="history-desktop">
          <div className="grid grid-cols-6 text-[16px] text-[#1F1F1F] pb-4 border-b border-dashed border-[#CFA8F5]">
            <div className="pl-[12px]">Report Title/ID</div>
            <div>Customer Name</div>
            <div>Report Type</div>
            <div>Market Segment</div>
            <div>Date Created</div>
            <div>Actions</div>
          </div>

          <div className="divide-y divide-[#E5E5E5]">
            {historyData.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-6 items-center py-6 text-[15px] text-[#4E4E4E]"
              >
                <div className="pl-[12px]">{item.id}</div>

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

                <div className="flex justify-start">
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
        </div>

        <div className="history-mobile">
          {historyData.map((item) => (
            <div key={item.id} className="history-mobile-card">
              <div className="history-mobile-top">
                <span className="history-mobile-name">{item.customer}</span>

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

              <div className="history-mobile-divider" />

              <div className="history-mobile-split">
                <div>
                  <div className="history-mobile-label">Report ID/Title :{item.id}</div>
                  <span className="history-mobile-label">Segment:{item.segment}</span>
                </div>

                <div className="text-right">
                  <div className="history-mobile-label">Date Created</div>
                  <div className="history-mobile-value">{item.date}</div>
                </div>
              </div>

              <div className="history-mobile-divider" />

              <div className="history-mobile-action">
                <button className="history-mobile-save">
                  Save
                  <Download
                    className="w-4 h-4 ml-2"
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