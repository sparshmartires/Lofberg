"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { BackButton } from "@/components/ui/back-button"
import { useState, useEffect } from "react"
import { useChangePasswordMutation } from "@/store/services/authApi"
import { useAutoDismiss } from "@/hooks/useAutoDismiss"

interface FormValues {
  password: string
  confirmPassword: string
}

export default function ChangePasswordPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string>("")
  const [currentPassword, setCurrentPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  useAutoDismiss(error, () => setError(""))
  const [changePassword, { isLoading }] = useChangePasswordMutation()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const passwordValue = watch("password")

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("firstLoginUserId")
    const storedPassword = sessionStorage.getItem("firstLoginPassword")

    if (storedUserId && storedPassword) {
      setUserId(storedUserId)
      setCurrentPassword(storedPassword)
    } else {
      setError("Invalid session. Please log in again.")
      router.push("/login")
    }
  }, [router])

  const onSubmit = async (data: FormValues) => {
    try {
      setError("")

      if (!userId || !currentPassword) {
        setError("Invalid session. Please log in again.")
        return
      }

      await changePassword({
        userId,
        currentPassword,
        newPassword: data.password,
      }).unwrap()

      // Clear session storage
      sessionStorage.removeItem("firstLoginUserId")
      sessionStorage.removeItem("firstLoginPassword")

      // Navigate to login to sign in with new password
      router.push("/login")
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.data?.error || err?.error || "Failed to change password"
      setError(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-[#F4F1F6] py-[40px]">
      <div className="w-full max-w-[880px] bg-white rounded-[28px] border border-[#EDEDED] px-8 py-12">

        <div className="mb-8">
          <BackButton onClick={() => router.push("/login")} />
        </div>

        <h1 className="text-[40px] leading-[120%] tracking-[-0.04em] text-[#1F1F1F] mb-4">
          Change password
        </h1>

        <p className="text-[16px] text-[#747474] mb-10">
          Your account requires a password change before you can continue.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          <div className="space-y-2">
            <label className="text-[16px] text-[#1F1F1F]">
              New password            </label>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Minimum 8 characters required",
                  },
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).+$/,
                    message: "Must include letter, number and special character",
                  },
                })}
                className="pr-12"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <p className="text-[12px] text-[#747474]">
              Minimum 8 characters, must include letter, number, and special character
            </p>

            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[16px] text-[#1F1F1F]">
              Confirm new password            </label>

            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (val) =>
                    val === passwordValue || "Passwords do not match",
                })}
                className="pr-12"
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full h-[48px] text-[16px]"
            disabled={isLoading}
          >
            {isLoading ? "Changing password..." : "Change password"}
          </Button>
        </form>
      </div>
    </div>
  )
}
