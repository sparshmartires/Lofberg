"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"
import { useChangePasswordMutation } from "@/store/services/authApi"
import { useAuth } from "@/store/hooks/useAuth"
import { useAutoDismiss } from "@/hooks/useAutoDismiss"

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
  general?: string
}

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).*$/
const PASSWORD_MIN_LENGTH = 8

const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return "Password is required"
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Minimum ${PASSWORD_MIN_LENGTH} characters`
  }
  if (!PASSWORD_REGEX.test(password)) {
    return "Must include letter, number, and special character"
  }
  return undefined
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  useAutoDismiss(errors.general, () => setErrors((prev) => ({ ...prev, general: undefined })))
  const [successMessage, setSuccessMessage] = useState("")
  useAutoDismiss(successMessage, () => setSuccessMessage(""))

  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const { user } = useAuth()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      newErrors.newPassword = passwordError
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Password confirmation is required"
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    setSuccessMessage("")
    setErrors({})

    if (!validateForm()) {
      return
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
      }).unwrap()

      setSuccessMessage("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      setTimeout(() => {
        onOpenChange(false)
        setSuccessMessage("")
      }, 2000)
    } catch (error: unknown) {
      const errorMessage = 
        (error as { data?: { message?: string } })?.data?.message || 
        "Failed to change password. Please try again."
      setErrors({ general: errorMessage })
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setErrors({})
      setSuccessMessage("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[520px] rounded-[28px] p-[32px] gap-6"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute right-6 top-6 disabled:opacity-50"
        >
          <X className="w-5 h-5 text-[#1F1F1F]" />
        </button>

        {/* TITLE */}
        <h2 className="text-[18px] font-semibold text-[#1F1F1F]">
          Password management
        </h2>

        {/* SUCCESS MESSAGE */}
        {successMessage && (
          <div className="rounded-[16px] border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {/* GENERAL ERROR */}
        {errors.general && (
          <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{errors.general}</p>
          </div>
        )}

        {/* FORM */}
        <div className="flex flex-col gap-5">

          {/* CURRENT PASSWORD */}
          <div className="space-y-2">
            <p className="text-sm">
              Current password<span className="text-red-500">*</span>
            </p>

            <Input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value)
                if (errors.currentPassword) {
                  setErrors((prev) => ({ ...prev, currentPassword: undefined }))
                }
              }}
              disabled={isLoading}
              className="h-[44px] rounded-full"
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-500">{errors.currentPassword}</p>
            )}
          </div>

          {/* NEW PASSWORD */}
          <div className="space-y-2">
            <p className="text-sm">
              New password<span className="text-red-500">*</span>
            </p>

            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                if (errors.newPassword) {
                  setErrors((prev) => ({ ...prev, newPassword: undefined }))
                }
              }}
              disabled={isLoading}
              className="h-[44px] rounded-full"
            />

            <p className="text-xs text-[#8A8A8A]">
              Minimum 8 characters, must include letter, number, and special character
            </p>
            {errors.newPassword && (
              <p className="text-xs text-red-500">{errors.newPassword}</p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="space-y-2">
            <p className="text-sm">
              Confirm new password<span className="text-red-500">*</span>
            </p>

            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                }
              }}
              disabled={isLoading}
              className="h-[44px] rounded-full"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-2">

          <Button
            variant="outlineBrand"
            className="rounded-full px-6"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            disabled={isLoading}
            onClick={handleSubmit}
            className="rounded-full px-6 bg-[#5B2D91] hover:bg-[#4A2378] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update password"
            )}
          </Button>

        </div>

      </DialogContent>
    </Dialog>
  )
}
