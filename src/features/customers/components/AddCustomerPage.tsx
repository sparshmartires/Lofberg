"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { useForm } from "react-hook-form"
import { CustomerDialogForm, CustomerFormValues } from "./CustomerDialogForm"

interface AddCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCustomerCreated: () => void
}

export function AddCustomerDialog({
  open,
  onOpenChange,
  onCustomerCreated,
}: AddCustomerDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CustomerFormValues>({
    defaultValues: {
      status: "active",
      isSubCustomer: false,
    },
  })

  const onSubmit = (data: CustomerFormValues) => {
    console.log("Customer Created:", data)
    onCustomerCreated()
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] max-w-[880px] rounded-[32px] p-10 bg-white max-h-[calc(100vh-2rem)] overflow-y-auto max-[600px]:p-8"
      >
        <div className="space-y-2">
          <DialogTitle className="text-[24px] font-normal">
            Add new Customer
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#747474]">
            Add new customer to your system
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CustomerDialogForm
            mode="add"
            control={control}
            register={register}
            errors={errors}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}