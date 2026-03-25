"use client"

import { ChevronLeft } from "lucide-react"
import { Button } from "./button"

interface BackButtonProps {
  onClick: () => void
  disabled?: boolean
  label?: string
}

export function BackButton({ onClick, disabled = false, label = "Back" }: BackButtonProps) {
  return (
    <Button
      type="button"
      variant="outlineBrand"
      onClick={onClick}
      disabled={disabled}
      className="gap-2"
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}
