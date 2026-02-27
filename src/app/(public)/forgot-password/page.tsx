"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { ArrowLeft } from "lucide-react"
import { useForgotPasswordMutation } from "@/store/services/authApi"
import { useState } from "react"

interface FormValues {
  emailOrPhone: string
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [apiError, setApiError] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>()

  const onSubmit = async (data: FormValues) => {
    try {
      setApiError("")
      setSuccessMessage("")
      const response = await forgotPassword({
        email: data.emailOrPhone,
      }).unwrap()

      setSuccessMessage(response.message || "Reset code sent successfully. Please check your email.")
    } catch (err: any) {
      setSuccessMessage("")
      const errorMessage = err?.data?.message || err?.error || "Failed to send reset code"
      setApiError(errorMessage)
      setError("emailOrPhone", {
        type: "manual",
        message: errorMessage,
      })
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-[#F4F2F7] px-4 py-[40px]">

      <div className="w-full max-w-[667px] rounded-[28px] border border-[#EDEDED] bg-white px-[20px] py-[32px] sm:px-[32px] sm:py-[48px] flex flex-col gap-[32px]">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[14px] text-[#1F1F1F]"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Title Section */}
        <div className="space-y-3">
          <h1 className="text-[32px] sm:text-[40px] leading-[100%] tracking-[-0.5%] text-[#1F1F1F]">
            Reset Password
          </h1>

          <p className="text-[16px] leading-[150%] tracking-[-0.5%] text-[#747474] max-w-[520px]">
            Enter the email address associated with your account and we will email you the verification code to reset your password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <div className="mb-[16px]">
            <label className="text-[14px] text-[#1F1F1F] mb-[6px]">
              Email<span className="text-red-500">*</span>
            </label>

            <Input
              type="email"
              className="mt-[6px]"
              placeholder="Enter email"
              {...register("emailOrPhone", {
                required: "This field is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />

            {errors.emailOrPhone && (
              <p className="text-xs text-red-500 mt-[8px]">
                {errors.emailOrPhone.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-[220px]"
            disabled={isLoading || isSubmitting}
          >
            {isLoading ? "Sending..." : "Continue"}
          </Button>

          {successMessage && (
            <p className="text-sm text-[#1F1F1F]">
              {successMessage}
            </p>
          )}

          {apiError && (
            <p className="text-xs text-red-500">
              {apiError}
            </p>
          )}

        </form>
      </div>
    </div>
  )
}
