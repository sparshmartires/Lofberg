"use client"

import { HistoryDialog } from "@/components/ui/history-dialog"

interface CustomerHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  avatar: string
}

export function CustomerHistoryDialog({
  open,
  onOpenChange,
  userName,
  avatar,
}: CustomerHistoryDialogProps) {
  return (
    <HistoryDialog
      open={open}
      onOpenChange={onOpenChange}
      userName={userName}
      avatar={avatar}
      title="Customer History"
    />
  )
}
