"use client"

import { HistoryDialog } from "@/components/ui/history-dialog"

interface SalesHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  avatar: string
}

export function SalesHistoryDialog({
  open,
  onOpenChange,
  userName,
  avatar,
}: SalesHistoryDialogProps) {
  return (
    <HistoryDialog
      open={open}
      onOpenChange={onOpenChange}
      userName={userName}
      avatar={avatar}
      title="Sales Report History"
    />
  )
}
