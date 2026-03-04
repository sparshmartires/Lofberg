"use client"

import { SalesDialogForm, SalesFormValues } from "./SalesDialogForm"

interface AddSalesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaleCreated: () => void
}

export function AddSalesDialog({ open, onOpenChange, onSaleCreated }: AddSalesDialogProps) {
  const onSubmit = (data: SalesFormValues) => {
    console.log("Sale Created:", data)
    onSaleCreated()
  }

  return (
    <SalesDialogForm mode="add" open={open} onOpenChange={onOpenChange} onSubmit={onSubmit} />
  )
}
