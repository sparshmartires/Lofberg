"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { useForm, useWatch } from "react-hook-form"
import { CustomerDialogForm, CustomerFormValues } from "./CustomerDialogForm"
import {
  useGetCustomerByIdQuery,
  useGetCustomerRegionsQuery,
  useGetCustomerSegmentsQuery,
  useUpdateCustomerMutation,
} from "@/store/services/customersApi"

interface EditCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  readOnly?: boolean
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function EditCustomerDialog({
  open,
  onOpenChange,
  customerId,
  readOnly = false,
}: EditCustomerDialogProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoRemoved, setLogoRemoved] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation()
  const { data: segmentOptions = [] } = useGetCustomerSegmentsQuery()
  const { data: regionOptions = [] } = useGetCustomerRegionsQuery()
  const hasValidCustomerId = UUID_REGEX.test(customerId)
  const { data: customer } = useGetCustomerByIdQuery(
    { id: customerId, includeHierarchy: true },
    {
      skip: !open || !hasValidCustomerId,
      refetchOnMountOrArgChange: true,
    }
  )

  const serviceTierDefaultValue = useMemo(() => {
    if (customer?.serviceTier === 1) return "1"
    if (customer?.serviceTier === 2) return "2"
    return ""
  }, [customer?.serviceTier])

  const {
    register,
    handleSubmit,
    control,
    trigger,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    defaultValues: {
      status: "active",
      isSubCustomer: false,
      parentCustomerId: "",
      logo: null,
    },
  })

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setLogoPreview(null)
      setLogoRemoved(false)
      setSubmitError("")
    }

    onOpenChange(nextOpen)
  }

  useEffect(() => {
    if (!open || !customerId) return

    if (customer && customer.id === customerId) {
      reset({
        customerName: customer.name || "",
        accountCode: customer.accountCode || "",
        industry: customer.segmentId || "",
        serviceTier: serviceTierDefaultValue,
        region: customer.regionId || "",
        isSubCustomer: customer.isSubCustomer,
        parentCustomerId: customer.parentCustomerId || "",
        contactPerson: customer.contactName || "",
        contactEmail: customer.contactEmail || "",
        contactPhone: customer.contactPhone || "",
        address: customer.address || "",
        status: customer.isActive ? "active" : "inactive",
        notes: customer.notes || "",
        logo: null,
      })
    } else {
      reset({
        customerName: "",
        accountCode: "",
        industry: "",
        serviceTier: "",
        region: "",
        isSubCustomer: false,
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
        status: "active",
        notes: "",
        logo: null,
      })
    }
  }, [open, customerId, customer, reset, serviceTierDefaultValue])

  const logoFile = useWatch({ control, name: "logo" })

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

  const handleLogoRemove = () => {
    setValue("logo", null)
    setLogoPreview(null)
    setLogoRemoved(true)
  }

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

  const onSubmit = async (data: CustomerFormValues) => {
    if (!hasValidCustomerId || !customer || customer.id !== customerId) return

    setSubmitError("")

    try {
      const logoFile = data.logo?.[0]
      await updateCustomer({
        id: customer.id,
        body: {
          name: data.customerName,
          accountCode: data.accountCode || null,
          segmentId: data.industry,
          serviceTier: Number(data.serviceTier),
          regionId: data.region,
          isSubCustomer: data.isSubCustomer,
          parentCustomerId: data.isSubCustomer ? data.parentCustomerId || null : null,
          contactName: data.contactPerson || null,
          contactEmail: data.contactEmail || null,
          contactPhone: data.contactPhone || null,
          address: data.address || null,
          isActive: data.status === "active",
          notes: data.notes || null,
          ...(logoFile ? { logo: logoFile } : {}),
          ...(logoRemoved && !logoFile ? { removeLogo: true } : {}),
        } as any,
      }).unwrap()

      onOpenChange(false)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error))
    }
  }

  if (!customerId || !hasValidCustomerId) return null

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] max-w-[880px] rounded-[32px] p-10 bg-white max-h-[calc(100vh-2rem)] overflow-y-auto"
      >
        <div className="space-y-2">
          <DialogTitle className="text-[24px] font-normal">
            {readOnly ? "Customer details" : "Edit customer"}
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#747474]">
            {readOnly ? "View customer information" : "Update customer information in your system"}
          </DialogDescription>
        </div>

        {readOnly ? (
          <fieldset disabled className="opacity-100">
            <CustomerDialogForm
              mode="edit"
              control={control}
              register={register}
              errors={{}}
              segmentOptions={segmentOptions}
              regionOptions={regionOptions}
              logoPreview={customer?.logoUrl || null}
              submitError=""
              isSubmitting={false}
              onCancel={() => handleDialogOpenChange(false)}
              hideActions
            />
          </fieldset>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CustomerDialogForm
              mode="edit"
              control={control}
              register={register}
              trigger={trigger}
              errors={errors}
              segmentOptions={segmentOptions}
              regionOptions={regionOptions}
              logoPreview={
                logoFile && logoFile.length > 0
                  ? logoPreview
                  : logoRemoved ? null : (customer?.logoUrl || null)
              }
              onLogoRemove={handleLogoRemove}
              submitError={submitError}
              isSubmitting={isUpdating}
              onCancel={() => handleDialogOpenChange(false)}
            />
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
