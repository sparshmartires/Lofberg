"use client"

import { useState } from "react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Save, Trash2 } from "lucide-react"

interface CO2Row {
  id: number
  segment: string
  value: string
}

export default function CO2Conversions() {

  const [rows, setRows] = useState<CO2Row[]>([])

  const [form, setForm] = useState({
    segment: "",
    value: ""
  })

  const addRow = () => {
    if (!form.segment || !form.value) return

    setRows((prevRows) => [
      ...prevRows,
      {
        id: Date.now(),
        segment: form.segment,
        value: form.value
      }
    ])

    setForm({ segment: "", value: "" })
  }

  const addDesktopRow = () => {
    setRows((prevRows) => [
      ...prevRows,
      { id: Date.now(), segment: "", value: "" }
    ])
  }

  const updateRow = (id: number, key: keyof CO2Row, value: string) => {
    setRows((prevRows) =>
      prevRows.map(row =>
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
          CO2 conversions
        </p>

        <p className="text-[14px] text-[#747474]">
          Configure how CO2 values convert to tangible comparisons
        </p>
      </div>

      {/* ================= DESKTOP TABLE ================= */}

      <div className="hidden md:block">

        <div className="grid grid-cols-3 bg-[#FAFAFA] rounded-xl px-6 py-4 text-[14px] text-[#4E4E4E]">
          <div>Segments</div>
          <div>Conversion value</div>
          <div>Actions</div>
        </div>

        <div className="space-y-4">
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-3 items-center px-6 py-4 border-b border-[#F0F0F0]"
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

              {/* VALUE */}
              <input
                value={row.value}
                onChange={(e) => updateRow(row.id, "value", e.target.value)}
                placeholder="400"
                className="w-[120px] h-[36px] rounded-full bg-[#F4F4F4] px-4 text-sm"
              />

              {/* ACTIONS */}
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
                  <SelectValue placeholder="Select segment" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* VALUE */}
          <div>
            <p className="text-[14px] mb-2">Select conversion value</p>

            <input
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="w-full h-[44px] rounded-full border border-[#EDEDED] px-4"
              placeholder="400"
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