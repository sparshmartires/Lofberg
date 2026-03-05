"use client"

import { useState } from "react"
import { SalesDialogForm, SalesFormValues } from "./SalesDialogForm"
import {
  useCreateSalesRepresentativeMutation,
  useGetSalesRolesQuery,
} from "@/store/services/salesRepresentativesApi"

interface AddSalesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaleCreated: () => void
}

const splitFullName = (fullName: string) => {
  const [firstName, ...rest] = fullName.trim().split(" ")

  return {
    firstName: firstName || "",
    lastName: rest.join(" ").trim() || null,
  }
}

export function AddSalesDialog({ open, onOpenChange, onSaleCreated }: AddSalesDialogProps) {
  const [createSalesRepresentative, { isLoading: isCreating }] = useCreateSalesRepresentativeMutation()
  const { data: roles = [] } = useGetSalesRolesQuery()
  const [submitError, setSubmitError] = useState("")

  const handleOpenChange = (nextOpen: boolean) => {
    setSubmitError("")
    onOpenChange(nextOpen)
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

  const handleSubmit = async (data: SalesFormValues) => {
    setSubmitError("")

    const { firstName, lastName } = splitFullName(data.fullName)

    try {
      await createSalesRepresentative({
        firstName,
        lastName,
        email: data.email,
        phoneNumber: data.phone || null,
        notes: data.notes || null,
        roleId: data.role,
        isActive: data.status !== "inactive",
      }).unwrap()

      onSaleCreated()
    } catch (error) {
      setSubmitError(getApiErrorMessage(error))
    }
  }

  return (
    <SalesDialogForm
      mode="add"
      open={open}
      onOpenChange={handleOpenChange}
      roleOptions={roles}
      isSubmitting={isCreating}
      submitError={submitError}
      onSubmit={handleSubmit}
    />
  )
}
