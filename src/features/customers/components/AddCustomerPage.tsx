"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { useForm } from "react-hook-form"
import { CustomerDialogForm, CustomerFormValues } from "./CustomerDialogForm"
import {
  useCreateCustomerMutation,
  useGetCustomerRegionsQuery,
  useGetCustomerSegmentsQuery,
  useUploadCustomerLogoMutation,
} from "@/store/services/customersApi"

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
  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation()
  const [uploadCustomerLogo] = useUploadCustomerLogoMutation()
  const { data: segmentOptions = [] } = useGetCustomerSegmentsQuery()
  const { data: regionOptions = [] } = useGetCustomerRegionsQuery()
  const [submitError, setSubmitError] = useState("")

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

  const getApiErrorMessage = (error: unknown) => {
    if (typeof error === "object" && error !== null) {
      const errorObj = error as { data?: unknown; error?: string }

      if (typeof errorObj.error === "string" && errorObj.error.trim()) {
        return errorObj.error
      }

      if (typeof errorObj.data === "string" && errorObj.data.trim()) {
        return errorObj.data
      }

      if (typeof errorObj.data === "object" && errorObj.data !== null) {
        const dataObj = errorObj.data as Record<string, unknown>
        const possibleMessage = dataObj.error ?? dataObj.message ?? dataObj.title ?? dataObj.detail

        if (typeof possibleMessage === "string" && possibleMessage.trim()) {
          return possibleMessage
        }
      }
    }

    return "Request failed. Please try again."
  }

  const extractEntityId = (payload: unknown): string | null => {
    if (!payload || typeof payload !== "object") return null

    const source = payload as Record<string, unknown>
    const directId = source.id ?? source.customerId

    if (directId) {
      return String(directId)
    }

    const nested = source.data ?? source.result ?? source.payload ?? source.value
    if (nested && typeof nested === "object") {
      const nestedObject = nested as Record<string, unknown>
      const nestedId = nestedObject.id ?? nestedObject.customerId
      if (nestedId) {
        return String(nestedId)
      }
    }

    return null
  }

  const onSubmit = async (data: CustomerFormValues) => {
    setSubmitError("")

    try {
      const createResult = await createCustomer({
        name: data.customerName,
        accountCode: data.accountCode || null,
        segmentId: data.industry,
        serviceTier: Number(data.serviceTier),
        regionId: data.region,
        isSubCustomer: data.isSubCustomer,
        parentCustomerId: null,
        contactName: data.contactPerson || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        address: data.address || null,
        isActive: data.status === "active",
        notes: data.notes || null,
      }).unwrap()

      const logoFile = data.logo?.[0]
      const createdCustomerId = extractEntityId(createResult)

      if (logoFile && createdCustomerId) {
        await uploadCustomerLogo({ id: createdCustomerId, file: logoFile }).unwrap()
      }

      onCustomerCreated()
      reset()
      onOpenChange(false)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error))
    }
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
            register={register}
            control={control}
            errors={errors}
            segmentOptions={segmentOptions}
            regionOptions={regionOptions}
            submitError={submitError}
            isSubmitting={isCreating}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}