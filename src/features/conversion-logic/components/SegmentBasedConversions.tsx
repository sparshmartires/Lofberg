"use client"

import { useState } from "react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Trash2, Save } from "lucide-react"

interface ConversionRow {
  id: number
  segment: string
  metric: string
  value: string
}

export default function SegmentBasedConversions() {

  const [rows, setRows] = useState<ConversionRow[]>([])

  const addRow = () => {
    setRows([
      ...rows,
      { id: Date.now(), segment: "", metric: "", value: "" }
    ])
  }

  const updateRow = (id: number, key: keyof ConversionRow, value: string) => {
    setRows(rows.map(row =>
      row.id === id ? { ...row, [key]: value } : row
    ))
  }

  const deleteRow = (id: number) => {
    setRows(rows.filter(row => row.id !== id))
  }

  return (
    <div className="w-full rounded-[28px] border border-[#EDEDED] bg-white p-8 space-y-6">

      {/* HEADER */}
      <div>
        <p className="text-[18px] text-[#1F1F1F]">
          Segment-based conversions (Football pitches)
        </p>

        <p className="text-[14px] text-[#747474]">
          Configure how football pitches convert to segment-specific metrics
        </p>
      </div>

      {/* TABLE HEADER */}
      <div className="grid grid-cols-4 bg-[#FAFAFA] rounded-xl px-6 py-4 text-[14px] text-[#4E4E4E]">
        <div>Segments</div>
        <div>Segment metric</div>
        <div>Conversion value</div>
        <div >Actions</div>
      </div>

      {/* ROWS */}
      <div className="space-y-4">

        {rows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-4 items-center  px-6 py-4 border-b border-[#F0F0F0]"
          >

            {/* SEGMENT */}
            <Select
              value={row.segment}
              onValueChange={(v) => updateRow(row.id, "segment", v)}
            >
              <SelectTrigger className="rounded-full h-[40px]">
                <SelectValue placeholder="Select segment" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="office">Office</SelectItem>
              </SelectContent>
            </Select>

            {/* METRIC */}
            <Select
              value={row.metric}
              onValueChange={(v) => updateRow(row.id, "metric", v)}
            >
              <SelectTrigger className="rounded-full h-[40px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="co2">CO2 saved</SelectItem>
                <SelectItem value="water">Water saved</SelectItem>
                <SelectItem value="energy">Energy saved</SelectItem>
              </SelectContent>
            </Select>

            {/* VALUE */}
            <input
              value={row.value}
              onChange={(e) =>
                updateRow(row.id, "value", e.target.value)
              }
              className="w-[120px] h-[36px] rounded-full bg-[#F4F4F4] px-4 text-sm"
              placeholder="400"
            />

            {/* ACTIONS */}
            <div className="flex  gap-3">

              <button className="w-[32px] h-[32px] rounded-lg bg-[#F4ECFB] flex items-center justify-center">
                <Save className="w-4 h-4 text-[#5B2D91]" />
              </button>

              <button
                onClick={() => deleteRow(row.id)}
                className="w-[32px] h-[32px] rounded-lg bg-[#F4ECFB] flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 text-[#5B2D91]" />
              </button>

            </div>

          </div>
        ))}

      </div>

      {/* ADD BUTTON */}
      <button
        onClick={addRow}
        className="border border-[#7B3EBE] text-[#7B3EBE] rounded-full px-6 py-2 text-sm"
      >
        Add new conversion
      </button>

    </div>
  )
}