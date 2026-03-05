"use client"

import { useState } from "react"
import { SalesDialogForm, SalesFormValues } from "./SalesDialogForm"
import {
  useGetSalesRolesQuery,
  useUpdateSalesRepresentativeMutation,
} from "@/store/services/salesRepresentativesApi"

interface EditSalesDialogProps {
  salesRepId: string
  currentIsActive: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: SalesFormValues
}

const splitFullName = (fullName: string) => {
  const [firstName, ...rest] = fullName.trim().split(" ")

  return {
    firstName: firstName || "",
    lastName: rest.join(" ").trim() || null,
  }
}

export function EditSalesDialog({
  salesRepId,
  currentIsActive,
  open,
  onOpenChange,
  defaultValues,
}: EditSalesDialogProps) {
  const [updateSalesRepresentative, { isLoading: isUpdating }] =
    useUpdateSalesRepresentativeMutation()
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
      await updateSalesRepresentative({
        id: salesRepId,
        body: {
          firstName,
          lastName,
          email: data.email,
          phoneNumber: data.phone || null,
          notes: data.notes || null,
          roleId: data.role,
          isActive: data.status ? data.status !== "inactive" : currentIsActive,
        },
      }).unwrap()

      onOpenChange(false)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error))
    }
  }

  return (
    <SalesDialogForm
      mode="edit"
      open={open}
      onOpenChange={handleOpenChange}
      defaultValues={defaultValues}
      roleOptions={roles}
      isSubmitting={isUpdating}
      submitError={submitError}
      onSubmit={handleSubmit}
    />
  )
}

export type { SalesFormValues }
