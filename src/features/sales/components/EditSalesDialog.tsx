"use client"

import { SalesDialogForm, SalesFormValues } from "./SalesDialogForm"

interface EditSalesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: SalesFormValues
}

export function EditSalesDialog({
  open,
  onOpenChange,
  defaultValues,
}: EditSalesDialogProps) {
  const onSubmit = (data: SalesFormValues) => {
    console.log("Sale Updated:", data)
    onOpenChange(false)
  }

  return (
    <SalesDialogForm
      mode="edit"
      open={open}
      onOpenChange={onOpenChange}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
    />
  )
}

export type { SalesFormValues }
