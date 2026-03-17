"use client"

import { useState } from "react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Trash2, Save, Loader2 } from "lucide-react"
import {
  useGetSegmentConversionsQuery,
  useCreateSegmentConversionMutation,
  useUpdateSegmentConversionMutation,
  useDeleteSegmentConversionMutation,
  type SegmentConversionItem,
} from "@/store/services/conversionLogicApi"
import { useGetCustomerSegmentsQuery } from "@/store/services/customersApi"

interface NewRowForm {
  segmentId: string
  metricLabel: string
  value: string
}

export default function SegmentBasedConversions() {
  const { data: conversions = [], isLoading } = useGetSegmentConversionsQuery()
  const { data: segments = [] } = useGetCustomerSegmentsQuery()

  const [createConversion, { isLoading: isCreating }] = useCreateSegmentConversionMutation()
  const [updateConversion] = useUpdateSegmentConversionMutation()
  const [deleteConversion] = useDeleteSegmentConversionMutation()

  const [form, setForm] = useState<NewRowForm>({ segmentId: "", metricLabel: "", value: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!form.segmentId || !form.metricLabel.trim() || !form.value) return
    const conversionValue = parseFloat(form.value)
    if (isNaN(conversionValue) || conversionValue <= 0) return

    await createConversion({
      segmentId: form.segmentId,
      metricLabel: form.metricLabel.trim(),
      conversionValue,
    })
    setForm({ segmentId: "", metricLabel: "", value: "" })
  }

  const handleUpdate = async (item: SegmentConversionItem) => {
    const conversionValue = parseFloat(editValue)
    if (isNaN(conversionValue) || conversionValue <= 0) return

    await updateConversion({
      id: item.id,
      body: { metricLabel: item.metricName, conversionValue },
    })
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    await deleteConversion(id)
    setConfirmDeleteId(null)
  }

  if (isLoading) {
    return (
      <div className="w-full rounded-[28px] border border-[#EDEDED] bg-white p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#7B3EBE]" />
      </div>
    )
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
          {conversions.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-4 items-center px-6 py-4 border-b border-[#F0F0F0]"
            >
              <span className="text-sm">{row.segmentName}</span>
              <span className="text-sm">{row.metricName}</span>

              {editingId === row.id ? (
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-[120px] h-[36px] rounded-full bg-[#F4F4F4] px-4 text-sm"
                  placeholder="00.0"
                  autoFocus
                />
              ) : (
                <span className="text-sm">{row.conversionValue}</span>
              )}

              <div className="flex gap-3">
                {editingId === row.id ? (
                  <button
                    onClick={() => handleUpdate(row)}
                    className="w-[32px] h-[32px] rounded-lg bg-[#F4ECFB] flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 text-[#5B2D91]" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(row.id)
                      setEditValue(String(row.conversionValue))
                    }}
                    className="w-[32px] h-[32px] rounded-lg bg-[#F4ECFB] flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 text-[#5B2D91]" />
                  </button>
                )}

                {confirmDeleteId === row.id ? (
                  <div className="flex gap-1 items-center">
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="text-xs text-red-600 font-medium px-2 py-1 rounded bg-red-50"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs text-[#747474] px-2 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(row.id)}
                    className="w-[32px] h-[32px] rounded-lg bg-[#F4ECFB] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 text-[#5B2D91]" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ADD NEW ROW */}
        <div className="grid grid-cols-4 items-center px-6 py-4 mt-4 border border-dashed border-[#EDEDED] rounded-xl">
          <Select
            value={form.segmentId}
            onValueChange={(v) => setForm({ ...form, segmentId: v })}
          >
            <SelectTrigger className="rounded-full h-[40px]">
              <SelectValue placeholder="Select segment" />
            </SelectTrigger>
            <SelectContent>
              {segments.map((seg) => (
                <SelectItem key={seg.id} value={seg.id}>{seg.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input
            value={form.metricLabel}
            onChange={(e) => setForm({ ...form, metricLabel: e.target.value })}
            className="w-[160px] h-[40px] rounded-full bg-[#F4F4F4] px-4 text-sm"
            placeholder="e.g. Hotel room"
          />

          <input
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            className="w-[120px] h-[36px] rounded-full bg-[#F4F4F4] px-4 text-sm"
            placeholder="00.0"
          />

          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating}
            className="w-fit border border-[#7B3EBE] text-[#7B3EBE] rounded-full px-4 py-2 text-sm disabled:opacity-50"
          >
            {isCreating ? "Adding..." : "Add"}
          </button>
        </div>
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
                value={form.segmentId}
                onValueChange={(v) => setForm({ ...form, segmentId: v })}
              >
                <SelectTrigger className="!w-full rounded-full h-[44px]">
                  <SelectValue placeholder="Select segment" />
                </SelectTrigger>
                <SelectContent>
                  {segments.map((seg) => (
                    <SelectItem key={seg.id} value={seg.id}>{seg.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* METRIC */}
          <div>
            <p className="text-[14px] mb-2">Segment metric</p>
            <input
              value={form.metricLabel}
              onChange={(e) => setForm({ ...form, metricLabel: e.target.value })}
              className="w-full h-[44px] rounded-full border border-[#EDEDED] px-4"
              placeholder="e.g. Hotel room"
            />
          </div>

          {/* VALUE */}
          <div>
            <p className="text-[14px] mb-2">Conversion value</p>
            <input
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="w-full h-[44px] rounded-full border border-[#EDEDED] px-4"
              placeholder="00.0"
            />
          </div>

          {/* ADD BUTTON */}
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating}
            className="w-fit border border-[#7B3EBE] text-[#7B3EBE] rounded-full px-6 py-3 disabled:opacity-50"
          >
            {isCreating ? "Adding..." : "Add new conversion"}
          </button>
        </div>

        {/* CARDS */}
        <div className="space-y-4">
          {conversions.map((row) => (
            <div
              key={row.id}
              className="border border-[#EDEDED] rounded-[20px] p-4 space-y-2"
            >
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Segment</span>
                <span>{row.segmentName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Segment metric</span>
                <span>{row.metricName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Conversion value</span>
                <span>{row.conversionValue}</span>
              </div>

              <div className="border-t pt-2 flex justify-between items-center">
                <span className="text-[#6B6B6B]">Actions</span>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(row.id)
                      setEditValue(String(row.conversionValue))
                    }}
                    className="w-[28px] h-[28px] bg-[#F4ECFB] rounded flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 text-[#5B2D91]" />
                  </button>

                  <button
                    onClick={() => handleDelete(row.id)}
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
