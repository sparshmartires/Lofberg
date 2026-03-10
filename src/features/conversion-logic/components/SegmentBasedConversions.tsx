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

  const [form, setForm] = useState({
    segment: "",
    metric: "",
    value: ""
  })

  const addRow = () => {
    if (!form.segment || !form.metric || !form.value) return

    setRows((prevRows) => [
      ...prevRows,
      {
        id: Date.now(),
        segment: form.segment,
        metric: form.metric,
        value: form.value
      }
    ])

    setForm({ segment: "", metric: "", value: "" })
  }

  const addDesktopRow = () => {
    setRows((prevRows) => [
      ...prevRows,
      {
        id: Date.now(),
        segment: "",
        metric: "",
        value: ""
      }
    ])
  }

  const updateRow = (id: number, key: keyof ConversionRow, value: string) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, [key]: value } : row
      )
    )
  }

  const deleteRow = (id: number) => {
    setRows((prevRows) => prevRows.filter(row => row.id !== id))
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

      {/* ================= DESKTOP TABLE ================= */}

      <div className="hidden md:block">

        <div className="grid grid-cols-4 bg-[#FAFAFA] rounded-xl px-6 py-4 text-[14px] text-[#4E4E4E]">
          <div>Segments</div>
          <div>Segment metric</div>
          <div>Conversion value</div>
          <div>Actions</div>
        </div>

        <div className="space-y-4">
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-4 items-center px-6 py-4 border-b border-[#F0F0F0]"
            >
              <Select
                value={row.segment}
                onValueChange={(v) => updateRow(row.id, "segment", v)}
              >
                <SelectTrigger className="rounded-full h-[40px]">
                  <SelectValue placeholder="Select segment" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="coffee">coffee shop</SelectItem>
                  <SelectItem value="restaurant">restaurant</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={row.metric}
                onValueChange={(v) => updateRow(row.id, "metric", v)}
              >
                <SelectTrigger className="rounded-full h-[40px]">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="tables">Coffee shop tables</SelectItem>
                  <SelectItem value="cups">Coffee cups</SelectItem>
                </SelectContent>
              </Select>

              <input
                value={row.value}
                onChange={(e) => updateRow(row.id, "value", e.target.value)}
                className="w-[120px] h-[36px] rounded-full bg-[#F4F4F4] px-4 text-sm"
                placeholder="00.0"
              />

              <div className="flex gap-3">
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

        <button
          type="button"
          onClick={addDesktopRow}
          className="mt-6 border border-[#7B3EBE] text-[#7B3EBE] rounded-full px-6 py-2 text-sm"
        >
          Add new conversion
        </button>

      </div>

      {/* ================= MOBILE VIEW ================= */}

      <div className="md:hidden space-y-6">

        {/* FORM */}
        <div className="space-y-4">

          {/* SEGMENT */}
          <div>
            <p className="text-[14px] mb-2">Select segment</p>

            <div className="w-full">
              <Select
                value={form.segment}
                onValueChange={(v) => setForm({ ...form, segment: v })}
              >
                <SelectTrigger className="!w-full rounded-full h-[44px]">
                  <SelectValue placeholder="select segment" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="coffee">coffee shop</SelectItem>
                  <SelectItem value="restaurant">restaurant</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* METRIC */}
          <div>
            <p className="text-[14px] mb-2">Select metric</p>

            <div className="w-full">
              <Select
                value={form.metric}
                onValueChange={(v) => setForm({ ...form, metric: v })}
              >
                <SelectTrigger className="!w-full rounded-full h-[44px]">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="tables">Coffee shop tables</SelectItem>
                  <SelectItem value="cups">Coffee cups</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* VALUE */}
          <div>
            <p className="text-[14px] mb-2">Select conversion value</p>

            <input
              value={form.value}
              onChange={(e) =>
                setForm({ ...form, value: e.target.value })
              }
              className="w-full h-[44px] rounded-full border border-[#EDEDED] px-4"
              placeholder="00.0"
            />
          </div>

          {/* ADD BUTTON */}
          <button
            type="button"
            onClick={addRow}
            className="w-full border border-[#7B3EBE] text-[#7B3EBE] rounded-full py-3"
          >
            Add new conversion
          </button>

        </div>

        {/* CARDS */}
        <div className="space-y-4">

          {rows.map((row) => (
            <div
              key={row.id}
              className="border border-[#EDEDED] rounded-[20px] p-4 space-y-2"
            >

              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Segment</span>
                <span>{row.segment}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Segment metric</span>
                <span>{row.metric}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Conversion value</span>
                <span>{row.value}</span>
              </div>

              <div className="border-t pt-2 flex justify-between items-center">
                <span className="text-[#6B6B6B]">Actions</span>

                <div className="flex gap-2">

                  <button className="w-[28px] h-[28px] bg-[#F4ECFB] rounded flex items-center justify-center">
                    <Save className="w-4 h-4 text-[#5B2D91]" />
                  </button>

                  <button
                    onClick={() => deleteRow(row.id)}
                    className="w-[28px] h-[28px] bg-[#F4ECFB] rounded flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 text-[#5B2D91]" />
                  </button>

                </div>
              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  )
}