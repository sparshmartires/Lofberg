"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
  from: Date | undefined
  to: Date | undefined
  onFromChange: (date: Date | undefined) => void
  onToChange: (date: Date | undefined) => void
  className?: string
}

export function DateRangePicker({ from, to, onFromChange, onToChange, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const label =
    from && to
      ? `${format(from, "MM/dd/yyyy")} - ${format(to, "MM/dd/yyyy")}`
      : from
        ? `${format(from, "MM/dd/yyyy")} - ...`
        : "Select date range"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2 !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-sm focus:outline-none text-left",
            !from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-[#8A8A8A]" />
          <span className="truncate">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col sm:flex-row gap-2 p-3">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1 px-1">From</div>
            <Calendar
              mode="single"
              selected={from}
              onSelect={(date) => {
                onFromChange(date)
                if (date && to && date > to) onToChange(undefined)
              }}
              initialFocus
            />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1 px-1">To</div>
            <Calendar
              mode="single"
              selected={to}
              onSelect={(date) => {
                onToChange(date)
              }}
              disabled={(date) => (from ? date < from : false)}
            />
          </div>
        </div>
        {(from || to) && (
          <div className="border-t px-3 py-2 flex justify-end">
            <button
              onClick={() => {
                onFromChange(undefined)
                onToChange(undefined)
              }}
              className="text-xs text-[#5B2D91] hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
