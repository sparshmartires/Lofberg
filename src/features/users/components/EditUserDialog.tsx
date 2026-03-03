"use client"

import { useState } from "react"
import { UserDialogForm, UserFormValues } from "./UserDialogForm"
import { useGetRolesQuery, useUpdateUserMutation } from "@/store/services/usersApi"

interface EditUserDialogProps {
  userId: string
  isActive: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: UserFormValues
}

export function EditUserDialog({
  userId,
  isActive,
  open,
  onOpenChange,
  defaultValues,
}: EditUserDialogProps) {
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()
  const { data: roles = [] } = useGetRolesQuery()
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

  const handleSubmit = async (data: UserFormValues) => {
    setSubmitError("")

    try {
      await updateUser({
        id: userId,
        body: {
          firstName: data.firstName,
          lastName: data.lastName || null,
          email: data.email,
          phoneNumber: data.phone || null,
          notes: data.notes || null,
          roleId: data.role,
          isActive,
          newPassword: data.password || null,
        },
      }).unwrap()

      onOpenChange(false)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error))
    }
  }

  return (
    <UserDialogForm
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

export type { UserFormValues }
