"use client"

import { useCallback } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { AddOnBlock, ADD_ON_BLOCK_LABELS } from "../types"

interface AddOnBlockSelectorProps {
  selected: AddOnBlock[]
  onChange: (selected: AddOnBlock[]) => void
  max?: number
  labels?: Partial<Record<AddOnBlock, string>>
}

const ALL_BLOCKS = Object.values(AddOnBlock).filter(
  (v) => typeof v === "number"
) as AddOnBlock[]

export function AddOnBlockSelector({
  selected,
  onChange,
  max = 3,
  labels,
}: AddOnBlockSelectorProps) {
  const handleToggle = useCallback(
    (block: AddOnBlock, checked: boolean) => {
      if (checked) {
        if (selected.length < max) {
          onChange([...selected, block])
        }
      } else {
        onChange(selected.filter((b) => b !== block))
      }
    },
    [selected, onChange, max]
  )

  return (
    <div>
      <div className="grid grid-cols-1 min-[500px]:grid-cols-2 gap-3">
        {ALL_BLOCKS.map((block) => {
          const isSelected = selected.includes(block)
          const isDisabled = !isSelected && selected.length >= max

          return (
            <div key={block} className="flex items-center gap-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => handleToggle(block, Boolean(checked))}
                disabled={isDisabled}
              />
              <label
                className={`text-sm ${
                  isDisabled ? "text-[#9CA3AF] cursor-not-allowed" : "text-[#1F1F1F] cursor-pointer"
                }`}
              >
                {labels?.[block] || ADD_ON_BLOCK_LABELS[block]}
              </label>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-[#9CA3AF] mt-2">
        {selected.length}/{max} blocks selected
      </p>
    </div>
  )
}
