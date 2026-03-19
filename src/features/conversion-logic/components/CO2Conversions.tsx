"use client"

import { useState } from "react"
import { Save, Trash2, Loader2, Languages } from "lucide-react"
import {
  useGetCO2ConversionsQuery,
  useCreateCO2ConversionMutation,
  useUpdateCO2ConversionMutation,
  useDeleteCO2ConversionMutation,
  type CO2ConversionItem,
} from "@/store/services/conversionLogicApi"
import ConversionTranslationDialog from "./ConversionTranslationDialog"

interface NewRowForm {
  name: string
  value: string
}

export default function CO2Conversions() {
  const { data: conversions = [], isLoading } = useGetCO2ConversionsQuery()

  const [createConversion, { isLoading: isCreating }] = useCreateCO2ConversionMutation()
  const [updateConversion] = useUpdateCO2ConversionMutation()
  const [deleteConversion] = useDeleteCO2ConversionMutation()

  const [form, setForm] = useState<NewRowForm>({ name: "", value: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editValue, setEditValue] = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [translatingItem, setTranslatingItem] = useState<CO2ConversionItem | null>(null)

  const handleCreate = async () => {
    if (!form.name || !form.value) return
    const conversionValue = parseFloat(form.value)
    if (isNaN(conversionValue) || conversionValue <= 0) return

    await createConversion({ name: form.name, conversionValue })
    setForm({ name: "", value: "" })
  }

  const handleUpdate = async (item: CO2ConversionItem) => {
    const conversionValue = parseFloat(editValue)
    if (isNaN(conversionValue) || conversionValue <= 0) return
    if (!editName.trim()) return

    await updateConversion({
      id: item.id,
      body: { name: editName, conversionValue },
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
          CO2 conversions
        </p>

        <p className="text-[14px] text-[#747474]">
          Configure how CO2 values convert to tangible comparisons
        </p>
      </div>

      {/* ================= DESKTOP TABLE ================= */}

      <div className="hidden md:block">

        <div className="grid grid-cols-3 bg-[#FAFAFA] rounded-xl px-6 py-4 text-[14px] text-[#4E4E4E]">
          <div>Name</div>
          <div>Conversion value</div>
          <div>Actions</div>
        </div>

        <div className="space-y-4">
          {conversions.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-3 items-center px-6 py-4 border-b border-[#F0F0F0]"
            >
              {editingId === row.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-[180px] h-[36px] rounded-full bg-[#F4F4F4] px-4 text-sm"
                  autoFocus
                />
              ) : (
                <span className="text-sm">{row.name}</span>
              )}

              {editingId === row.id ? (
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-[120px] h-[36px] rounded-full bg-[#F4F4F4] px-4 text-sm"
                  placeholder="00.0"
                />
              ) : (
                <span className="text-sm">{row.conversionValue}</span>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setTranslatingItem(row)}
                  className="w-[32px] h-[32px] rounded-lg bg-[#F4ECFB] flex items-center justify-center"
                  title="Translate"
                >
                  <Languages className="w-4 h-4 text-[#5B2D91]" />
                </button>

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
                      setEditName(row.name)
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
        <div className="grid grid-cols-3 items-center px-6 py-4 mt-4 border border-dashed border-[#EDEDED] rounded-xl">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-[180px] h-[36px] rounded-full bg-[#F4F4F4] px-4 text-sm"
            placeholder="e.g. Idling cars"
          />

          <input
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            placeholder="0.002"
            className="w-[120px] h-[36px] rounded-full bg-[#F4F4F4] px-4 text-sm"
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

          {/* NAME */}
          <div>
            <p className="text-[14px] mb-2">Conversion name</p>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-[44px] rounded-full border border-[#EDEDED] px-4"
              placeholder="e.g. Idling cars"
            />
          </div>

          {/* VALUE */}
          <div>
            <p className="text-[14px] mb-2">Conversion value</p>
            <input
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="w-full h-[44px] rounded-full border border-[#EDEDED] px-4"
              placeholder="0.002"
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
                <span className="text-[#6B6B6B]">Name</span>
                <span>{row.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Conversion value</span>
                <span>{row.conversionValue}</span>
              </div>

              <div className="border-t pt-2 flex justify-between items-center">
                <span className="text-[#6B6B6B]">Actions</span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setTranslatingItem(row)}
                    className="w-[28px] h-[28px] bg-[#F4ECFB] rounded flex items-center justify-center"
                  >
                    <Languages className="w-4 h-4 text-[#5B2D91]" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingId(row.id)
                      setEditName(row.name)
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

      <ConversionTranslationDialog
        open={!!translatingItem}
        onOpenChange={(open) => !open && setTranslatingItem(null)}
        conversionId={translatingItem?.id ?? ""}
        conversionType="co2"
        englishMetric={translatingItem?.name ?? ""}
      />
    </div>
  )
}
