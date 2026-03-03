"use client"

import { useState } from "react"
import { UserDialogForm, UserFormValues } from "./UserDialogForm"
import { useCreateUserMutation, useGetRolesQuery } from "@/store/services/usersApi"

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserCreated: () => void
}

export function AddUserDialog({ open, onOpenChange, onUserCreated }: AddUserDialogProps) {
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation()
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
      await createUser({
        firstName: data.firstName,
        lastName: data.lastName || null,
        email: data.email,
        phoneNumber: data.phone || null,
        notes: data.notes || null,
        roleId: data.role,
      }).unwrap()

      onUserCreated()
    } catch (error) {
      setSubmitError(getApiErrorMessage(error))
    }
  }

  return (
    <UserDialogForm
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
