"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

interface FormValues {
  password: string
  confirmPassword: string
}

export default function ResetPasswordPage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const passwordValue = watch("password")

  const onSubmit = (data: FormValues) => {
    console.log("Password Reset:", data)

    // Navigate back to login
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F1F6] p-4">
      <div className="w-full max-w-[880px] bg-white rounded-[28px] border border-[#EDEDED] px-8 py-12">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[14px] text-[#1F1F1F] mb-8"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Title */}
        <h1 className="text-[40px] leading-[120%] tracking-[-0.04em] text-[#1F1F1F] mb-10">
          Reset Password
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* NEW PASSWORD */}
          <div className="space-y-2">
            <label className="text-[16px] text-[#1F1F1F]">
              New Password<span className="text-red-500">*</span>
            </label>

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
                    value:
                      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).+$/,
                    message:
                      "Must include letter, number and special character",
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
              <p className="text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="space-y-2">
            <label className="text-[16px] text-[#1F1F1F]">
              Confirm New Password<span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                {...register("confirmPassword", {
                  required: "Confirm password is required",
                  validate: (value) =>
                    value === passwordValue || "Passwords do not match",
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
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-start gap-6 pt-6">

            <div className="w-[200px]">
              <Button
                type="button"
                variant="outlineBrand"
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Cancel
              </Button>
            </div>

            <div className="w-[220px]">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
              >
                Reset Password
              </Button>
            </div>

          </div>

        </form>
      </div>
    </div>
  )
}
