"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { useForm } from "react-hook-form"
import { CustomerDialogForm, CustomerFormValues } from "./CustomerDialogForm"

interface Customer {
  id: string
  customerName: string
  accountCode: string
  industry: string
  serviceTier: string
  region: string
  isSubCustomer: boolean
  contactPerson: string
  contactEmail: string
  contactPhone: string
  address: string
  status: string
  notes: string
  logoUrl?: string
}

interface EditCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onCustomerUpdated: (updated: Customer) => void
}

export function EditCustomerDialog({
  open,
  onOpenChange,
  customer,
  onCustomerUpdated,
}: EditCustomerDialogProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    defaultValues: {
      status: "active",
      isSubCustomer: false,
      logo: null,
    },
  })

  useEffect(() => {
    if (customer) {
      reset({
        customerName: customer.customerName,
        accountCode: customer.accountCode,
        industry: customer.industry,
        serviceTier: customer.serviceTier,
        region: customer.region,
        isSubCustomer: customer.isSubCustomer,
        contactPerson: customer.contactPerson,
        contactEmail: customer.contactEmail,
        contactPhone: customer.contactPhone,
        address: customer.address,
        status: customer.status,
        notes: customer.notes,
        logo: null,
      })
      setLogoPreview(customer.logoUrl || null)
    }
  }, [customer, reset])

  const logoFile = watch("logo")

  useEffect(() => {
    if (logoFile && logoFile.length > 0) {
      const file = logoFile[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [logoFile])

  const onSubmit = (data: CustomerFormValues) => {
    const { logo, ...rest } = data

    const updatedCustomer = {
      ...customer,
      ...rest,
    }

    console.log("Customer Updated:", updatedCustomer)
    //@ts-expect-error -- customer is confirmed non-null, spread merges types
    onCustomerUpdated(updatedCustomer)
    onOpenChange(false)
  }

  if (!customer) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] max-w-[880px] rounded-[32px] p-10 bg-white max-h-[calc(100vh-2rem)] overflow-y-auto max-[600px]:p-8"
      >
        <div className="space-y-2">
          <DialogTitle className="text-[24px] font-normal">
            Edit Customer
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#747474]">
            Update customer information in your system
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CustomerDialogForm
            mode="edit"
            control={control}
            register={register}
            errors={errors}
            logoPreview={logoPreview}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
